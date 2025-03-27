import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import Header from '../components/header';
import MovieCard from '../components/movieCard';
import { Movie } from '../types';

const Watchlist = () => {
    const router = useRouter();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isGuest, setIsGuest] = useState(false);

    useEffect(() => {
        const userId = localStorage.getItem('userId');
        const guestMode = localStorage.getItem('isGuest') === 'true';

        if (!userId && !guestMode) {
            router.push('/auth');
            return;
        }

        setIsGuest(guestMode);

        if (guestMode) {
            setLoading(false);
            return;
        }

        const fetchWatchlistMovies = async () => {
            try {
                const response = await fetch(`/api/watchlists/movies?userId=${userId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch watchlist movies');
                }
                const data = await response.json();
                setMovies(data);
            } catch (error) {
                console.error('Failed to fetch watchlist movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchWatchlistMovies();
    }, [router]);

    const handleWatchlistToggle = async (movieId: string) => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            router.push('/auth');
            return;
        }

        try {
            const response = await fetch('/api/watchlists', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    movieId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to remove from watchlist');
            }

            setMovies(prev => prev.filter(movie => movie.id !== movieId));
        } catch (error) {
            console.error('Failed to remove from watchlist:', error);
        }
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
                {isGuest ? (
                    <Box className="text-center py-12">
                        <Typography variant="h6" className="text-gray-500 mb-4">
                            Sign up to save your favorite movies
                        </Typography>
                        <Typography variant="body1" className="text-gray-400 mb-8">
                            Create an account to start building your personal watchlist
                        </Typography>
                        <Button
                            variant="contained"
                            onClick={() => router.push('/auth')}
                            className="bg-[#FFB800] hover:bg-[#FFA500]"
                        >
                            Sign Up Now
                        </Button>
                    </Box>
                ) : movies.length === 0 ? (
                    <Box className="text-center py-12">
                        <Typography variant="h6" className="text-gray-500 mb-4">
                            Your watchlist is empty
                        </Typography>
                        <Typography variant="body1" className="text-gray-400">
                            Add movies to your watchlist while browsing
                        </Typography>
                    </Box>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-12 place-items-center">
                        {movies.map((movie) => (
                            <MovieCard
                                key={movie.id}
                                id={movie.id}
                                movie={movie.movie}
                                rating={movie.rating}
                                genres={movie.genre_ids ? movie.genre_ids.map(id => id.toString()) : null}
                                duration={movie.duration}
                                votes={movie.votes}
                                isInWatchlist={true}
                                onWatchlistToggle={handleWatchlistToggle}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Watchlist; 