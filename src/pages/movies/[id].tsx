import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Movie, Genre, Cast, MovieRole } from "@/types";
import Image from 'next/image';
import { CircularProgress, Container, CardContent, Typography, Chip, Box, ListItem, ListItemText, IconButton, Avatar } from "@mui/material";
import Header from '../../components/header';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import ManIcon from '@mui/icons-material/Man';
import WomanIcon from '@mui/icons-material/Woman';
import MovieIcon from '@mui/icons-material/Movie';
import TheaterComedyIcon from '@mui/icons-material/TheaterComedy';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import EditIcon from '@mui/icons-material/Edit';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import BrushIcon from '@mui/icons-material/Brush';
import BuildIcon from '@mui/icons-material/Build';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const snakeToCapitalized = (str: string): string => {
    return str
        .split('_') // Split by underscore
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
        .join(' '); // Join with space
}

const MovieDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [moviePosterUrl, setPosterUrl] = useState<string>('/placeholder.png');
    const [moviePlot, setPlot] = useState<string>('');
    const [genres, setGenres] = useState<Genre[]>([]);
    const [memberCategories, setMemberCategories] = useState<MovieRole[]>([]);
    const [search, setSearch] = useState<string>('');
    const [isInWatchlist, setIsInWatchlist] = useState(false);

    useEffect(() => {
        if (!id) return;
        setMovie(null);
        setLoading(true);
        setPosterUrl('/placeholder.png');
        setPlot('');

        const fetchPoster = async () => {
            try {
                const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_POSTER_API_KEY}&i=${id}&plot='full'`);
                if (!response.ok) throw new Error('Failed to fetch poster');
                const data = await response.json();
                setPosterUrl(data.Poster === 'N/A' || data.Error ? '/placeholder.png' : data.Poster);
                setPlot(data.Plot);
            } catch (error) {}
        };

        const fetchMovie = async () => {
            try {
                const res = await fetch(`/api/movie?id=${id}`);
                const data = await res.json();
                setMovie(data);
                fetchPoster();
            } catch (error) {
                console.error("Failed to fetch movie:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAllGenres = async () => {
            const res = await fetch(`/api/genres`);
            const data = await res.json();
            setGenres(data);
        };

        const fetchAllMemberCategories = async () => {
            const res = await fetch('/api/movie-roles');
            const data = await res.json();
            setMemberCategories(data);
        };

        Promise.all([fetchMovie(), fetchAllGenres(), fetchAllMemberCategories()]);
    }, [id]);

    const handleAddToWatchlist = () => {
        setIsInWatchlist(!isInWatchlist);
        // TODO: Implement add/remove from watchlist logic
        console.log(isInWatchlist ? 'Removing from watchlist:' : 'Adding to watchlist:', id);
    };

    if (loading) {
        return (
            <Box className="flex justify-center items-center h-screen bg-gray-50">
                <CircularProgress className="text-[#FFB800]" />
            </Box>
        );
    }

    if (!movie) {
        return (
            <Box className="flex justify-center items-center h-screen bg-gray-50">
                <Typography variant="h5" color="error">Movie not found</Typography>
            </Box>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
                <Header setSearch={setSearch} />
            </div>
            <div className="pt-20">
                <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
                    <div className="relative w-full md:w-1/3">
                        {moviePosterUrl && (
                            <div className="sticky top-20 h-[calc(100vh-80px)] flex items-center justify-center py-20">
                                <div className="relative w-full h-full">
                                    <Image
                                        loader={(prop) => prop.src}
                                        src={moviePosterUrl}
                                        alt={movie.movie}
                                        layout="fill"
                                        objectFit="cover"
                                        className="object-cover"
                                    />
                                    <IconButton
                                        onClick={handleAddToWatchlist}
                                        className={`absolute top-4 right-4 text-white shadow-lg transition-colors duration-200 ${
                                            isInWatchlist 
                                                ? 'bg-green-500 hover:bg-green-600' 
                                                : 'bg-[#FFB800] hover:bg-[#FFA500]'
                                        }`}
                                        size="large"
                                    >
                                        {isInWatchlist ? <CheckIcon /> : <AddIcon />}
                                    </IconButton>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-8">
                        <Typography variant="h3" className="font-bold text-gray-900 mb-4">{movie.movie}</Typography>
                        <div className="flex items-center gap-4 text-gray-600 mb-6">
                            <span>{movie.release_year}</span>
                            <span>•</span>
                            <span className="flex items-center">
                                <AccessTimeIcon className="mr-1" />
                                {movie.duration ? `${movie.duration} min` : "Unknown duration"}
                            </span>
                            <span>•</span>
                            <span>{movie.is_adult ? "🔞 Adult" : "👪 Family-friendly"}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-6">
                            {movie.genre_ids?.map((genre) => (
                                <Chip 
                                    key={genre} 
                                    label={genres[genre]?.name} 
                                    className="bg-[#FFB800] text-white hover:bg-[#FFA500] transition-colors" 
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-6 mb-8">
                            <div className="flex items-center">
                                <StarIcon className="text-yellow-400 mr-1" />
                                <Typography variant="h6" className="text-gray-900">
                                    {movie.rating ?? "-"}/10
                                </Typography>
                            </div>
                            <div className="flex items-center">
                                <FavoriteIcon className="text-red-500 mr-1" />
                                <Typography variant="h6" className="text-gray-900">
                                    {movie.votes ?? "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="mb-8">
                            <Typography variant="h6" className="text-gray-900 mb-3">Plot</Typography>
                            <Typography variant="body1" className="text-gray-700 leading-relaxed">
                                {moviePlot}
                            </Typography>
                        </div>
                        <div>
                            <Typography variant="h6" className="text-gray-900 mb-4">Featured Cast</Typography>
                            {movie.cast && movie.cast.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-4">
                                    {movie.cast.sort((a, b) => a.ordering - b.ordering).map((actor: Cast) => {
                                        const getRoleIcon = (roleId: number) => {
                                            switch (roleId) {
                                                case 1: return <MoreHorizIcon className="text-gray-400" />; // self
                                                case 2: return <MovieIcon className="text-purple-500" />; // director
                                                case 3: return <BuildIcon className="text-gray-500" />; // producer
                                                case 4: return <CameraAltIcon className="text-red-500" />; // cinematographer
                                                case 5: return <MusicNoteIcon className="text-yellow-500" />; // composer
                                                case 6: return <TheaterComedyIcon className="text-green-500" />; // writer
                                                case 7: return <EditIcon className="text-orange-500" />; // editor
                                                case 8: return <ManIcon className="text-blue-500" />; // actor
                                                case 9: return <WomanIcon className="text-pink-500" />; // actress
                                                case 10: return <BrushIcon className="text-indigo-500" />; // production_designer
                                                case 11: return <MoreHorizIcon className="text-gray-400" />; // archive_footage
                                                case 12: return <MoreHorizIcon className="text-gray-400" />; // casting_director
                                                case 13: return <MoreHorizIcon className="text-gray-400" />; // archive_sound
                                                default: return <MoreHorizIcon className="text-gray-400" />;
                                            }
                                        };

                                        return (
                                            <ListItem 
                                                key={actor.id} 
                                                className="bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors p-4"
                                            >
                                                <div className="flex items-start space-x-3">
                                                    <Avatar className="bg-gray-200 mt-1">
                                                        {getRoleIcon(actor.role_id)}
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <Typography 
                                                            className="font-semibold text-gray-900 truncate"
                                                            variant="subtitle1"
                                                        >
                                                            {actor.name}
                                                        </Typography>
                                                        {actor.characters && (
                                                            <Typography 
                                                                className="text-gray-600 text-sm mb-1"
                                                                variant="body2"
                                                            >
                                                                as {actor.characters.replace(/^\["|"\]$/g, '')}
                                                            </Typography>
                                                        )}
                                                        <Typography 
                                                            className="text-gray-500 text-sm"
                                                            variant="body2"
                                                        >
                                                            {snakeToCapitalized(memberCategories[actor.role_id - 1]?.name)}
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </ListItem>
                                        );
                                    })}
                                </div>
                            ) : (
                                <Typography variant="body1" className="text-gray-600 italic">No cast information available</Typography>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
