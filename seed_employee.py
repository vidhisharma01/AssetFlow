import urllib.request
import json

url = 'http://127.0.0.1:8000/api/v1/identity/auth/signup'
data = json.dumps({
    'email': 'employee@assetflow.com', 
    'password': 'password123',
    'first_name': 'Test',
    'last_name': 'Employee',
    'employee_id': 'EMP-001'
}).encode('utf-8')

req = urllib.request.Request(url, data=data)
req.add_header('Content-Type', 'application/json')

try:
    with urllib.request.urlopen(req) as response:
        print("✅ SUCCESS! Employee created.")
except urllib.error.HTTPError as e:
    print(f"FAILED: {e.read().decode('utf-8')}")
