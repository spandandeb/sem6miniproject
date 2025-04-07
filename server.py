from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import pandas as pd
import numpy as np
import os
import joblib

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the model
model_path = os.path.join('src', 'ml_model.pkl')
try:
    model_data = joblib.load(model_path)
    print(f"Model loaded successfully from {model_path}")
    print(f"Model type: {type(model_data)}")
    # If model_data is a list, it might contain pre-computed match scores or coefficients
    if isinstance(model_data, list):
        print(f"Model contains {len(model_data)} items")
        if len(model_data) > 0:
            print(f"First item type: {type(model_data[0])}")
except Exception as e:
    print(f"Error loading model: {e}")
    model_data = None

@app.route('/api/predict', methods=['POST'])
def predict():
    if model_data is None:
        return jsonify({"error": "Model not loaded"}), 500
    
    try:
        data = request.json
        student_data = data.get('student')
        mentors_data = data.get('mentors')
        
        # Process each mentor and calculate match score
        results = []
        for mentor in mentors_data:
            # Create feature vector for this student-mentor pair
            features = create_feature_vector(student_data, mentor)
            
            # Since model_data is a list, we'll use it as a coefficient list
            # to calculate a weighted score based on our features
            if isinstance(model_data, list) and len(model_data) > 0:
                # If model_data is a list of coefficients, use them to calculate score
                # Make sure the feature vector length matches the coefficient list length
                coeffs = model_data[:len(features)] if len(model_data) >= len(features) else model_data + [1] * (len(features) - len(model_data))
                match_score = sum(f * c for f, c in zip(features, coeffs))
                # Normalize to 0-100 range
                match_score = int(min(100, max(0, match_score)))
            else:
                # Fallback to a simple scoring method
                match_score = simple_score_calculation(features)
            
            # Add match score to mentor data
            mentor_with_score = mentor.copy()
            mentor_with_score['matchScore'] = match_score
            results.append(mentor_with_score)
        
        # Sort by match score
        results.sort(key=lambda x: x['matchScore'], reverse=True)
        
        return jsonify({"mentors": results})
    
    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({"error": str(e)}), 500

def simple_score_calculation(features):
    """Simple fallback scoring method if the model data isn't usable"""
    # Assuming features are: [common_skills, industry_match, common_interests, location_match, experience_diff, rating, total_mentees]
    weights = [15, 20, 10, 10, -2, 5, 2]  # Negative weight for experience_diff as smaller is better
    
    # Adjust the experience_diff feature (index 4) to be inverse (10 - diff, but min 0)
    if len(features) > 4:
        features = list(features)  # Convert to list to allow modification
        features[4] = max(0, 10 - features[4])
    
    # Calculate weighted sum
    score = sum(f * w for f, w in zip(features[:len(weights)], weights[:len(features)]))
    
    # Ensure score is between 0-100
    return int(min(100, max(0, score)))

def create_feature_vector(student, mentor):
    """
    Create a feature vector for the student-mentor pair that matches what the model expects.
    """
    features = []
    
    # Skills match (count of common skills)
    student_skills = set(skill['name'].lower() for skill in student.get('skills', []))
    mentor_skills = set(skill['name'].lower() for skill in mentor.get('skills', []))
    common_skills = student_skills.intersection(mentor_skills)
    features.append(len(common_skills))
    
    # Industry match (binary: 1 if same industry, 0 otherwise)
    student_industry = student.get('industry', {}).get('id')
    mentor_industry = mentor.get('industry', {}).get('id')
    industry_match = 1 if student_industry == mentor_industry else 0
    features.append(industry_match)
    
    # Interests match (count of common interests)
    student_interests = set(interest.lower() for interest in student.get('interests', []))
    mentor_interests = set(interest.lower() for interest in mentor.get('interests', []))
    common_interests = student_interests.intersection(mentor_interests)
    features.append(len(common_interests))
    
    # Location match (binary: 1 if same location, 0 otherwise)
    location_match = 1 if student.get('location') == mentor.get('location') else 0
    features.append(location_match)
    
    # Experience years difference (absolute difference)
    experience_diff = abs(student.get('experienceYears', 0) - mentor.get('experienceYears', 0))
    features.append(experience_diff)
    
    # Mentor rating
    mentor_rating = mentor.get('rating', 0)
    features.append(mentor_rating)
    
    # Mentor total mentees
    total_mentees = mentor.get('totalMentees', 0)
    features.append(total_mentees)
    
    return np.array(features)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
