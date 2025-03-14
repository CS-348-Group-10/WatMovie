import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Title, Genre } from "@/types";
import Image from 'next/image'
import { CircularProgress, Card, CardContent, Typography, Chip, Box, Container } from "@mui/material";

const MovieDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [movie, setMovie] = useState<Title | null>(null);
    const [loading, setLoading] = useState(true);
    const [moviePosterUrl, setPosterUrl] = useState<string>('/placeholder.png')
    const [moviePlot, setPlot] = useState<string>('')
    const [genres, setGenres] = useState<Genre[]>([])

    useEffect(() => {
        if (!id) return;

        const fetchPoster = async () => {
            try {
                const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_POSTER_API_KEY}&i=${id}&plot='full'`)
                if (!response.ok) {
                    throw new Error('Failed to fetch poster')
                }
                const data = await response.json()
                console.log(data)
                setPosterUrl(data.Poster === 'N/A' || data.Error ? '/placeholder.png' : data.Poster)
                setPlot(data.Plot)
            } catch (error) { }
        }

        const fetchMovie = async () => {
            try {
                const res = await fetch(`/api/title?id=${id}`);
                const data = await res.json();
                console.log(data);
                setMovie(data);
                console.log(movie?.genre_ids);
                fetchPoster()
            } catch (error) {
                console.error("Failed to fetch movie:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAllGenres = async () => {
            const res = await fetch(`/api/genres`);
            const data = await res.json();
            console.log(data);
            setGenres(data)
        };

        fetchMovie();
        fetchAllGenres();
    }, [id]);

    const fetchGenre = (genreId: number) => {
        try {
            // TODO: fix access index (plus 27 particular to my device)
            return genres[genreId + 27];
        } catch (error) {
            console.error("Failed to fetch genre:", error);
            throw error;
        }
    }

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
                <Typography variant="h5" color="error">
                    Movie not found
                </Typography>
            </Box>
        );
    }

    return (
        <div className="py-10">
            <Card className="max-w-6xl mx-auto shadow-lg flex flex-col md:flex-row">
                {/* Left Section: movie Poster with Black Background */}
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

                {/* Right Section: movie Details with Gray Background */}
                <CardContent className="flex-1 p-6 bg-gray-200 rounded-r-lg">
                    {/* Title */}
                    <h2 className="text-2xl font-bold mb-2">{movie.title}</h2>

                    {/* Year, Duration, Rating */}
                    <p className="text-sm text-gray-600 mb-2">
                        {movie.start_year} - {movie.end_year ?? "Present"} | {movie.duration ? `${movie.duration} min` : "Unknown duration"} |
                        {movie.is_adult ? " 🔞 Adult" : " 👪 Family-friendly"}
                    </p>

                    {/* Genres */}
                    <div className="mt-2 flex flex-wrap gap-2">
                        {movie.genre_ids?.map((genre) => (
                            <Chip key={genre} label={fetchGenre(genre).name} color="primary" />
                        ))}
                    </div>

                    {/* Plot */}
                    <h3 className="mt-4 font-semibold">Plot</h3>
                    <p className="text-gray-700">{moviePlot}</p>

                    {/* Rating */}
                    {movie.rating !== null && (
                        <p className="mt-4 text-lg font-semibold">⭐ Score: {movie.rating}/10</p>
                    )}
                </CardContent>
            </Card>
        </div>

    );

};

export default MovieDetails;
