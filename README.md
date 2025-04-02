# WatMovie

## Description

Our application, WatMovie, is a database-driven platform that allows users to explore movies. We intend to use publicly available IMDb Datasets along with mock data generated through internal scripts for users and reviews, as well as the OMDb API (https://www.omdbapi.com/) to display movie-related images. The platform is designed for movie enthusiasts who want to discover new films, find information about their favorite movies and keep track of what they’re watching currently.

## Database Setup

### Download the Database Dump

Choose which database you want to load:

- **Production Database Dump:**  
  [Production DB Dump](https://github.com/CS-348-Group-10/WatMovie/releases/download/1.0.0/production.sql.gz)

- **Sample Database Dump:**  
  [Sample DB Dump](https://github.com/CS-348-Group-10/WatMovie/releases/download/1.0.0/sample.sql.gz)


### Docker Setup

1. Start a PostgreSQL container:
   ```sh
   docker run --shm-size=2g --name watmovie -e POSTGRES_USER=watmovieuser -e POSTGRES_PASSWORD=watmovie -e POSTGRES_DB=watmovie -p 5432:5432 -d postgres -c shared_buffers=2GB -c work_mem=32MB
   ```
2. Copy the zipped dump file into the container:
   ```sh
   docker cp <path-to-dump-file>.sql.gz watmovie:/<dump-file>.sql.gz
   ```
3. Unzip the dump file inside the container:
   ```sh
   docker exec -i watmovie gunzip /<dump-file>.sql.gz
   ```
4. Load the dump inside the running container:
   ```sh
   docker exec -i watmovie psql -U watmovieuser -d watmovie -f /<dump-file>.sql
   ```

Your database should now be successfully loaded and ready to use!

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

1. Ensure that the database is loaded using the steps outlined in the **Database Setup** section above.

2. Add the following environment variables to the `.env` file:

    ```bash
    DB_USER=watmovieuser
    DB_HOST=localhost
    DB_NAME=watmovie
    DB_PASSWORD=watmovie
    DB_PORT=5432
    NEXT_PUBLIC_POSTER_API_KEY=8180dbba
    ```

### Step 4: Open the application

Check the application by opening `http://localhost:3000` in your browser. You should see the following page:

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

6. **Search/Filter Movies (Complex Query)**  
    
   Users can search for movies by name or apply filters like genre, release year, and rating. This functionality is implemented using a complex query involving multiple joins and groupings.

7. **Movie Ratings Trend (Window Function)**  
    
   WatMovie tracks rating trends by calculating a seven-day moving average of user ratings. This provides insight into how a movie’s rating evolves over time while smoothing out short-term fluctuations. A window function efficiently computes these averages for accurate trend visualization.

8. **Updating Movie User Rating (Trigger)**  
    
   A database trigger automatically updates a movie’s average rating whenever a new rating is submitted. This ensures that the displayed rating is always current without requiring manual recalculations. The materialized view stays updated, reflecting the most recent user ratings dynamically.

9. **Top 10 User Ranked Movies (View)**  
    
   A materialized view precomputes and stores the top 10 highest-rated movies for faster retrieval. Instead of recalculating rankings each time, the stored view updates when ratings change, ensuring efficiency. This allows users to quickly access an updated list of the best-rated movies.

10. **Insert New Movies (Transaction)**  
    
   Users can add new movies along with cast details by submitting a form. A transaction ensures that all movie and cast information is inserted correctly, preventing partial data entries. If any step fails, the transaction rolls back, maintaining database integrity.
