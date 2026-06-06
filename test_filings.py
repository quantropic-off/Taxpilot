import requests
import json
import sys

BASE_URL = 'http://localhost:8000/api/v1'

def print_section(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def test_gst():
    print_section("Testing GST Filing")
    # 1. Create Case
    res = requests.post(f"{BASE_URL}/gst/cases", json={
        'practice_case_id': 101, 'gstin': '27ABCDE1234F1Z5', 'return_period': '2024-05',
        'place_of_supply': '27', 'transaction_type': 'B2B'
    })
    if not res.ok: return print(f"Failed to create case: {res.text}")
    case_id = res.json()['case_id']
    print(f"? GST Case created (ID: {case_id})")

    # 2. Add Invoice
    res = requests.post(f"{BASE_URL}/gst/cases/{case_id}/invoices", json={
        'invoice_number': 'INV-2024-001', 'date': '2024-05-15', 'invoice_type': 'Regular',
        'hsn': '998311', 'taxable_value': 50000, 'tax_rate': 18
    })
    if not res.ok: return print("Failed to add invoice")
    print("? Invoice INV-2024-001 added (Taxable: ?50,000, Rate: 18%)")

    # 3. Generate GSTR-1
    res = requests.post(f"{BASE_URL}/gst/cases/{case_id}/generate-gstr1")
    if not res.ok: return print("Failed to generate GSTR-1")
    gstr1 = res.json()['gstr1_json']
    print("? GSTR-1 JSON Generated:")
    print(json.dumps(gstr1, indent=2)[:200] + "...\n}")

    # 4. Simulate ARN
    res = requests.post(f"{BASE_URL}/gst/cases/{case_id}/simulate-arn")
    if not res.ok: return print("Failed to simulate ARN")
    print(f"? Return Filed successfully! ARN: {res.json()['arn']}")


def test_tds():
    print_section("Testing TDS Filing")
    # 1. Create Case
    res = requests.post(f"{BASE_URL}/tds/cases", json={
        'practice_case_id': 102, 'deductor_tan': 'MUMT12345F', 'deductor_pan': 'ABCDE1234F',
        'financial_year': '2024-25', 'quarter': 'Q1', 'form_type': '26Q'
    })
    if not res.ok: return print(f"Failed to create case: {res.text}")
    case_id = res.json()['case_id']
    print(f"? TDS Case created (ID: {case_id})")

    # 2. Add Deduction
    res = requests.post(f"{BASE_URL}/tds/cases/{case_id}/deductions", json={
        'deductee_pan': 'XYZAB9876C', 'section_code': '194J', 'payment_amount': 250000,
        'deduction_date': '2024-06-20'
    })
    if not res.ok: return print("Failed to add deduction")
    print("? Deduction added for PAN XYZAB9876C under section 194J (Amount: ?2,50,000)")

    # 3. Generate Challan
    res = requests.post(f"{BASE_URL}/tds/cases/{case_id}/generate-challan")
    if not res.ok: return print("Failed to generate Challan")
    challan = res.json()['challan']
    print("? Challan ITNS 281 Generated:")
    print(json.dumps(challan, indent=2))

    # 4. Simulate Filing
    res = requests.post(f"{BASE_URL}/tds/cases/{case_id}/file-26q")
    if not res.ok: return print("Failed to file 26Q")
    print(f"? Form 26Q Filed successfully! PRN: {res.json()['receipt_number']}")

def test_itr():
    print_section("Testing ITR Filing")
    # 1. Create Case
    res = requests.post(f"{BASE_URL}/itr/cases", json={
        'practice_case_id': 103, 'pan': 'ABCDE1234F', 'assessment_year': '2024-25',
        'itr_type': 'ITR-1'
    })
    if not res.ok: return print(f"Failed to create case: {res.text}")
    case_id = res.json()['case_id']
    print(f"? ITR Case created (ID: {case_id})")

    # 2. Compute Tax Liability
    res = requests.post(f"{BASE_URL}/itr/cases/{case_id}/compute", json={
        'incomes': [
            {'head_of_income': 'Salary', 'amount': 1500000},
            {'head_of_income': 'Other Sources', 'amount': 50000}
        ],
        'deductions': [
            {'section': '80C', 'amount_claimed': 200000} # Over the 1.5L limit
        ]
    })
    if not res.ok: return print("Failed to compute tax")
    tax_res = res.json()
    print("? Tax Computation Successful:")
    print(f"   - Gross Total Income: ?{tax_res['gti']:,.2f}")
    print(f"   - Eligible Deductions: ?{tax_res['deductions']:,.2f} (Notice how 80C was capped at 1.5L)")
    print(f"   - Old Regime Tax: ?{tax_res['old_tax']:,.2f}")
    print(f"   - New Regime Tax: ?{tax_res['new_tax']:,.2f}")
    print(f"   - Recommended Regime: {tax_res['recommended']}")

    # 3. Simulate Filing
    res = requests.post(f"{BASE_URL}/itr/cases/{case_id}/file")
    if not res.ok: return print("Failed to file ITR")
    print(f"? ITR Filed successfully! Ack Number: {res.json()['ack_number']}")

if __name__ == '__main__':
    try:
        test_gst()
        test_tds()
        test_itr()
    except Exception as e:
        print(f"Error: {e}")
