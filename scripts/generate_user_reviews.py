import os
import csv
import random
from datetime import datetime, timedelta
import psycopg2
from faker import Faker
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

fake = Faker()

# Database connection parameters
DB_PARAMS = {
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT')
}

def get_highly_rated_movies():
    """Get movies with total_votes >= 2000 and average rating >= 7"""
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    
    query = """
    SELECT m.mid
    FROM movies m
    JOIN imdb_ratings r ON m.mid = r.mid
    WHERE total_votes >= 2000 
    AND (sum_of_votes/total_votes) >= 7;
    """
    
    cur.execute(query)
    movies = cur.fetchall()
    
    cur.close()
    conn.close()
    
    return movies

def get_users():
    conn = psycopg2.connect(**DB_PARAMS)
    cur = conn.cursor()
    
    query = "SELECT uid FROM users;"
    
    cur.execute(query)
    users = [{'uid': row[0]} for row in cur.fetchall()]
    
    cur.close()
    conn.close()
    
    return users

def generate_review_content(rating):
    if rating >= 9:
        comments = [
            "An absolute masterpiece that will be remembered for generations. ",
            "One of the finest films ever made. A true work of art. ",
            "A perfect blend of storytelling, acting and direction. ",
            "This film sets a new standard for cinema. "
        ]
    elif rating >= 8:
        comments = [
            "An excellent film that delivers on every level. ",
            "Thoroughly engaging from start to finish. ",
            "Masterfully crafted and highly entertaining. ",
            "A remarkable achievement in filmmaking. "
        ]
    elif rating >= 7:
        comments = [
            "A solid film with strong performances. ",
            "Well made and worth watching. ",
            "An enjoyable experience overall. ",
            "Good entertainment value. "
        ]
    else:
        comments = [
            "Has potential but falls short. ",
            "Some good moments but inconsistent. ",
            "Decent effort but needs improvement. ",
            "Not quite what it could have been. "
        ]
    
    return random.choice(comments) + fake.text(max_nb_chars=30)

def generate_reviews(users, movies):
    reviews = []
    
    # Convert datetime strings to datetime objects
    start_date = datetime(2025, 3, 15)
    end_date = datetime(2025, 3, 30)
    
    for movie in movies:
        # Determine number of reviews for this movie (50-100)
        num_reviews = random.randint(50, 100)
        
        # Randomly select users for this movie
        selected_users = random.sample(users, min(num_reviews, len(users)))
        
        for user in selected_users:
            # Generate a rating between 1 and 10
            rating = round(random.uniform(1, 10), 1)
            
            random_days = random.randint(0, (end_date - start_date).days)
            created_at = start_date + timedelta(days=random_days)
            
            review = {
                'uid': int(user['uid']),
                'mid': movie[0],
                'rating': rating,
                'comment': generate_review_content(rating),
                'created_at': created_at,
                'updated_at': created_at
            }
            reviews.append(review)
    
    return reviews

def save_to_csv(reviews, filename="public/user_reviews.csv"):
    """Save reviews to CSV file"""
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    file_path = os.path.join(project_root, filename)
    
    with open(file_path, mode="w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=[
            'uid', 'mid', 'rating', 'comment', 'created_at', 'updated_at'
        ])
        writer.writeheader()
        writer.writerows(reviews)

def main():
    print("Fetching highly rated movies...")
    movies = get_highly_rated_movies()
    print(f"Found {len(movies)} highly rated movies")
    
    print("Reading users...")
    users = get_users()
    print(f"Found {len(users)} users")
    
    print("Generating reviews...")
    reviews = generate_reviews(users, movies)
    print(f"Generated {len(reviews)} reviews")
    
    print("Saving reviews to CSV...")
    save_to_csv(reviews)
    print("Done!")

if __name__ == "__main__":
    main()
