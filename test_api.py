import requests
import json

# Sample student and mentor data for testing
test_data = {
    "student": {
        "id": 1,
        "name": "Test Student",
        "email": "test@example.com",
        "role": "Student",
        "skills": [
            {"id": 1, "name": "JavaScript"},
            {"id": 2, "name": "React"}
        ],
        "interests": ["Web Development", "UI Design"],
        "bio": "Test student bio",
        "location": "Bangalore",
        "industry": {"id": 1, "name": "Technology"},
        "experienceYears": 1
    },
    "mentors": [
        {
            "id": 103,
            "name": "Raj Patel",
            "email": "raj.patel@example.com",
            "role": "Alumni",
            "skills": [
                {"id": 7, "name": "Java"},
                {"id": 8, "name": "Spring Boot"},
                {"id": 9, "name": "Microservices"}
            ],
            "interests": ["Backend Development", "System Design", "Cloud Computing"],
            "bio": "Enterprise software architect specializing in scalable backend systems.",
            "location": "Bangalore",
            "industry": {"id": 1, "name": "Technology"},
            "experienceYears": 12,
            "company": "TechSolutions",
            "position": "Principal Architect",
            "availability": ["Weekday Evenings"],
            "rating": 4.7,
            "totalMentees": 20,
            "profileImage": "https://randomuser.me/api/portraits/men/22.jpg",
            "graduationYear": 2010
        }
    ]
}

try:
    # Send request to the prediction API
    response = requests.post('http://localhost:5000/api/predict', json=test_data)
    
    if response.status_code == 200:
        result = response.json()
        print("API Response:", json.dumps(result, indent=2))
        
        # Check if Raj Patel has a match score
        if 'mentors' in result and len(result['mentors']) > 0:
            raj = result['mentors'][0]
            if 'matchScore' in raj:
                print(f"\nRaj Patel's match score: {raj['matchScore']}%")
            else:
                print("\nNo match score found for Raj Patel")
    else:
        print(f"API request failed with status code: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Error making API request: {e}")
