import pickle
import numpy as np
from sklearn.ensemble import RandomForestRegressor

# Create a simple model for mentor matching
def create_model():
    # Create a random forest regressor
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    
    # Create some sample training data
    # Features: [skills_match, industry_match, interests_match, location_match, 
    #            experience_diff, mentor_rating, mentor_mentees]
    X = np.array([
        [3, 1, 2, 1, 2, 4.8, 12],  # High match
        [2, 1, 1, 1, 3, 4.5, 8],   # Medium-high match
        [1, 1, 1, 0, 5, 4.2, 5],   # Medium match
        [1, 0, 1, 0, 8, 3.9, 3],   # Low-medium match
        [0, 0, 0, 0, 10, 3.5, 1],  # Low match
    ])
    
    # Target scores (0-1 range, will be scaled to 0-100 in the prediction script)
    y = np.array([0.9, 0.75, 0.6, 0.4, 0.2])
    
    # Train the model
    model.fit(X, y)
    
    # Save the model to a pickle file
    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)
    
    print("Model created and saved as model.pkl")

if __name__ == "__main__":
    create_model()
