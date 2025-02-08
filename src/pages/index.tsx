import { useEffect, useState } from 'react';
import { Typography, Container, TextField, FormControlLabel, Checkbox, Button, CircularProgress, Card, CardContent, Grid } from '@mui/material';
import { Title } from '../types';

export default function Home() {
	const [movies, setMovies] = useState<Title[]>([]);
	const [search, setSearch] = useState<string>('');
	const [showAdult, setShowAdult] = useState<boolean>(false);
	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		const fetchMovies = async () => {
			setLoading(true);
			try {
				const queryParams = new URLSearchParams({
					search: search,
					showAdult: showAdult.toString()
				});
				const res = await fetch(`/api/titles?${queryParams}`);
				const data = await res.json();
				setMovies(data);
			} catch (error) {
				console.error('Failed to fetch movies:', error);
			}
			setLoading(false);
		}
		
		fetchMovies();
	}, [search, showAdult]);

	const fetchRandomMovie = async () => {
		setLoading(true);
		try {
			const res = await fetch('/api/random-title');
			const data = await res.json();
			setMovies([data]);
		} catch (error) {
			console.error('Failed to fetch random movie:', error);
		}
		setLoading(false);
	}

	return (
		<Container maxWidth="md" sx={{ py: 4 }}>
			{/* Search, Filter, and Random Movie Button */}
			<Container sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
				<TextField
					label="Search Movies"
					variant='outlined'
					fullWidth
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>
				<Container sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<FormControlLabel
						control={<Checkbox checked={showAdult} onChange={(e) => setShowAdult(e.target.checked)} />}
						label="Include Adult Content"
					/>
					<Button variant="contained" color="primary" onClick={fetchRandomMovie}>
						Suggest Random Movie
					</Button>
				</Container>
			</Container>
		

		{/* Movie Tiles */}
		{loading ? (
        <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Container>
      ) : (
        <Grid container spacing={2}>
          {movies.map((movie) => (
            <Grid item xs={12} sm={6} md={4} key={movie.title_id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="h6">{movie.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {movie.start_year} - {movie.end_year ?? "Present"} | {movie.runtime_minutes ?? "Unknown"} min
                  </Typography>
                  {movie.is_adult && (
                    <Typography variant="caption" color="error">
                      *Adult Content*
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
		</Container>
	)
}
