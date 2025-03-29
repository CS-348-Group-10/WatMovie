import { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper } from '@mui/material';
import Header from '../components/header';
import Image from 'next/image';
import Link from 'next/link';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

interface TopMovie {
    mid: string;
    name: string;
    is_adult: boolean;
    release_year: number;
    runtime_minutes: number;
    average_rating: number;
    user_rating_count: number;
}

const TopTen = () => {
    const [movies, setMovies] = useState<TopMovie[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [posters, setPosters] = useState<{ [key: string]: string }>({});

    const fetchPoster = async (movieId: string) => {
        try {
            const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_POSTER_API_KEY}&i=${movieId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch poster');
            }
            const data = await response.json();

            // Check if the poster URL is valid
            const isValidPosterUrl = data.Poster && 
                data.Poster !== 'N/A' && 
                !data.Error && 
                response.ok && 
                response.status === 200 &&
                data.Poster.startsWith('http');

            return isValidPosterUrl ? data.Poster : '/placeholder.png';
        } catch (error) {
            return '/placeholder.png';
        }
    };

    const handleImageError = (movie: TopMovie) => {
        const newPosters = { ...posters };
        newPosters[movie.mid] = '/placeholder.png';
        setPosters(newPosters);
    }

    useEffect(() => {
        const fetchTopMovies = async () => {
            try {
                const response = await fetch('/api/topten');
                if (!response.ok) {
                    throw new Error('Failed to fetch top movies');
                }
                const data = await response.json();
                setMovies(data);

                // Fetch posters for all movies
                const posterPromises = data.map(async (movie: TopMovie) => {
                    const poster = await fetchPoster(movie.mid);
                    return { id: movie.mid, poster };
                });

                const posterResults = await Promise.all(posterPromises);
                const posterMap = posterResults.reduce((acc, { id, poster }) => {
                    acc[id] = poster;
                    return acc;
                }, {} as { [key: string]: string });

                setPosters(posterMap);
            } catch (error) {
                console.error('Failed to fetch top movies:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopMovies();
    }, []);

    if (loading) {
        return (
            <Box className="flex justify-center items-center h-screen bg-gray-50">
                <CircularProgress className="text-[#FFB800]" />
            </Box>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
                <Header setSearch={setSearch} />
            </div>
            <div className="pt-20 px-4 md:px-8 max-w-4xl mx-auto">
                <Typography variant="h4" className="font-bold text-gray-900 mb-8 mt-2">
                    Top 10 User Rated Movies
                </Typography>
                <div className="space-y-4">
                    {movies.map((movie, index) => (
                        <Paper 
                            key={movie.mid} 
                            elevation={2}
                            className="p-3 relative flex flex-col md:flex-row gap-4 bg-white rounded-lg hover:shadow-lg transition-shadow duration-200"
                        >
                            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-14 bg-[#FFB800] rounded-r-lg flex items-center justify-center">
                                <span className="text-white font-bold text-2xl">
                                    {index + 1}
                                </span>
                            </div>
                            <Link href={`/movies/${movie.mid}`} className="flex flex-col md:flex-row gap-4 flex-1">
                                <div className="w-full md:w-32 h-48 relative rounded-lg overflow-hidden flex-shrink-0">
                                    <Image
                                        loader={(prop) => prop.src}
                                        src={posters[movie.mid]}
                                        alt={movie.name}
                                        layout="fill"
                                        objectFit="cover"
                                        objectPosition="cover"
                                        className="rounded-lg"
                                        sizes="(max-width: 768px) 100vw, 128px"
                                        onError={() => handleImageError(movie)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Typography variant="h6" className="font-bold text-gray-900">
                                            {movie.name} ({movie.release_year})
                                        </Typography>
                                        {movie.is_adult && (
                                            <span className="px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded">
                                                18+
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <span className="text-[#FFB800] font-bold text-xl">★</span>
                                            <span className="text-lg font-bold">{movie.average_rating.toFixed(1)}</span>
                                            <span className="text-sm text-gray-500">
                                                ({movie.user_rating_count.toLocaleString()} votes)
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <AccessTimeIcon className="w-4 h-4 mr-1" />
                                            <span className="text-sm">{movie.runtime_minutes ? `${movie.runtime_minutes} min` : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </Paper>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TopTen;
