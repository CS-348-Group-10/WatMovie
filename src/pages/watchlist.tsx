import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Grid, Card, CardContent, CardMedia, IconButton, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Header from '../components/header';

interface WatchlistMovie {
    id: string;
    title: string;
    poster_url: string;
    rating: number;
    year: number;
}

const Watchlist = () => {
    const router = useRouter();
    const [movies, setMovies] = useState<WatchlistMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        // TODO: Fetch watchlist movies from your backend
        // For now, we'll use localStorage
        const savedMovies = localStorage.getItem('watchlist');
        if (savedMovies) {
            setMovies(JSON.parse(savedMovies));
        }
        setLoading(false);
    }, []);

    const removeFromWatchlist = (movieId: string) => {
        const updatedMovies = movies.filter(movie => movie.id !== movieId);
        setMovies(updatedMovies);
        localStorage.setItem('watchlist', JSON.stringify(updatedMovies));
    };

    if (loading) {
        return (
            <Box className="flex justify-center items-center h-screen bg-gray-50">
                <CircularProgress className="text-[#FFB800]" />
            </Box>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
                <Header setSearch={setSearch} />
            </div>
            <div className="pt-20 px-8">
                <Typography variant="h4" className="font-bold text-gray-900 mb-8">
                    My Watchlist
                </Typography>
                {movies.length === 0 ? (
                    <Box className="text-center py-12">
                        <Typography variant="h6" className="text-gray-500 mb-4">
                            Your watchlist is empty
                        </Typography>
                        <Typography variant="body1" className="text-gray-400">
                            Add movies to your watchlist while browsing
                        </Typography>
                    </Box>
                ) : (
                    <Grid container spacing={4}>
                        {movies.map((movie) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
                                <Card className="h-full hover:shadow-lg transition-shadow">
                                    <div className="relative">
                                        <CardMedia
                                            component="img"
                                            height="400"
                                            image={movie.poster_url}
                                            alt={movie.title}
                                            className="object-cover"
                                        />
                                        <IconButton
                                            onClick={() => removeFromWatchlist(movie.id)}
                                            className="absolute top-2 right-2 bg-black bg-opacity-50 hover:bg-opacity-75"
                                            size="small"
                                        >
                                            <DeleteIcon className="text-white" />
                                        </IconButton>
                                    </div>
                                    <CardContent>
                                        <Typography variant="h6" className="font-semibold text-gray-900 truncate">
                                            {movie.title}
                                        </Typography>
                                        <div className="flex items-center justify-between mt-2">
                                            <Typography variant="body2" className="text-gray-600">
                                                {movie.year}
                                            </Typography>
                                            <Typography variant="body2" className="text-gray-900 font-medium">
                                                {movie.rating}/10
                                            </Typography>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </div>
        </div>
    );
};

export default Watchlist; 