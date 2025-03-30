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

def save_to_csv(users, filename="public/users.csv"):
    # Get the absolute path to the project root
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    file_path = os.path.join(project_root, filename)
    
    print(f"Creating file at: {file_path}")
    with open(file_path, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=["first_name", "last_name", "email", "password"])
        writer.writeheader()
        writer.writerows(users)
    print(f"Successfully created {filename}")

if __name__ == "__main__":
    print("Generating users...")
    users = generate_users()
    print(f"Generated {len(users)} users")
    save_to_csv(users)
