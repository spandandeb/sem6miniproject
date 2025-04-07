from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model
model_path = os.path.join('src', 'ml_model.pkl')
try:
    with open(model_path, 'rb') as f:
        model = pickle.load(f)
    print(f"Model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.json
        student_data = data.get('student')
        mentors_data = data.get('mentors')
        
        # Process student data
        # This will need to be adjusted based on what your model expects
        student_features = extract_features(student_data)
        
        # Process each mentor and calculate match score
        results = []
        for mentor in mentors_data:
            mentor_features = extract_features(mentor)
            
            # Calculate match score using the model
            # This is a placeholder - adjust based on your model's input requirements
            combined_features = np.concatenate([student_features, mentor_features])
            match_score = float(model.predict([combined_features])[0])
            
            # Add match score to mentor data
            mentor_with_score = mentor.copy()
            mentor_with_score['matchScore'] = match_score
            results.append(mentor_with_score)
        
        # Sort by match score
        results.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return jsonify({"mentors": results})
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

def extract_features(user_data):
    """
    Extract features from user data in a format suitable for the model.
    This function needs to be customized based on your model's expected input.
    """
    # This is a placeholder - replace with actual feature extraction logic
    # based on your model's training data format
    features = []
    
    # Example feature extraction (modify based on your model):
    if 'skills' in user_data:
        # Convert skills to one-hot encoding or other representation
        skills_features = [skill['name'].lower() for skill in user_data.get('skills', [])]
        features.extend(skills_features)
    
    if 'industry' in user_data:
        # Add industry as a feature
        features.append(user_data.get('industry', {}).get('name', ''))
    
    if 'interests' in user_data:
        # Add interests as features
        interests_features = [interest.lower() for interest in user_data.get('interests', [])]
        features.extend(interests_features)
    
    if 'location' in user_data:
        # Add location as a feature
        features.append(user_data.get('location', ''))
    
    # Convert to numerical features (this is just a placeholder)
    # In a real implementation, you would need to use the same feature
    # extraction/encoding that was used during model training
    numerical_features = [hash(f) % 100 for f in features]
    
    return np.array(numerical_features)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
