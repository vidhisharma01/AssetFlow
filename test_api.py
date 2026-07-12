import urllib.request
import json

def test_api():
    base_url = "http://127.0.0.1:8000/api/v1/assets"
    
    # 1. Create Category
    req = urllib.request.Request(f"{base_url}/categories", method="POST", 
                                 data=json.dumps({"name": "Test Cat 1", "description": "Test"}).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        res = urllib.request.urlopen(req)
        cat = json.loads(res.read())
        print("✅ Category created:", cat)
    except Exception as e:
        print("Failed to create category:", e.read() if hasattr(e, 'read') else e)
        return

    # 2. Create Asset
    req = urllib.request.Request(f"{base_url}/", method="POST", 
                                 data=json.dumps({"name": "Test Asset", "serial_number": "TEST-123", "category_id": cat['id']}).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        res = urllib.request.urlopen(req)
        asset = json.loads(res.read())
        print("✅ Asset created:", asset)
    except Exception as e:
        print("Failed to create asset:", e.read() if hasattr(e, 'read') else e)
        return
        
    # 3. Allocate Asset
    req = urllib.request.Request(f"{base_url}/{asset['id']}/allocate", method="POST", 
                                 data=json.dumps({"asset_id": asset['id'], "assigned_to_id": 99, "notes": "Test"}).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        res = urllib.request.urlopen(req)
        allocated = json.loads(res.read())
        print("✅ Asset allocated:", allocated)
    except Exception as e:
        print("Failed to allocate asset:", e.read() if hasattr(e, 'read') else e)
        return

    # 4. Allocate Asset AGAIN (Should Fail)
    req = urllib.request.Request(f"{base_url}/{asset['id']}/allocate", method="POST", 
                                 data=json.dumps({"asset_id": asset['id'], "assigned_to_id": 100, "notes": "Test 2"}).encode(),
                                 headers={"Content-Type": "application/json"})
    try:
        urllib.request.urlopen(req)
        print("❌ Double allocation succeeded (THIS IS A BUG)")
    except urllib.error.HTTPError as e:
        if e.code == 400:
            print("✅ Double allocation prevented! (State machine works)")
        else:
            print("❌ Double allocation failed with unexpected error:", e.code)

test_api()
