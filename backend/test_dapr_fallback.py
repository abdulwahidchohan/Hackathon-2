import requests
import sys
import jwt
import time

BASE_URL = "http://127.0.0.1:8001"
SECRET = "change-me-in-production"  # Testing if backend uses default

def generate_token(user_id):
    payload = {
        "sub": user_id,
        "userId": user_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + 3600
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")

def test_create_task_with_dapr_failure():
    print("Testing task creation with expected Dapr failure...")
    
    # payload
    user_id = "test_user_dapr"
    token = generate_token(user_id)
    headers = {"Authorization": f"Bearer {token}"}
    
    task_data = {
        "title": "Test Dapr Fallback",
        "description": "This task should be created even if Dapr is down.",
        "priority": "high",
        "tags": "test"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/{user_id}/tasks", json=task_data, headers=headers)
        if response.status_code == 200:
            print("SUCCESS: Task created successfully despite Dapr being offline.")
            print("Response:", response.json())
        else:
            print(f"FAILURE: Failed to create task. Status: {response.status_code}, Response: {response.text}")
            sys.exit(1)
            
    except requests.exceptions.ConnectionError:
        print("FAILURE: Could not connect to backend. Is it running?")
        sys.exit(1)

if __name__ == "__main__":
    test_create_task_with_dapr_failure()
