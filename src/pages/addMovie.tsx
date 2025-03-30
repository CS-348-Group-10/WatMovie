import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, FormControlLabel, Checkbox, Autocomplete, Paper, Container, Alert } from '@mui/material';
import { useForm, Controller } from "react-hook-form";
import Image from 'next/image';
import { Genre } from '@/types';


export default function AddMovie() {
    const { handleSubmit, control, register, setValue } = useForm();
    const [genres, setGenres] = useState([]);
    const [alert, setAlert] = useState(null);

    const fetchAllGenres = async () => {
        const res = await fetch(`/api/genres`);
        const data = await res.json();
        setGenres(data);
    };

    useEffect(() => {
        Promise.all([fetchAllGenres()]);
    }, []);

    const onSubmit = async (data: any) => {
        const movieObject = {
          id: `ctt${Math.floor(Math.random() * 1000000)}`,
          name: `${data.movieName} (Custom)`,
          is_adult: data.isAdult || false,
          release_year: data.releaseYear,
          duration: data.duration || null,
          total_votes: data.totalVotes || 0,
          sum_of_votes: data.sumVotes || 0,
          genre_ids: data.genres.map((genre: Genre) => genre.id),
        };
    
        try {
            const response = await fetch("/api/insert-movie", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(movieObject),
            });
            const result = await response.json();
            
            let severity = "warning";
            if (response.status === 200){
                severity = "success";
            }
            else if (response.status === 500) severity = "error";
            
            setAlert({ message: result.message, severity });
          } catch (error) {
            setAlert({ message: "An unexpected error occurred", severity: "error" });
          }
      };

    return (
        <Box className="min-h-screen flex flex-col bg-white text-gray-800">
        <Container maxWidth="lg" className="flex-1 flex flex-col justify-center py-4">
            <Box className="flex flex-col items-center mb-4">
            <Image 
                src="/logo.png" 
                alt="WatMovie Logo"
                width={200}
                height={200}
                className="mb-8"
            />
            <Typography variant="h4" component="h1" className="font-bold text-gray-800 mb-2">
                Welcome to WatMovie
            </Typography>
            <Typography variant="subtitle1" className="text-gray-600 mb-4">
                Add a new movie to the database
            </Typography>
            </Box>

            <Box className="flex justify-center">
            <Paper 
                elevation={3} 
                className="w-full max-w-[500px] bg-white border border-gray-200"
            >
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ maxWidth: 400, mx: "auto", mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {alert && <Alert severity={alert.severity}>{alert.message}</Alert>}
                <TextField label="Movie Name" {...register("movieName", { required: true })} fullWidth />
                
                <FormControlLabel
                    control={<Checkbox {...register("isAdult")} />}
                    label="Is Adult"
                />
                
                <TextField
                    label="Release Year"
                    type="number"
                    {...register("releaseYear", {
                    required: true,
                    min: 1000,
                    max: new Date().getFullYear(),
                    })}
                    fullWidth
                />
                
                <TextField label="Duration (minutes)" type="number" {...register("duration")} fullWidth />
                
                <TextField label="Total Votes" type="number" {...register("totalVotes")} fullWidth />
                
                <TextField label="Sum of Votes" type="number" {...register("sumVotes")} fullWidth />
                
                <Controller
                    name="genres"
                    control={control}
                    render={({ field }) => (
                    <Autocomplete
                        {...field}
                        options={genres}
                        getOptionLabel={(option) => option.name}
                        onChange={(_, value) => setValue("genres", value)}
                        renderInput={(params) => <TextField {...params} label="Genres" fullWidth />}
                        multiple
                    />
                    )}
                />
                
                <Button type="submit" variant="contained">Submit</Button>
            </Box>
            </Paper>
            </Box>
        </Container>
        </Box>
    );
} 
