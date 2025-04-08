import sys
import json
import pickle
import numpy as np
from sklearn.preprocessing import StandardScaler

def main():
    # Read input data from stdin
    input_data = sys.stdin.read()
    data = json.loads(input_data)
    
    student = data['student']
    mentors = data['mentors']
    
    try:
        # Load the ML model from .pkl file
        import os
        # Look for the model in the src directory instead
        model_path = os.path.join(os.path.dirname(__file__), '../../src/ml_model.pkl')
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        
        # Process each mentor and calculate match score
        scored_mentors = []
        for mentor in mentors:
            # Extract features for the student-mentor pair
            features = extract_features(student, mentor)
            
            # Normalize features
            scaler = StandardScaler()
            features_scaled = scaler.fit_transform([features])[0]
            
            # Predict match score using the model
            match_score = model.predict([features_scaled])[0]
            
            # Scale score to 0-100 range
            match_score = min(100, max(0, int(match_score * 100)))
            
            # Add match score to mentor data
            scored_mentor = mentor.copy()
            scored_mentor['matchScore'] = match_score
            scored_mentors.append(scored_mentor)
        
        # Sort mentors by match score
        scored_mentors.sort(key=lambda x: x['matchScore'], reverse=True)
        
        # Return results
        result = {'mentors': scored_mentors}
        print(json.dumps(result))
        
    except Exception as e:
        # If model loading or prediction fails, use fallback calculation
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        sys.exit(1)

def extract_features(student, mentor):
    """Extract features from student and mentor data for ML model"""
    features = []
    
    # Skills match (count of common skills)
    student_skills = set(s['name'].lower() for s in student['skills'])
    mentor_skills = set(s['name'].lower() for s in mentor['skills'])
    common_skills = len(student_skills.intersection(mentor_skills))
    features.append(common_skills)
    
    # Industry match (binary)
    industry_match = 1 if student['industry']['id'] == mentor['industry']['id'] else 0
    features.append(industry_match)
    
    # Interests match (count of common interests)
    student_interests = set(i.lower() for i in student['interests'])
    mentor_interests = set(i.lower() for i in mentor['interests'])
    common_interests = len(student_interests.intersection(mentor_interests))
    features.append(common_interests)
    
    # Location match (binary)
    location_match = 1 if student['location'] == mentor['location'] else 0
    features.append(location_match)
    
    # Experience years difference
    experience_diff = abs(student['experienceYears'] - mentor['experienceYears'])
    features.append(experience_diff)
    
    # Mentor rating
    features.append(mentor['rating'])
    
    # Mentor total mentees
    features.append(mentor['totalMentees'])
    
    return features

if __name__ == "__main__":
    main()
