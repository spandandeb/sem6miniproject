import pickle
import os

try:
    # Try to load the model from the src directory
    model_path = os.path.join('src', 'ml_model.pkl')
    print(f'Checking if model exists: {os.path.exists(model_path)}')
    
    if os.path.exists(model_path):
        with open(model_path, 'rb') as f:
            model = pickle.load(f)
        print('Model loaded successfully!')
        print(f'Model type: {type(model)}')
    else:
        print('Model file not found at path:', model_path)
except Exception as e:
    print(f'Error loading model: {e}')
