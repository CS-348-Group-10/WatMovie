import { useState, useEffect } from 'react';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    FormControlLabel, 
    Checkbox, 
    Autocomplete, 
    Container, 
    Alert, 
    CircularProgress,
    Stepper,
    Step,
    StepLabel,
    Card,
    CardContent,
    IconButton,
    Tooltip
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import Image from 'next/image';
import { Genre } from '@/types';
import { useRouter } from 'next/router';
import MovieIcon from '@mui/icons-material/Movie';
import InfoIcon from '@mui/icons-material/Info';

interface AlertState {
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

interface MovieFormData {
    movieName: string;
    isAdult: boolean;
    releaseYear: string;
    duration: string;
    totalVotes: string;
    sumVotes: string;
    genres: Genre[];
}

const steps = ['Basic Info', 'Details', 'Genres'];

export default function AddMovie() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [loading, setLoading] = useState(false);

    const { 
        handleSubmit, 
        control, 
        register, 
        setValue, 
        formState: { errors, isSubmitting },
        watch,
        getValues
    } = useForm<MovieFormData>({
        defaultValues: {
            movieName: '',
            isAdult: false,
            releaseYear: '',
            duration: '',
            totalVotes: '',
            sumVotes: '',
            genres: []
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch genres
                const genresRes = await fetch('/api/genres');
                if (!genresRes.ok) throw new Error('Failed to fetch genres');
                const genresData = await genresRes.json();
                setGenres(genresData);
            } catch (error) {
                console.error('Failed to fetch data:', error);
                setAlert({
                    message: 'Failed to load data. Please try again.',
                    severity: 'error'
                });
            }
        };

        fetchData();
    }, []);

    const handleNext = () => {
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const onSubmit = async (data: MovieFormData) => {
        setLoading(true);
        setAlert(null);

        const movieObject = {
            id: `ctt${Math.floor(Math.random() * 1000000)}`,
            name: `${data.movieName} (Custom)`,
            is_adult: data.isAdult,
            release_year: data.releaseYear ? Number(data.releaseYear) : null,
            duration: data.duration ? Number(data.duration) : null,
            total_votes: data.totalVotes ? Number(data.totalVotes) : 0,
            sum_of_votes: data.sumVotes ? Number(data.sumVotes) : 0,
            genre_ids: data.genres?.map(genre => genre.id) || []
        };

        // Validate numeric fields
        if ((movieObject.release_year !== null && isNaN(movieObject.release_year)) || 
            (movieObject.duration !== null && isNaN(movieObject.duration)) || 
            isNaN(movieObject.total_votes) || 
            isNaN(movieObject.sum_of_votes)) {
            setAlert({
                message: 'Please enter valid numbers for all numeric fields',
                severity: 'error'
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch("/api/insert-movie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(movieObject)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                setAlert({
                    message: 'Movie added successfully! Redirecting...',
                    severity: 'success'
                });
                setTimeout(() => router.push(`/movies/${movieObject.id}`), 2000);
            } else {
                throw new Error(result.message || 'Failed to add movie');
            }
        } catch (error) {
            setAlert({
                message: error instanceof Error ? error.message : 'An unexpected error occurred',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const renderStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField 
                            label="Movie Name" 
                            {...register("movieName", { 
                                required: "Movie name is required",
                                minLength: { value: 2, message: "Movie name must be at least 2 characters" }
                            })}
                            error={!!errors.movieName}
                            helperText={errors.movieName?.message}
                            fullWidth 
                            InputProps={{
                                startAdornment: <MovieIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            }}
                        />
                        
                        <FormControlLabel
                            control={<Checkbox {...register("isAdult")} />}
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    Is Adult Content
                                    <Tooltip title="Check this if the movie contains adult content">
                                        <InfoIcon fontSize="small" color="action" />
                                    </Tooltip>
                                </Box>
                            }
                        />
                        
                        <TextField
                            label="Release Year"
                            type="number"
                            {...register("releaseYear", {
                                required: "Release year is required",
                                min: { value: 1888, message: "Release year must be after 1888" },
                                max: { value: new Date().getFullYear(), message: "Release year cannot be in the future" }
                            })}
                            error={!!errors.releaseYear}
                            helperText={errors.releaseYear?.message}
                            fullWidth
                        />
                    </Box>
                );
            case 1:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField 
                            label="Duration (minutes)" 
                            type="number" 
                            {...register("duration", {
                                min: { value: 1, message: "Duration must be at least 1 minute" }
                            })}
                            error={!!errors.duration}
                            helperText={errors.duration?.message}
                            fullWidth 
                        />
                        
                        <TextField 
                            label="Total Votes" 
                            type="number" 
                            {...register("totalVotes", {
                                min: { value: 0, message: "Total votes cannot be negative" }
                            })}
                            error={!!errors.totalVotes}
                            helperText={errors.totalVotes?.message}
                            fullWidth 
                        />
                        
                        <TextField 
                            label="Sum of Votes" 
                            type="number" 
                            {...register("sumVotes", {
                                min: { value: 0, message: "Sum of votes cannot be negative" },
                                validate: value => {
                                    if (value === '') return true;
                                    const num = Number(value);
                                    return !isNaN(num) || 'Please enter a valid number';
                                }
                            })}
                            error={!!errors.sumVotes}
                            helperText={errors.sumVotes?.message}
                            fullWidth 
                        />
                    </Box>
                );
            case 2:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Controller
                            name="genres"
                            control={control}
                            rules={{ 
                                required: "Please select at least one genre",
                                validate: (value) => {
                                    if (!value || value.length === 0) {
                                        return "Please select at least one genre";
                                    }
                                    return true;
                                }
                            }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <Autocomplete
                                    multiple
                                    options={genres}
                                    value={value || []}
                                    onChange={(_, newValue) => {
                                        onChange(newValue);
                                        setValue("genres", newValue);
                                    }}
                                    getOptionLabel={(option) => option.name}
                                    renderInput={(params) => (
                                        <TextField 
                                            {...params} 
                                            label="Genres" 
                                            error={!!error}
                                            helperText={error?.message}
                                            fullWidth 
                                        />
                                    )}
                                />
                            )}
                        />
                    </Box>
                );
            default:
                return null;
        }
    };

    return (
        <Box className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-white">
            <Container maxWidth="lg" className="flex-1 flex flex-col py-8">
                <Box className="flex flex-col items-center mb-8">
                    <Image 
                        src="/logo.png" 
                        alt="WatMovie Logo"
                        width={150}
                        height={150}
                        className="mb-6"
                    />
                    <Typography variant="h4" component="h1" className="font-bold text-gray-800 mb-2">
                        Add a New Movie
                    </Typography>
                    <Typography variant="subtitle1" className="text-gray-600 text-center max-w-md">
                        Fill in the details below to add a new movie to our database. 
                        Follow the steps to complete the process.
                    </Typography>
                </Box>

                <Box className="flex justify-center">
                    <Card className="w-full max-w-[600px] shadow-lg">
                        <CardContent className="p-6">
                            <Stepper activeStep={activeStep} className="mb-8">
                                {steps.map((label) => (
                                    <Step key={label}>
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>

                            {alert && (
                                <Alert 
                                    severity={alert.severity}
                                    onClose={() => setAlert(null)}
                                    sx={{ mb: 3 }}
                                >
                                    {alert.message}
                                </Alert>
                            )}

                            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                                {renderStepContent(activeStep)}

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                    <Button
                                        onClick={handleBack}
                                        disabled={activeStep === 0}
                                        variant="outlined"
                                        className="text-gray-600"
                                    >
                                        Back
                                    </Button>
                                    {activeStep === steps.length - 1 ? (
                                        <Button 
                                            type="submit"
                                            variant="contained"
                                            disabled={loading || isSubmitting}
                                            className="bg-[#FFB800] hover:bg-[#FFA500]"
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                'Add Movie'
                                            )}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleNext}
                                            variant="contained"
                                            className="bg-[#FFB800] hover:bg-[#FFA500]"
                                        >
                                            Next
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Container>
        </Box>
    );
} 
