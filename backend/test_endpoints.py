import json
import time
import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

def send_request(method, path, data=None):
    url = f"{BASE_URL}{path}"
    headers = {"Content-Type": "application/json"}
    req_data = json.dumps(data).encode("utf-8") if data else None
    
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            return response.status, json.loads(res_body) if res_body else None
    except urllib.error.HTTPError as e:
        res_body = e.read().decode("utf-8")
        try:
            err_details = json.loads(res_body)
        except Exception:
            err_details = res_body
        return e.code, err_details
    except Exception as e:
        return 500, str(e)

def print_result(title, status_code, body):
    print(f"\n==================================================")
    print(f" TEST: {title}")
    print(f"==================================================")
    print(f"Status Code: {status_code}")
    print(f"Response Body:\n{json.dumps(body, indent=2)}")

def main():
    print("Starting Closira API End-to-End Test Suite...")
    
    # 1. Health Check
    status, res = send_request("GET", "/health")
    print_result("1. Health Check", status, res)
    
    # 2. Create Pricing SOP Enquiry
    pricing_payload = {
        "customer_name": "Alice Smith",
        "channel": "whatsapp",
        "message": "Hi, I am looking to get a price quote. How much do your SMB plans cost?"
    }
    status, res = send_request("POST", "/enquiry", pricing_payload)
    print_result("2. Create Pricing Enquiry (Instant Response)", status, res)
    alice_id = res.get("enquiry_id") if status == 201 else 1

    # 3. Create Booking SOP Enquiry
    booking_payload = {
        "customer_name": "Bob Johnson",
        "channel": "email",
        "message": "Hello, I want to book a slot for a meeting to discuss standard operating procedures."
    }
    status, res = send_request("POST", "/enquiry", booking_payload)
    print_result("3. Create Booking Enquiry (Instant Response)", status, res)
    bob_id = res.get("enquiry_id") if status == 201 else 2

    # 4. Create Fallback Escalation Enquiry
    fallback_payload = {
        "customer_name": "Diana Prince",
        "channel": "whatsapp",
        "message": "Hey there! I am just browsing around, having a lovely day."
    }
    status, res = send_request("POST", "/enquiry", fallback_payload)
    print_result("4. Create Fallback Enquiry (Instant Response)", status, res)
    diana_id = res.get("enquiry_id") if status == 201 else 3

    # Wait for background task processing to execute
    print("\nWaiting 2 seconds for background task workers to process...")
    time.sleep(2)

    # 5. Fetch Alice History (SOP Matched Pricing)
    status, res = send_request("GET", f"/enquiry/{alice_id}/history")
    print_result(f"5. Get Alice (ID {alice_id}) History (Should be Qualified & matched to Pricing SOP)", status, res)

    # 6. Fetch Diana History (Should be Auto-Escalated)
    status, res = send_request("GET", f"/enquiry/{diana_id}/history")
    print_result(f"6. Get Diana (ID {diana_id}) History (Should be Escalated)", status, res)

    # 7. Schedule a Follow-up for Alice
    followup_payload = {
        "delay_minutes": 15,
        "message_template": "Hi Alice, checking back to see if you have any questions on pricing packages."
    }
    status, res = send_request("POST", f"/enquiry/{alice_id}/follow-up", followup_payload)
    print_result(f"7. Schedule Follow-up for Alice (ID {alice_id})", status, res)

    # 8. Manually Escalate Bob
    escalate_payload = {
        "reason": "Bob requested a call-back from a manager specifically."
    }
    status, res = send_request("POST", f"/enquiry/{bob_id}/escalate", escalate_payload)
    print_result(f"8. Manually Escalate Bob (ID {bob_id})", status, res)

    # 9. Get updated Bob History to verify manual escalation event added to timeline
    status, res = send_request("GET", f"/enquiry/{bob_id}/history")
    print_result(f"9. Get updated Bob (ID {bob_id}) History & Timeline", status, res)

    # 10. Test error boundary (Non-existing ID)
    status, res = send_request("GET", "/enquiry/9999/history")
    print_result("10. Error boundary: Get Non-existing ID (Should return 404)", status, res)

    # 11. Test error boundary (Invalid Input payload)
    invalid_payload = {
        "customer_name": "Bad Payload",
        "channel": "instagram",  # Invalid channel
        "message": "Hello"
    }
    status, res = send_request("POST", "/enquiry", invalid_payload)
    print_result("11. Error boundary: Invalid Channel Input (Should return 422)", status, res)

    print("\nEnd-to-End Testing complete.")

if __name__ == "__main__":
    main()
