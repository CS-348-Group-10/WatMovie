import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Title } from "@/types";
import { CircularProgress, Card, CardContent, Typography, Chip, Box } from "@mui/material";

const MovieDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const [movie, setMovie] = useState<Title | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchMovie = async () => {
      try {
        const res = await fetch(`/api/get-title/${id}`);
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Failed to fetch movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
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
        <Typography variant="h5" color="error">
          Movie not found
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="flex justify-center items-center h-screen p-4">
      <Card className="max-w-xl w-full shadow-lg">
        <CardContent>
          <Typography variant="h4" className="mb-4">
            {movie.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            {movie.type} ({movie.start_year} - {movie.end_year ?? "Present"})
          </Typography>
          <Typography variant="body1" className="mt-2">
            <strong>Duration:</strong> {movie.duration ? `${movie.duration} min` : "Unknown"}
          </Typography>
          <Typography variant="body1">
            <strong>Rating:</strong> {movie.rating ? movie.rating : "N/A"}
          </Typography>
          <Typography variant="body1">
            <strong>Adult:</strong> {movie.is_adult ? "Yes" : "No"}
          </Typography>
          <Box className="mt-4 flex flex-wrap gap-2">
            {movie.genres?.map((genre) => (
              <Chip key={genre} label={genre} color="primary" />
            ))}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MovieDetails;
