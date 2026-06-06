import requests

BASE_URL = "http://localhost:8000/api/v1"

def test_multi_tenant():
    print("--- Starting Multi-Tenant Verification ---")

    # 1. Reset Mock Data (Admin operation)
    print("\n1. Resetting database...")
    res = requests.post(f"{BASE_URL}/admin/reset-mock-data")
    print(f"Reset Status: {res.json()['status']}")

    # 2. Log in as Student A, create GST invoice
    print("\n2. Student A creating a GST Case...")
    case_payload = {
        "student_id": "student_A",
        "gstin": "27ABCDE1234F1Z5",
        "return_period": "052024",
        "place_of_supply": "27-Maharashtra",
        "transaction_type": "B2B"
    }
    res_case = requests.post(f"{BASE_URL}/gst/cases", json=case_payload)
    case_id = res_case.json()["case_id"]
    print(f"Student A Case created with ID: {case_id}")

    # Create an invoice for this case
    invoice_payload = {
        "invoice_number": "INV-001",
        "date": "2024-05-10",
        "invoice_type": "Regular",
        "hsn": "1234",
        "taxable_value": 10000,
        "tax_rate": 18
    }
    res_inv = requests.post(f"{BASE_URL}/gst/cases/{case_id}/invoices", json=invoice_payload)
    print(f"Student A Invoice created. Status: {res_inv.json()['status']}")

    # 3. Log in as Student B, verify Student A's invoice is not visible
    print("\n3. Student B fetching their GST Cases...")
    res_b = requests.get(f"{BASE_URL}/gst/cases?student_id=student_B")
    cases_b = res_b.json().get("cases", [])
    print(f"Student B found {len(cases_b)} cases.")
    if len(cases_b) == 0:
        print("SUCCESS: Student B cannot see Student A's cases.")
    else:
        print("FAIL: Student B sees cases they shouldn't!")

    # 4. Log in as Admin, verify dashboard shows Student A
    print("\n4. Admin checking overall student stats...")
    res_admin = requests.get(f"{BASE_URL}/admin/students/stats")
    stats = res_admin.json().get("data", [])
    print(f"Admin sees {len(stats)} active student(s).")
    for stat in stats:
        print(f" - {stat['student_id']}: {stat['gst_cases']} GST case(s)")
    
    if any(s['student_id'] == 'student_A' for s in stats):
        print("SUCCESS: Admin successfully sees Student A's progress.")
    else:
        print("FAIL: Admin cannot see Student A.")

if __name__ == "__main__":
    try:
        test_multi_tenant()
    except Exception as e:
        print(f"Test failed with error: {e}")
