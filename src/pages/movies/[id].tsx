import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Movie, Genre, Cast, MovieRole } from "@/types";
import Image from 'next/image';
import { CircularProgress, Container, CardContent, Typography, Chip, Box, ListItem, ListItemText, IconButton, Avatar, TextField, Button, Rating } from "@mui/material";
import Header from '../../components/header';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
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
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RatingTrendGraph from '../../components/RatingTrendGraph';
import Link from 'next/link';

const snakeToCapitalized = (str: string | undefined): string => {
    if (!str) return '';
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
    const [moviePosterUrl, setPosterUrl] = useState<string | null>(null);
    const [posterLoading, setPosterLoading] = useState(true);
    const [moviePlot, setPlot] = useState<string>('');
    const [genres, setGenres] = useState<Genre[]>([]);
    const [memberCategories, setMemberCategories] = useState<MovieRole[]>([]);
    const [search, setSearch] = useState<string>('');
    const [reviewRating, setReviewRating] = useState<number | null>(0);
    const [reviewText, setReviewText] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reviews, setReviews] = useState<any[]>([]); // Replace 'any' with your Review type
    const [userReview, setUserReview] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [averageUserRating, setAverageUserRating] = useState<number | null>(null);
    const [ratingData, setRatingData] = useState<{ date: string; rating: number }[]>([]);
    const [loadingRatings, setLoadingRatings] = useState(true);

    const fetchMovieData = async () => {
        try {
            const res = await fetch(`/api/movie?id=${id}`);
            const data = await res.json();
            setMovie(data);
            setAverageUserRating(data.user_rating);
        } catch (error) {
            console.error("Failed to fetch movie:", error);
        }
    };
  
    useEffect(() => {
        if (!id) return;
        setMovie(null);
        setLoading(true);
        setPosterUrl(null);
        setPosterLoading(true);
        setPlot('');
        setRatingData([]);
        setLoadingRatings(true);

        const fetchPoster = async () => {
            try {
                const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_POSTER_API_KEY}&i=${id}&plot='full'`);
                if (!response.ok) throw new Error('Failed to fetch poster');
                const data = await response.json();
                
                // Check if the poster URL is valid
                const isValidPosterUrl = data.Poster && 
                    data.Poster !== 'N/A' && 
                    !data.Error && 
                    response.ok && 
                    response.status === 200 &&
                    data.Poster.startsWith('http');

                setPosterUrl(isValidPosterUrl ? data.Poster : '/placeholder.png');
                setPlot(data.Plot);
            } catch (error) {
                setPosterUrl('/placeholder.png');
            } finally {
                setPosterLoading(false);
            }
        };

        const fetchMovie = async () => {
            try {
                const res = await fetch(`/api/movie?id=${id}`);
                const data = await res.json();
                setMovie(data);
                setAverageUserRating(data.user_rating);
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

        const fetchReviews = async () => {
            try {
                const res = await fetch(`/api/user-reviews?movieId=${id}`);
                if (!res.ok) throw new Error('Failed to fetch reviews');
                const data = await res.json();
                
                // Sort reviews by created_at in descending order
                const sortedReviews = data.sort((a: any, b: any) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                setReviews(sortedReviews);
                
                // Check if current user has a review
                const userId = localStorage.getItem('userId');
                if (userId) {
                    const userReview = sortedReviews.find((review: any) => review.userId === parseInt(userId));
                    if (userReview) {
                        setUserReview(userReview);
                        setReviewRating(userReview.rating);
                        setReviewText(userReview.comment || '');
                    }
                }
            } catch (error) {
                console.error("Failed to fetch reviews:", error);
            }
        };

        const fetchRatingData = async () => {
            try {
                const res = await fetch(`/api/movie-ratings?id=${id}`);
                const data = await res.json();
                setRatingData(data);
            } catch (error) {
                console.error("Failed to fetch rating data:", error);
            } finally {
                setLoadingRatings(false);
            }
        };

        Promise.all([fetchMovie(), fetchAllGenres(), fetchAllMemberCategories(), fetchReviews(), fetchRatingData()]);
    }, [id]);

    const handleSubmitReview = async () => {
        if (!reviewRating) return;
        
        setIsSubmitting(true);
        try {
            const userId = localStorage.getItem('userId');

            if (!userId) {
                throw new Error('User not authenticated');
            }

            const endpoint = '/api/user-reviews';
            const method = userReview ? 'PUT' : 'POST';

            const response = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movieId: id,
                    userId: userId,
                    rating: reviewRating,
                    comment: reviewText.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error('Failed to submit review');

            const updatedReview = {
                userId: parseInt(userId),
                rating: reviewRating,
                comment: reviewText.trim() || null,
                firstName: 'You',
                lastName: '',
                createdAt: data.createdAt,
                updatedAt: data.updatedAt,
            };

            if (userReview) {
                // Update existing review in the list
                setReviews(reviews.map(review => 
                    review.userId === parseInt(userId) ? updatedReview : review
                ));
            } else {
                // Add new review to the list
                setReviews([updatedReview, ...reviews]);
            }

            setUserReview(updatedReview);
            setReviewRating(0);
            setReviewText('');
            setIsEditing(false);
            
            // Fetch updated movie data
            await fetchMovieData();
        } catch (error) {
            console.error('Failed to submit review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = () => {
        if (userReview) {
            setReviewRating(userReview.rating);
            setReviewText(userReview.comment || '');
        }
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form to original values
        if (userReview) {
            setReviewRating(userReview.rating);
            setReviewText(userReview.comment || '');
        }
    };

    const handleDeleteReview = async () => {
        if (!userReview) return;
        
        setIsSubmitting(true);
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                throw new Error('User not authenticated');
            }

            const response = await fetch('/api/user-reviews', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    movieId: id,
                    userId: userId,
                }),
            });

            if (!response.ok) throw new Error('Failed to delete review');

            // Remove the review from the local state
            setReviews(reviews.filter(review => review.userId !== parseInt(userId)));
            setUserReview(null);
            setReviewRating(0);
            setReviewText('');
            setIsEditing(false);
            
            // Fetch updated movie data
            await fetchMovieData();
        } catch (error) {
            console.error('Failed to delete review:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        router.push('/');
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
                        <IconButton 
                            onClick={handleBack}
                            className="absolute top-4 left-4 z-10 text-white bg-[#FFB800]/80 hover:bg-[#FFB800] hover:text-white"
                            size="large"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        {!posterLoading && moviePosterUrl && (
                            <div className="sticky top-20 h-[calc(100vh-80px)] flex items-center justify-center py-20">
                                <div className="relative w-full h-full">
                                    <Image
                                        loader={(prop) => prop.src}
                                        src={moviePosterUrl}
                                        alt={movie?.movie}
                                        layout="fill"
                                        objectFit="cover"
                                        className="object-cover"
                                        onError={() => setPosterUrl('/placeholder.png')}
                                    />
                                </div>
                            </div>
                        )}
                        {posterLoading && (
                            <div className="sticky top-20 h-[calc(100vh-80px)] flex items-center justify-center py-20">
                                <div className="relative w-full h-full bg-gray-100 animate-pulse" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto max-h-[calc(100vh-80px)]">
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
                                    {movie.imdb_rating ?? "-"}/10
                                </Typography>
                            </div>
                            <div className="flex items-center">
                                <FavoriteIcon className="text-red-500 mr-1" />
                                <Typography variant="h6" className="text-gray-900">
                                    {movie.imdb_votes ?? "N/A"}
                                </Typography>
                            </div>
                        </div>
                        <div className="mb-8">
                            <Typography variant="h6" className="text-gray-900 mb-3">Plot</Typography>
                            <Typography variant="body1" className="text-gray-700 leading-relaxed">
                                {moviePlot}
                            </Typography>
                        </div>
                        <div className="mb-8">
                            <Typography variant="h6" className="text-gray-900 mb-4">Featured Cast</Typography>
                            {movie.cast && movie.cast.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
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
                                                key={`${actor.id}-${actor.ordering}`}
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
                        <div className="mb-8">
                            <Typography variant="h6" className="text-gray-900 mb-3">Rating Trend</Typography>
                            {loadingRatings ? (
                                <Box className="flex justify-center items-center h-[400px]">
                                    <CircularProgress className="text-[#FFB800]" />
                                </Box>
                            ) : ratingData.length > 0 ? (
                                <RatingTrendGraph 
                                    ratings={ratingData} 
                                    movieTitle={movie?.movie || ''} 
                                />
                            ) : (
                                <Typography variant="body1" className="text-gray-600 italic">
                                    No rating data available
                                </Typography>
                            )}
                        </div>
                        <div className="mt-8">
                            <Typography variant="h5" className="font-bold mb-4">Reviews</Typography>
                            {averageUserRating !== null && (
                                <Box className="mb-6 p-6 bg-gradient-to-r from-[#FFB800]/10 to-[#FFA500]/10 rounded-lg border border-[#FFB800]/20">
                                    <div className="flex items-center justify-between mb-2">
                                        <Typography variant="h6" className="font-semibold text-gray-900">
                                            Average User Rating
                                        </Typography>
                                        <div className="flex items-center gap-1">
                                            <StarIcon className="text-[#FFB800]" />
                                            <Typography variant="h5" className="font-bold text-[#FFB800]">
                                                {averageUserRating}
                                            </Typography>
                                        </div>
                                    </div>
                                    <Box className="flex items-center gap-2">
                                        <Rating 
                                            value={averageUserRating} 
                                            precision={0.1} 
                                            readOnly 
                                            size="large"
                                            max={10}
                                            className="text-[#FFB800]"
                                        />
                                    </Box>
                                    <Typography variant="body2" className="mt-2 text-gray-600">
                                        Based on {movie.user_votes} user ratings
                                    </Typography>
                                </Box>
                            )}
                            {/* Review Form */}
                            {!userReview && (
                                <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
                                    {localStorage.getItem('userId') ? (
                                        <>
                                            <Typography variant="subtitle1" className="font-semibold mb-3">Write a Review</Typography>
                                            <div className="flex items-center mb-3">
                                                <Rating
                                                    value={reviewRating}
                                                    onChange={(_, newValue) => setReviewRating(newValue)}
                                                    precision={0.5}
                                                    size="large"
                                                    max={10}
                                                    className="text-[#FFB800]"
                                                />
                                                <Typography variant="body2" className="ml-2 text-gray-600">
                                                    {reviewRating ? `${reviewRating}/10` : 'Select rating'}
                                                </Typography>
                                            </div>
                                            <TextField
                                                fullWidth
                                                multiline
                                                rows={3}
                                                variant="outlined"
                                                placeholder="Share your thoughts about this movie..."
                                                value={reviewText}
                                                onChange={(e) => setReviewText(e.target.value)}
                                                className="mb-3"
                                            />
                                            <Button
                                                variant="contained"
                                                onClick={handleSubmitReview}
                                                disabled={!reviewRating || isSubmitting}
                                                className="bg-[#FFB800] hover:bg-[#FFA500]"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Review'}
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Typography variant="body1" className="text-gray-600">
                                                Please <Link href="/auth" className="text-[#FFB800] hover:text-[#FFA500]">log in</Link> to submit a review
                                            </Typography>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-4">
                                {reviews.length > 0 ? (
                                    reviews.map((review) => (
                                        <div key={review.userId} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center mb-2">
                                                <Avatar className="bg-[#FFB800] mr-2">
                                                    {review.firstName ? review.firstName.charAt(0) : '?'}
                                                </Avatar>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <Typography variant="subtitle1" className="font-semibold">
                                                            {userReview && userReview.userId === review.userId ? 'You' : `${review.firstName} ${review.lastName}`}
                                                        </Typography>
                                                        {userReview && userReview.userId === review.userId && (
                                                            <div className="flex gap-1">
                                                                <IconButton 
                                                                    onClick={handleEditClick}
                                                                    className="text-gray-500 hover:text-[#FFB800]"
                                                                >
                                                                    <EditIcon />
                                                                </IconButton>
                                                                <IconButton 
                                                                    onClick={handleDeleteReview}
                                                                    className="text-gray-500 hover:text-red-500"
                                                                    disabled={isSubmitting}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center">
                                                        <StarIcon className="text-yellow-400 text-sm mr-1" />
                                                        <Typography variant="body2" className="text-gray-600">
                                                            {review.rating}/10
                                                        </Typography>
                                                    </div>
                                                </div>
                                            </div>
                                            {isEditing && userReview && userReview.userId === review.userId ? (
                                                <div className="mt-4">
                                                    <div className="flex items-center mb-3">
                                                        <Rating
                                                            value={reviewRating}
                                                            onChange={(_, newValue) => setReviewRating(newValue)}
                                                            precision={0.5}
                                                            size="large"
                                                            max={10}
                                                            className="text-[#FFB800]"
                                                        />
                                                        <Typography variant="body2" className="ml-2 text-gray-600">
                                                            {reviewRating ? `${reviewRating}/10` : 'Select rating'}
                                                        </Typography>
                                                    </div>
                                                    <TextField
                                                        fullWidth
                                                        multiline
                                                        rows={3}
                                                        variant="outlined"
                                                        placeholder="Share your thoughts about this movie..."
                                                        value={reviewText}
                                                        onChange={(e) => setReviewText(e.target.value)}
                                                        className="mb-3"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="contained"
                                                            onClick={handleSubmitReview}
                                                            disabled={!reviewRating || isSubmitting}
                                                            className="bg-[#FFB800] hover:bg-[#FFA500]"
                                                        >
                                                            {isSubmitting ? 'Updating...' : 'Update Review'}
                                                        </Button>
                                                        <Button
                                                            variant="outlined"
                                                            onClick={handleCancelEdit}
                                                            className="text-gray-600"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    {review.comment && (
                                                        <Typography variant="body2" className="text-gray-700">
                                                            {review.comment}
                                                        </Typography>
                                                    )}
                                                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                                        <Typography variant="caption">
                                                            Posted on {new Date(review.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                        {review.updatedAt && review.updatedAt !== review.createdAt && (
                                                            <>
                                                                <span>•</span>
                                                                <Typography variant="caption" className="italic">
                                                                    Edited on {new Date(review.updatedAt).toLocaleDateString()}
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <Typography variant="body1" className="text-gray-600 italic">
                                        No reviews yet. Be the first to review this movie!
                                    </Typography>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetails;
