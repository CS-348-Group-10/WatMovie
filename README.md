# WatMovie

## Description

Our application, WatMovie, is a database-driven platform that allows users to explore movies. We plan to utilize the publicly available IMDb Datasets. The platform is designed for movie enthusiasts who want to discover new films, find information about their favorite movies and keep track of what they’re watching currently.

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
    ```

3. Run the application to create the database schema.

```bash
npm run dev
```

Next, we need to send an empty POST request to `http://localhost:3000/api/dev/runMigrations` to create the database schema.

Next, we need to send an empty POST request to `http://localhost:3000/api/dev/populateTestData` to populate the database with test data.

### Step 4: Open the application

Check the application by opening the `http://localhost:3000` in your browser. You can see the following page:

![WatMovie](public/watmovie.png)
