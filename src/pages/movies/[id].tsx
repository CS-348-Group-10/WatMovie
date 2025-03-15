import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Title, Genre, Cast, MemberCategory } from "@/types";
import Image from 'next/image';
import { CircularProgress, Container, CardContent, Typography, Chip, Box, ListItem, ListItemText } from "@mui/material";
import Header from '../../components/header';

const MovieDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [movie, setMovie] = useState<Title | null>(null);
    const [loading, setLoading] = useState(true);
    const [moviePosterUrl, setPosterUrl] = useState<string>('/placeholder.png');
    const [moviePlot, setPlot] = useState<string>('');
    const [genres, setGenres] = useState<Genre[]>([]);
    const [memberCategories, setMemberCategories] = useState<MemberCategory[]>([]);
    const [search, setSearch] = useState<string>('');

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
                const res = await fetch(`/api/title?id=${id}`);
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
            const res = await fetch('/api/member-categories');
            const data = await res.json();
            setMemberCategories(data);
        };

        Promise.all([fetchMovie(), fetchAllGenres(), fetchAllMemberCategories()]);
    }, [id]);

    if (loading) {
        return (
            <Box className="flex justify-center items-center h-screen">
                <CircularProgress />
            </Box>
        );
    }

    if (!movie) {
        return (
            <Box className="flex justify-center items-center h-screen">
                <Typography variant="h5" color="error">Movie not found</Typography>
            </Box>
        );
    }

    return (
        <div>
            <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
                <Header setSearch={setSearch} />
            </div>
            <div className="flex my-20">
                <Container className="max-w-6xl shadow-sm flex flex-col md:flex-row">
                    <div className="w-full md:w-1/3 bg-black flex justify-center items-center p-4 rounded-l-lg">
                        {moviePosterUrl && (
                            <Image
                                loader={(prop) => prop.src}
                                src={moviePosterUrl}
                                alt={movie.title}
                                width={300}
                                height={450}
                                className="rounded-lg object-cover w-full h-auto"
                            />
                        )}
                    </div>
                    <CardContent className="flex-1 p-6 bg-gray-400 rounded-r-lg">
                        <Typography variant="h4" gutterBottom>{movie.title}</Typography>
                        <Typography variant="body2" color="textSecondary" gutterBottom>
                            {movie.start_year} - {movie.end_year ?? "Present"} | {movie.duration ? `${movie.duration} min` : "Unknown duration"} |
                            {movie.is_adult ? " 🔞 Adult" : " 👪 Family-friendly"}
                        </Typography>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {movie.genre_ids?.map((genre) => (
                                <Chip key={genre} label={genres[genre]?.name} className="bg-[#fad02c]" />
                            ))}
                        </div>
                        <Typography variant="h6" className="mt-4">Plot</Typography>
                        <Typography variant="body1" color="textPrimary">{moviePlot}</Typography>
                        <Typography variant="h6" className="mt-4">⭐ Score: {movie.rating ?? "-"}/10</Typography>
                        <Typography variant="body2" color="textSecondary">Votes: {movie.votes ?? "N/A"}</Typography>
                        {movie.cast && movie.cast.length > 0 ? (
                            <div className="mt-6">
                                <Typography variant="h6">Featured Cast</Typography>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                    {movie.cast.sort((a, b) => a.ordering - b.ordering).map((actor: Cast) => (
                                        <ListItem key={actor.id} className="w-full">
                                            <ListItemText
                                                primary={actor.characters ? `${actor.name} as ${actor.characters}` : actor.name}
                                                secondary={memberCategories[actor.category_id]?.name}
                                            />
                                        </ListItem>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <Typography variant="h6" className="mt-6">No cast information available</Typography>
                        )}
                    </CardContent>
                </Container>
            </div>
        </div>
    );
};

export default MovieDetails;
