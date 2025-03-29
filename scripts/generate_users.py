import os
import csv
from faker import Faker

fake = Faker()

def generate_users(n=1000):
    users = []
    for i in range(n):
        first_name = fake.first_name()
        last_name = fake.last_name()
        email = f"{first_name.lower()}.{last_name.lower()}{i}@example.com"
        password = fake.password(length=12)
        users.append({
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "password": password
        })
    return users

def save_to_csv(users, filename="../public/users.csv"):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["first_name", "last_name", "email", "password"])
        writer.writeheader()
        writer.writerows(users)

users = generate_users()
save_to_csv(users)
