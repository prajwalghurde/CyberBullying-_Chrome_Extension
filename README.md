# Cyberbullying Detection API

A FastAPI backend service that loads a trained LinearSVC model and TF-IDF vectorizer to detect cyberbullying in text.

## Features

- Loads trained LinearSVC model and TF-IDF vectorizer from pickle files
- Exposes RESTful API endpoints for text classification
- Returns both prediction label and confidence score
- Built-in health check endpoints
- Proper error handling and validation

## Endpoints

### GET /
Health check endpoint that returns basic service status.

**Response:**
```json
{
  "message": "Cyberbullying Detection API is running!",
  "status": "healthy",
  "model_loaded": true
}
```

### GET /health
Detailed health check showing status of all loaded components.

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "vocabulary_loaded": true,
  "stopwords_loaded": true
}
```

### POST /predict
Main prediction endpoint that classifies text as bullying or non-bullying.

**Request Body:**
```json
{
  "text": "Your text to classify here"
}
```

**Response:**
```json
{
  "label": "Bullying",
  "confidence": 1.4817,
  "message": "Text classified as Bullying"
}
```

## Setup and Installation

1. **Install dependencies:**
```bash
pip install fastapi==0.104.1 uvicorn==0.24.0 pydantic==2.5.0
```

2. **Start the server:**
```bash
python fastapi_backend.py
```

3. **Access the API:**
   - Server runs on: `http://localhost:8000`
   - Interactive API docs: `http://localhost:8000/docs`
   - ReDoc documentation: `http://localhost:8000/redoc`

## Usage Examples

### Using curl:
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "Content-Type: application/json" \
  -d '{"text":"You are so stupid and worthless"}'
```

### Using Python requests:
```python
import requests

response = requests.post(
    "http://localhost:8000/predict",
    json={"text": "You are so stupid and worthless"},
    headers={"Content-Type": "application/json"}
)

print(response.json())
# Output: {'label': 'Bullying', 'confidence': 1.4817, 'message': 'Text classified as Bullying'}
```

### Using PowerShell:
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/predict" -Method POST -Body '{"text":"You are so stupid and worthless"}' -ContentType "application/json" -UseBasicParsing
```

## Model Details

- **Algorithm**: Linear Support Vector Classifier (LinearSVC)
- **Vectorization**: TF-IDF with custom vocabulary
- **Preprocessing**: 
  - Removal of @mentions
  - Keep only alphabetic characters and #
  - Remove words shorter than 4 characters
  - Tokenization and lemmatization
  - Stopword removal

## Confidence Scores

The confidence score is derived from the model's decision function:
- **Positive values**: Indicates bullying (distance from hyperplane)
- **Negative values**: Indicates non-bullying (distance from hyperplane)
- **Higher absolute values**: Higher confidence in prediction

## Test the API

Run the included test suite:
```bash
python test_api.py
```

This will test various examples including:
- Clear bullying cases
- Subtle bullying language
- Positive messages
- Neutral content
- Messages with social media mentions

## File Structure

```
d:\Girish_final\
├── fastapi_backend.py              # Main FastAPI application
├── test_api.py                     # Test script with examples
├── requirements.txt                # Dependencies
├── predict.py                      # Original terminal-based predictor
├── Dataset/
│   └── stopwords.txt              # Stopwords list
└── service_testing/
    ├── LinearSVC.pkl              # Trained model
    └── tfidf_vector_vocabulary.pkl # TF-IDF vocabulary
```

## Requirements

- Python 3.8+
- FastAPI 0.104.1
- Uvicorn 0.24.0
- Scikit-learn 1.3.0
- NLTK 3.8.1
- Pydantic 2.5.0

## Notes

- The model was trained with scikit-learn 1.0.2 but is compatible with 1.3.0 (warning will appear but won't affect functionality)
- NLTK data is automatically downloaded on first run
- The API handles text preprocessing identically to the training phase