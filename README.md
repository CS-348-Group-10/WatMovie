# WatMovie

## Description

Our application, WatMovie, is a database-driven platform that allows users to explore movies. We intend to use publicly available IMDb Datasets along with mock data generated through internal scripts for users and reviews, as well as the OMDb API (https://www.omdbapi.com/) to display movie-related images. The platform is designed for movie enthusiasts who want to discover new films, find information about their favorite movies and keep track of what they’re watching currently.

## Steps to run the application

### Step 1: Clone the repository

```bash
git clone https://github.com/CS-348-Group-10/WatMovie.git
```

### Step 2: Install dependencies

```bash
cd WatMovie
npm install
```

### Step 3: Setup the database

1. Create a new docker container for PostgreSQL. This will create a new container with the name `watmovie-postgres` and the user `watmovie` with the password `watmovie`, and the default database `postgres`.

    ```bash
    docker pull postgres
    docker run --name watmovie-postgres -e POSTGRES_USER=watmovie -e POSTGRES_PASSWORD=watmovie -p 5432:5432 -d postgres
    ```

2. Add the following environment variables to the `.env` file:

    ```bash
    DB_USER=watmovie
    DB_HOST=localhost
    DB_NAME=postgres
    DB_PASSWORD=watmovie
    DB_PORT=5432
    NEXT_PUBLIC_POSTER_API_KEY=8180dbba
    ```

3. Create a python virtual environment and install appropriate packages
    ```bash
    python -m venv .venv
    source .venv/bin/activate
    pip install faker dotenv psycopg2
    ```


4. Download the appropriate datasets from IMDb

    Navigate to `https://datasets.imdbws.com/` and download the following 4 tsv files:
    - title.basics.tsv [rename this to `title.tsv`]
    - name.basics.tsv
    - title.principals.tsv
    - title.ratings.tsv

    Move these 4 tsv files to the `public` folder.

4. Run the server to create the database schema.

    ```bash
    npm run dev
    ```

    Next, we need to send an empty POST request to `http://localhost:3000/api/dev/runMigrations` to create the database schema.

5. Populate the database

- **To load the sample database:**
    
    Send an empty POST request to 
    
    `http://localhost:3000/api/dev/populateDatabase` 
    
    to populate the database with the sample data.

- **To load the production dataset:**
    
    In the above POST request, set the query parameter `isProduction=true` i.e. send an empty POST request to 
    
    `http://localhost:3000/api/dev/populateDatabase?isProduction=true` 
    
    to populate the database with the production dataset.

### Step 4: Open the application

Check the application by opening the `http://localhost:3000` in your browser. You should see the following page:

![WatMovie](public/m3_homepage.png)

## List of Supported Features

### Basic Features:

1. **Users** 

    WatMovie supports both guest and registered users, with guests able to browse movies but not leave reviews or ratings. Users must sign up and log in to create watchlists, rate movies, and add reviews. Restricted actions prompt guests to log in, after which they are redirected to the dashboard for full access.

2. **Watchlist**
    
    Users can save movies to a personal watchlist to track what they are watching or plan to watch. Clicking the "+" button on a movie adds it to their watchlist, accessible from the main navigation or profile page. Users can view, manage, and remove movies from their watchlist anytime.

3. **Movie Description Page**
    
    Each movie has a dedicated page displaying details like cast, plot, release year, genre, duration, user reviews, and average ratings. Clicking a movie title from the catalog or search results redirects users to this page. The description page allows users to explore all relevant movie information in one place.

4. **Reviews**
    
    Users can rate movies (0-10) and leave comments to help others make informed viewing choices. Reviews are submitted through a form on the movie description page and displayed in the reviews section. Users can edit or delete their own reviews and browse those left by others.

5. **Random Movie Selection**
    
    Users can discover movies randomly by clicking the "Random" button in the navbar, which selects a title from the database. The app redirects them to the movie’s details page, showing its genre, description, and cast. Clicking the button again fetches a new random title.

### Advanced Features:

6. **Search/Filter Movies (Stored Procedure)**
    
    Users can search for movies by name or apply filters like genre, release year, and rating. This functionality is implemented using a stored procedure with complex queries involving multiple joins and groupings. The search feature improves efficiency while handling large datasets.

7. **Movie Ratings Trend (Window Function)**
    
    WatMovie tracks rating trends by calculating a seven-day moving average of user ratings. This provides insight into how a movie’s rating evolves over time while smoothing out short-term fluctuations. A window function efficiently computes these averages for accurate trend visualization.

8. **Updating Movie User Rating (Trigger)**
    
    A database trigger automatically updates a movie’s average rating whenever a new rating is submitted. This ensures that the displayed rating is always current without requiring manual recalculations. The materialized view stays updated, reflecting the most recent user ratings dynamically.

9. **Top 10 User Ranked Movies (View)**
    
    A materialized view precomputes and stores the top 10 highest-rated movies for faster retrieval. Instead of recalculating rankings each time, the stored view updates when ratings change, ensuring efficiency. This allows users to quickly access an updated list of the best-rated movies.

10. **Insert New Movies (Transaction)**
    
    Users can add new movies along with cast details by submitting a form. A transaction ensures that all movie and cast information is inserted correctly, preventing partial data entries. If any step fails, the transaction rolls back, maintaining database integrity.