import json
import urllib.request
from datetime import datetime, timedelta

BASE_URL = "http://127.0.0.1:8000/api/v1/assets"

def make_request(url, method="GET", data=None):
    req = urllib.request.Request(url, method=method)
    req.add_header('Content-Type', 'application/json')
    req.add_header('Accept', 'application/json')
    data_bytes = None
    if data:
        data_bytes = json.dumps(data).encode('utf-8')
    try:
        with urllib.request.urlopen(req, data=data_bytes) as response:
            return response.getcode(), json.loads(response.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def print_res(code, data, msg):
    print(f"\n--- {msg} ---")
    print(f"Status Code: {code}")
    print(json.dumps(data, indent=2))

# 1. Create category
code, data = make_request(f"{BASE_URL}/categories", "POST", {"name": "Test Category " + str(datetime.now().timestamp()), "description": "For testing"})
print_res(code, data, "Create Category")
category_id = data.get("id")
if not category_id:
    exit(1)

# 2. Create asset
asset_data = {
    "name": "Test Asset",
    "serial_number": "SN-TEST-" + str(int(datetime.now().timestamp())),
    "asset_tag": "TAG-" + str(int(datetime.now().timestamp())),
    "department": "IT",
    "location": "NY Office",
    "category_id": category_id
}
code, data = make_request(f"{BASE_URL}/", "POST", asset_data)
print_res(code, data, "Create Asset")
asset_id = data.get("id")

# 3. Allocate asset
alloc_data = {
    "asset_id": asset_id,
    "assigned_to_id": 99,
    "notes": "Testing allocation",
    "expected_return_date": (datetime.utcnow() + timedelta(days=7)).isoformat()
}
code, data = make_request(f"{BASE_URL}/{asset_id}/allocate", "POST", alloc_data)
print_res(code, data, "Allocate Asset")

# 4. Get Asset Details
code, data = make_request(f"{BASE_URL}/{asset_id}", "GET")
print_res(code, data, "Asset Details (Should see allocation)")

# 5. Return Asset
code, data = make_request(f"{BASE_URL}/{asset_id}/return", "POST", {"notes": "Returned in good condition"})
print_res(code, data, "Return Asset")

# 6. Get Asset Details Again
code, data = make_request(f"{BASE_URL}/{asset_id}", "GET")
print_res(code, data, "Final Asset Details (Should be AVAILABLE with end date on allocation)")
