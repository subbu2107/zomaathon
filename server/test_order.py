import time
import requests

print("Waiting 15 seconds for dashboard to open...")
time.sleep(15)

base_url = "http://localhost:5000/api"

print("Registering/Logging in test user...")
try:
    requests.post(f"{base_url}/auth/register", json={
        "full_name": "Live Test",
        "email": "livetest@test.com",
        "phone": "9999999999",
        "password": "password123"
    })
except: pass

log_res = requests.post(f"{base_url}/auth/login", json={
    "email": "livetest@test.com",
    "password": "password123"
}).json()

token = log_res.get("access_token")

print("Setting up address...")
requests.post(f"{base_url}/users/addresses", json={
    "address_line": "123 Test St",
    "city": "Mumbai",
    "state": "MH",
    "pincode": "400001"
}, headers={"Authorization": f"Bearer {token}"})

addr_res = requests.get(f"{base_url}/users/addresses", headers={"Authorization": f"Bearer {token}"}).json()
addr_id = addr_res[-1]["id"]

print("Fetching restaurant ID...")
rests = requests.get(f"{base_url}/restaurants/").json()
spice_route = next((r for r in rests if "Spice Route" in r["name"]), rests[0])
res_id = spice_route["id"]

menu = requests.get(f"{base_url}/restaurants/{res_id}").json().get("menu", [])
menu_item_id = menu[0]["id"] if menu else 1
price = menu[0]["price"] if menu else 500

print(f"Placing order at restaurant {res_id}...")
order_res = requests.post(f"{base_url}/orders/", json={
    "restaurant_id": res_id,
    "total_amount": price,
    "items": [
        {"id": menu_item_id, "quantity": 1, "price": price}
    ],
    "payment_method": "COD",
    "address_id": addr_id
}, headers={"Authorization": f"Bearer {token}"})

if order_res.status_code == 201:
    print("Order placed successfully via background script!")
else:
    print("Failed to place order:", order_res.text)
