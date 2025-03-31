import { useState, useEffect, useCallback } from 'react';
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
    Tooltip,
    Stack
} from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import Image from 'next/image';
import { Genre, MovieRole } from '@/types';
import { useRouter } from 'next/router';
import MovieIcon from '@mui/icons-material/Movie';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

interface AlertState {
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
}

interface CastMember {
    professional: { id: string; name: string } | null;
    role: { id: string; name: string } | null;
    characters: string;
}

interface MovieFormData {
    movieName: string;
    isAdult: boolean;
    releaseYear: string;
    duration: string;
    totalVotes: string;
    sumVotes: string;
    genres: Genre[];
    cast: CastMember[];
}

const steps = ['Basic Info', 'Details', 'Genres', 'Cast'];

export default function AddMovie() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [genres, setGenres] = useState<Genre[]>([]);
    const [roles, setRoles] = useState<MovieRole[]>([]);
    const [alert, setAlert] = useState<AlertState | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchingProfessional, setSearchingProfessional] = useState(false);
    const [professionalOptions, setProfessionalOptions] = useState<{ id: string; name: string }[]>([]);

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
            genres: [],
            cast: [{ professional: null, role: null, characters: '' }]
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

                // Fetch roles
                const rolesRes = await fetch('/api/movie-roles');
                if (!rolesRes.ok) throw new Error('Failed to fetch roles');
                const rolesData = await rolesRes.json();
                setRoles(rolesData);
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

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim()) {
                setProfessionalOptions([]);
                return;
            }

            setSearchingProfessional(true);
            try {
                const response = await fetch(`/api/movie-professionals/search?name=${encodeURIComponent(query)}`);
                if (!response.ok) throw new Error('Failed to fetch professionals');
                const data = await response.json();
                setProfessionalOptions(data.map((p: any) => ({
                    id: p.pid,
                    name: p.primary_name
                })));
            } catch (error) {
                console.error('Error searching professionals:', error);
                setProfessionalOptions([]);
            } finally {
                setSearchingProfessional(false);
            }
        }, 100),
        []
    );

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, [debouncedSearch]);

    const handleNext = async () => {
        let isValid = true;
        let errorMessage = '';

        switch (activeStep) {
            case 0: // Basic Info
                const movieName = getValues('movieName');
                const releaseYear = getValues('releaseYear');
                
                if (!movieName) {
                    errorMessage = 'Movie name is required';
                    isValid = false;
                } else if (movieName.length < 2) {
                    errorMessage = 'Movie name must be at least 2 characters';
                    isValid = false;
                } else if (!releaseYear) {
                    errorMessage = 'Release year is required';
                    isValid = false;
                } else {
                    const year = Number(releaseYear);
                    if (isNaN(year) || year < 1888 || year > new Date().getFullYear()) {
                        errorMessage = 'Please enter a valid release year between 1888 and current year';
                        isValid = false;
                    }
                }
                break;

            case 1: // Details
                const totalVotes = getValues('totalVotes');
                const sumVotes = getValues('sumVotes');
                
                if (!totalVotes) {
                    errorMessage = 'Total votes is required';
                    isValid = false;
                } else if (!sumVotes) {
                    errorMessage = 'Sum of votes is required';
                    isValid = false;
                } else {
                    const total = Number(totalVotes);
                    const sum = Number(sumVotes);
                    
                    if (isNaN(total) || total < 0) {
                        errorMessage = 'Total votes must be a valid positive number';
                        isValid = false;
                    } else if (isNaN(sum) || sum < 0) {
                        errorMessage = 'Sum of votes must be a valid positive number';
                        isValid = false;
                    } else if (total === 0) {
                        errorMessage = 'Total votes must be greater than 0';
                        isValid = false;
                    } else {
                        const ratio = sum / total;
                        if (ratio < 1 || ratio > 10) {
                            errorMessage = 'Average rating must be between 1 and 10';
                            isValid = false;
                        }
                    }
                }
                break;

            case 2: // Genres
                const genres = getValues('genres');
                if (!genres || genres.length === 0) {
                    errorMessage = 'Please select at least one genre';
                    isValid = false;
                }
                break;
        }

        if (!isValid) {
            setAlert({
                message: errorMessage,
                severity: 'error'
            });
            return;
        }

        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const addCastMember = () => {
        const currentCast = getValues('cast');
        const newCast = [...currentCast, { professional: null, role: null, characters: '' }];
        setValue('cast', newCast, { shouldValidate: true });
    };

    const removeCastMember = (index: number) => {
        const currentCast = getValues('cast');
        setValue('cast', currentCast.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: MovieFormData) => {
        // Check if any professional is not properly searched
        for (let i = 0; i < data.cast.length; i++) {
            const member = data.cast[i];
            debouncedSearch(member.professional?.name || '');
        }

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
            genre_ids: data.genres?.map(genre => genre.id) || [],
            cast: data.cast.map((member, index) => ({
                ordering: index + 1,
                pid: member.professional?.id || '',
                rid: member.role?.id || '',
                job: null,
                characters: member.characters
            }))
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
                                required: "Total votes is required",
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
                                required: "Sum of votes is required",
                                min: { value: 0, message: "Sum of votes cannot be negative" },
                                validate: (value, formValues) => {
                                    if (value === '') return "Sum of votes is required";
                                    const num = Number(value);
                                    if (isNaN(num)) return 'Please enter a valid number';
                                    
                                    const totalVotes = Number(formValues.totalVotes);
                                    if (totalVotes === 0) return 'Total votes must be greater than 0';
                                    
                                    const ratio = num / totalVotes;
                                    if (ratio < 1 || ratio > 10) {
                                        return 'Average rating must be between 1 and 10';
                                    }
                                    return true;
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
            case 3:
                return (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Stack spacing={3}>
                            {watch('cast').map((member, index) => (
                                <Card key={index} className="p-4">
                                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Controller
                                                name={`cast.${index}.professional`}
                                                control={control}
                                                rules={{ required: "Please select a professional" }}
                                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                    <Autocomplete<{ id: string; name: string } | null>
                                                        options={professionalOptions}
                                                        value={value}
                                                        onChange={(_, newValue) => {
                                                            onChange(newValue);
                                                            const newCast = [...watch('cast')];
                                                            newCast[index] = { ...newCast[index], professional: newValue };
                                                            setValue("cast", newCast);
                                                        }}
                                                        onInputChange={(_, newInputValue) => {
                                                            debouncedSearch(newInputValue);
                                                        }}
                                                        getOptionLabel={(option) => option?.name || ''}
                                                        loading={searchingProfessional}
                                                        renderInput={(params) => (
                                                            <TextField 
                                                                {...params} 
                                                                label="Professional" 
                                                                error={!!error}
                                                                helperText={error?.message}
                                                                fullWidth
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    endAdornment: (
                                                                        <>
                                                                            {searchingProfessional ? <CircularProgress color="inherit" size={20} /> : null}
                                                                            {params.InputProps.endAdornment}
                                                                        </>
                                                                    ),
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <Controller
                                                name={`cast.${index}.role`}
                                                control={control}
                                                rules={{ required: "Please select a role" }}
                                                render={({ field: { onChange, value }, fieldState: { error } }) => (
                                                    <Autocomplete<{ id: string; name: string } | null>
                                                        options={roles}
                                                        value={value || null}
                                                        onChange={(_, newValue) => {
                                                            onChange(newValue);
                                                            const newCast = [...watch('cast')];
                                                            newCast[index] = { ...newCast[index], role: newValue };
                                                            setValue("cast", newCast);
                                                        }}
                                                        getOptionLabel={(option) => option?.name || ''}
                                                        renderInput={(params) => (
                                                            <TextField 
                                                                {...params} 
                                                                label="Role" 
                                                                error={!!error}
                                                                helperText={error?.message}
                                                                fullWidth 
                                                            />
                                                        )}
                                                    />
                                                )}
                                            />
                                        </Box>
                                        <Box sx={{ flex: 1 }}>
                                            <TextField
                                                label="Characters"
                                                {...register(`cast.${index}.characters`)}
                                                fullWidth
                                            />
                                        </Box>
                                        <IconButton 
                                            onClick={() => removeCastMember(index)}
                                            color="error"
                                            disabled={watch('cast').length === 1}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Card>
                            ))}
                            <Button
                                startIcon={<AddIcon />}
                                onClick={() => {
                                    const currentCast = watch('cast');
                                    setValue('cast', [...currentCast, { professional: null, role: null, characters: '' }], { shouldValidate: true });
                                }}
                                variant="outlined"
                                className="mt-2"
                            >
                                Add Cast Member
                            </Button>
                        </Stack>
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
                    <Card className="w-full max-w-[800px] shadow-lg">
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

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): T & { cancel: () => void } {
    let timeout: NodeJS.Timeout;
    const debounced = (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced as T & { cancel: () => void };
} 
