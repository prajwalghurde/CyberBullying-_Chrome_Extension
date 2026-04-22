import pickle
import re
import nltk
import os

def remove_pattern(input_txt, pattern):
    if(type(input_txt) == str):
        r = re.findall(pattern, input_txt)
        for i in r:
            input_txt = re.sub(i, '', input_txt)
        return input_txt
    else:
        return ""

def predict_text(text):
    with open('service_testing/LinearSVC.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('service_testing/tfidf_vector_vocabulary.pkl', 'rb') as f:
        vocabulary = pickle.load(f)
    with open('Dataset/stopwords.txt', 'r') as f:
        content_list = f.read().split("\n")
    text = remove_pattern(text, "@[\w]*")
    text = re.sub("[^a-zA-Z#]", " ", text)
    text = ' '.join([w for w in text.split() if len(w) > 3])
    tokens = text.split()
    lemmatizer = nltk.stem.WordNetLemmatizer()
    tokens = [lemmatizer.lemmatize(token) for token in tokens]
    processed_text = ' '.join(tokens)
    from sklearn.feature_extraction.text import TfidfVectorizer
    tfidf_vector = TfidfVectorizer(stop_words=content_list, lowercase=True, vocabulary=vocabulary)
    text_vector = tfidf_vector.fit_transform([processed_text])
    prediction = model.predict(text_vector)[0]
    probability = model.decision_function(text_vector)[0] if hasattr(model, 'decision_function') else None
    if prediction == 1:
        return "Bullying", probability
    else:
        return "Non-Bullying", probability

if __name__ == "__main__":
    print("Cyberbullying Detection System")
    print("Enter 'quit' to exit")
    print("-" * 30)
    while True:
        text = input("\nEnter text to analyze: ")
        if text.lower() == 'quit':
            break
        try:
            result, score = predict_text(text)
            print(f"Prediction: {result}")
            if score is not None:
                print(f"Confidence Score: {score:.4f}")
        except Exception as e:
            print(f"Error processing text: {e}")
    print("Goodbye!")