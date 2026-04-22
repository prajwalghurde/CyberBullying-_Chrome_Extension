import pickle
import re
import nltk
from typing import Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
import numpy as np
from explain import get_explanation

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('wordnet')

class TextRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    label: str
    confidence: float
    message: str
    explanation: List[str]
    severity: str = ""
    suggestion: str = ""

app = FastAPI(
    title="Cyberbullying Detection API",
    description="API for detecting cyberbullying in text using LinearSVC model",
    version="1.0.0"
)

model = None
vocabulary = None
stopwords_list = None

def load_model_and_resources():
    global model, vocabulary, stopwords_list
    try:
        with open('service_testing/LinearSVC.pkl', 'rb') as f:
            model = pickle.load(f)
        with open('service_testing/tfidf_vector_vocabulary.pkl', 'rb') as f:
            vocabulary = pickle.load(f)
        with open('Dataset/stopwords.txt', 'r', encoding='utf-8') as f:
            stopwords_list = f.read().split("\n")
        print("Model and resources loaded successfully!")
        return True
    except Exception as e:
        print(f"Error loading model/resources: {e}")
        return False

def remove_pattern(input_txt: str, pattern: str) -> str:
    if isinstance(input_txt, str):
        r = re.findall(pattern, input_txt)
        for i in r:
            input_txt = re.sub(i, '', input_txt)
        return input_txt
    else:
        return ""

def preprocess_text(text: str) -> str:
    text = remove_pattern(text, "@[\w]*")
    text = re.sub("[^a-zA-Z#]", " ", text)
    text = ' '.join([w for w in text.split() if len(w) > 3])
    tokens = text.split()
    lemmatizer = nltk.stem.WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    return ' '.join(tokens)

def get_confidence_score(model, text_vector) -> float:
    if hasattr(model, 'decision_function'):
        score = float(model.decision_function(text_vector)[0])
        return 1 / (1 + np.exp(-score))
    elif hasattr(model, 'predict_proba'):
        probabilities = model.predict_proba(text_vector)[0]
        return float(max(probabilities))
    else:
        prediction = model.predict(text_vector)[0]
        return 1.0

def get_severity_and_suggestion(label: str, confidence: float) -> tuple:
    """Determine severity level and provide suggestion based on label and confidence."""
    if label == "Bullying":
        if confidence >= 0.85:
            severity = "Severe"
            suggestion = "This text contains highly offensive language. Please reconsider posting this content as it may cause serious harm to others."
        elif confidence >= 0.70:
            severity = "Offensive"
            suggestion = "This text appears to contain inappropriate language. Consider rephrasing to maintain respectful communication."
        else:
            severity = "Mild"
            suggestion = "This text may be perceived as slightly inappropriate. Review your wording to ensure it's respectful."
    else:
        severity = "Safe"
        suggestion = "This text appears to be respectful and appropriate for posting."
    
    return severity, suggestion

@app.on_event("startup")
async def startup_event():
    success = load_model_and_resources()
    if not success:
        raise RuntimeError("Failed to load model and resources")

@app.get("/")
async def root():
    return {
        "message": "Cyberbullying Detection API is running!",
        "status": "healthy",
        "model_loaded": model is not None
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: TextRequest):
    if model is None or vocabulary is None or stopwords_list is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    try:
        processed_text = preprocess_text(request.text)
        if not processed_text.strip():
            raise HTTPException(status_code=400, detail="Text preprocessing resulted in empty string")
        from sklearn.feature_extraction.text import TfidfVectorizer
        tfidf_vector = TfidfVectorizer(
            stop_words=stopwords_list,
            lowercase=True,
            vocabulary=vocabulary
        )
        text_vector = tfidf_vector.fit_transform([processed_text])
        prediction = model.predict(text_vector)[0]
        confidence = get_confidence_score(model, text_vector)
        explanation_words = get_explanation(processed_text, model, tfidf_vector)
        label = "Bullying" if prediction == 1 else "Non-Bullying"
        severity, suggestion = get_severity_and_suggestion(label, confidence)
        return PredictionResponse(
            label=label,
            confidence=confidence,
            message=f"Text classified as {label}",
            explanation=explanation_words,
            severity=severity,
            suggestion=suggestion
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "vocabulary_loaded": vocabulary is not None,
        "stopwords_loaded": stopwords_list is not None
    }

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)