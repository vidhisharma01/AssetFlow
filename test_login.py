import urllib.request
import json

url = 'http://127.0.0.1:8000/api/v1/identity/auth/login'
data = json.dumps({'email': 'admin@assetflow.com', 'password': 'password123'}).encode('utf-8')
req = urllib.request.Request(url, data=data)
req.add_header('Content-Type', 'application/json')

print(f"Attempting to log in to: {url}")
try:
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read().decode('utf-8'))
        print("✅ SUCCESS! Login form accepted the credentials.")
        print(f"Access Token: {result['access_token'][:30]}...")
        print(f"Logged in User: {result['user']['first_name']} {result['user']['last_name']}")
except urllib.error.HTTPError as e:
    err_data = json.loads(e.read().decode('utf-8'))
    print(f"❌ FAILED: {err_data.get('detail', 'Unknown error')}")
except Exception as e:
    print(f"❌ CRITICAL FAILURE: {e}")
