"""
Test script for the FastAPI Cyberbullying Detection API
Demonstrates various prediction examples
"""

import requests
import json

# API endpoint
BASE_URL = "http://localhost:8000"

def test_health():
    """Test the health endpoint"""
    print("Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print("-" * 50)

def test_prediction(text, description):
    """Test prediction endpoint with given text"""
    print(f"Testing: {description}")
    print(f"Text: '{text}'")
    
    payload = {"text": text}
    response = requests.post(
        f"{BASE_URL}/predict",
        json=payload,
        headers={"Content-Type": "application/json"}
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"Label: {result['label']}")
        print(f"Confidence: {result['confidence']:.4f}")
        print(f"Message: {result['message']}")
    else:
        print(f"Error: {response.text}")
    print("-" * 50)

def main():
    """Run all tests"""
    print("Cyberbullying Detection API Test Suite")
    print("=" * 50)
    
    # Test health endpoint
    test_health()
    
    # Test various examples
    test_cases = [
        ("You are so stupid and worthless", "Clear bullying example"),
        ("I hate you and hope you die", "Strong bullying language"),
        ("You are a complete idiot", "Insult-based bullying"),
        ("Have a great day and stay safe", "Positive message"),
        ("The weather is beautiful today", "Neutral content"),
        ("Thanks for helping me out", "Gratitude expression"),
        ("@username you should kill yourself", "Social media bullying with mention"),
        ("This is amazing work!", "Positive feedback"),
        ("Go away loser", "Direct insult"),
        ("Hope you have a wonderful weekend", "Kind message")
    ]
    
    for text, description in test_cases:
        test_prediction(text, description)

if __name__ == "__main__":
    main()