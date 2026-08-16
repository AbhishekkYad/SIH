import httpx
import asyncio

async def run_e2e():
    print("Starting Final Full E2E Verification Script...")
    async with httpx.AsyncClient(timeout=60.0) as client:
        # 1. Login
        print("\n--- 1. Authentication ---")
        login_res = await client.post("http://localhost:8000/api/v1/auth/login", json={
            "username": "john_producer", 
            "password": "password123", 
            "role": "producer", 
            "org_id": "11111111-1111-4111-a111-111111111111"
        })
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print("Logged in successfully.")
        
        # 2. Create Product
        print("\n--- 2. Product Registration ---")
        product_res = await client.post("http://localhost:8000/api/v1/products", json={
            "name": "E2E Final Orange", 
            "sku": "SKU-FINAL-001", 
            "category": "RAW_MATERIAL", 
            "specifications": {}
        }, headers=headers)
        print("Product Created:", product_res.status_code)
        product_id = product_res.json().get("product_id")
        
        # 3. Create Batch
        print("\n--- 3. Batch Registration ---")
        batch_res = await client.post("http://localhost:8000/api/v1/batches", json={
            "product_id": product_id, 
            "quantity": 1000, 
            "unit_of_measure": "KG"
        }, headers=headers)
        print("Batch Created:", batch_res.status_code)
        batch_id = batch_res.json().get("batch_id")
        
        # Wait for Fabric Webhook to sync to D1
        print("\nWaiting for D1 Webhook sync (5s)...")
        await asyncio.sleep(5)
        
        # 4. QR Scan / Traceability (Resolve)
        print("\n--- 4. QR Traceability & Scan ---")
        qr_res = await client.post("http://localhost:8000/api/v1/qr/resolve", json={
            "qr_reference": batch_id
        }, headers=headers)
        print("QR Resolve (Traceability):", qr_res.status_code)
        if qr_res.status_code != 200:
            print("Error response:", qr_res.text)
        else:
            print("Scan History length:", len(qr_res.json().get("scan_history", [])))
        
        # 5. Inner Authenticity
        print("\n--- 5. Inner Authenticity Verification ---")
        auth_res = await client.post("http://localhost:8000/api/v1/qr/verify-credential", json={
            "inner_credential_code": "SECRET-HASH-1234",
            "unit_or_batch_id": batch_id
        }, headers=headers)
        print("Authenticity Verified:", auth_res.json()["authenticity"]["verified"])
        
        # 6. Evidence Upload (IPFS)
        print("\n--- 6. IPFS Evidence ---")
        # Ensure we have multipart/form-data for file upload
        files = {'file': ('evidence.txt', b'Mock Certificate Content', 'text/plain')}
        ev_res = await client.post("http://localhost:8000/api/v1/evidence/upload", files=files, headers=headers)
        print("Evidence Uploaded:", ev_res.status_code)
        cid = ev_res.json().get("cid")
        
        # 7. Feedback & Escalation
        print("\n--- 7. Consumer Feedback & Escalation ---")
        # Submit 3 complaints to trigger threshold
        for i in range(3):
            fb_res = await client.post("http://localhost:8000/api/v1/feedback/submit", json={
                "batch_or_unit_id": batch_id,
                "category": "QUALITY",
                "description": f"Complaint {i+1} about product",
                "evidence_filename": None,
                "evidence_base64": None
            }, headers=headers)
            print(f"Complaint {i+1} Status:", fb_res.json().get("status"))

        # Wait to allow background state propagation if any
        await asyncio.sleep(2)

if __name__ == "__main__":
    asyncio.run(run_e2e())
