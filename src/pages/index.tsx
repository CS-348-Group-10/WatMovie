import { useEffect, useState } from 'react';
import MovieCard from '../components/movieCard';
import { Title } from '../types';
import Filters from '../components/filters_copy';
import Header from '../components/header';
import { Container } from '@mui/material'

export default function Home() {


  const [typesMap, setTypesMap] = useState(new Map<number, string>());
  const [genresMap, setGenresMap] = useState(new Map<number, string>());
  const [duration, setDuration] = useState<string>('');
  const [rating, setRating] = useState<string>('');	
  const [movies, setMovies] = useState<Title[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [moviesLoaded, setMoviesLoaded] = useState<boolean>(false);

  const [selectedTypes, setSelectedTypes] = useState<number[]>([]);
  const [search, setSearch] = useState<string>('');
  const [showAdult, setShowAdult] = useState<boolean>(false);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [minDuration, setMinDuration] = useState<number | null>(null);
  const [maxDuration, setMaxDuration] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [maxRating, setMaxRating] = useState<number | null>(null);

  const fetchTitleTypes = async () => {
	try {
		const response = await fetch('/api/title-types')
		const data = await response.json()
		const map = new Map<number, string>()
		data.forEach((type: { id: number, name: string }) => map.set(type.id, type.name))
		setTypesMap(map)
	} catch (error) {
		console.error('Failed to fetch title types:', error)
	}
  }

  const fetchGenres = async () => {
	try {
		const response = await fetch('/api/genres')
		const data = await response.json()
		const map = new Map<number, string>()
		data.forEach((genre: { id: number, name: string }) => map.set(genre.id, genre.name))
		setGenresMap(map)
	} catch (error) {
		console.error('Failed to fetch title types:', error)
	}
  }

  useEffect(() => {
	setLoading(true);
	fetchTitleTypes();
	fetchGenres();
	setLoading(false);
  }, []);

  useEffect(() => {
    const fetchMovies = async () => {
      setMoviesLoaded(true);
      try {
        const queryParams = new URLSearchParams({
		  ...(selectedTypes.length !== 0 && { typeIds: selectedTypes.join(',')}),
          ...(search === '' && { searchQuery: search}),
          ...(selectedGenres.length !== 0 && { genreIds: selectedGenres.join(',')}),
		  ...(showAdult && { isAdult: showAdult.toString()}),
		  ...(minDuration && { minDuration: duration}),
		  ...(maxDuration && { maxDuration: duration}),
		  ...(minRating && { minRating: rating}),
		  ...(maxRating && { maxRating: rating}),
        });
        const res = await fetch(`/api/titles?${queryParams}`);
        const data = await res.json();
        setMovies(data);
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      }
      setMoviesLoaded(false);
    };

    fetchMovies();
  }, [selectedTypes]);

  const fetchRandomMovie = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/random-title');
      const data = await res.json();
      setMovies([data]);
    } catch (error) {
      console.error('Failed to fetch random movie:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container p-4 text-black dark:text-white min-w-full">
		<div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
			<Header />
		</div>
      <div className="flex pt-20">
        <div className="w-1/4 p-4">
          <Filters
		    types={typesMap}
			genres={genresMap}

			setSelectedTypes={setSelectedTypes}
            setSelectedGenres={setSelectedGenres}
			setMinDuration={setMinDuration}
			setMaxDuration={setMaxDuration}
			setMinRating={setMinRating}
			setMaxRating={setMaxRating}
          />
        </div>
        <div className="w-3/4 p-4">
          {moviesLoaded || loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {movies.map((movie) => (
                <MovieCard
				key={movie.id}
				id={movie.id}
				title={movie.title}
				rating={movie.rating}
				genres={movie.genre_ids ? movie.genre_ids.map((id) => genresMap.get(id)) : null}
				duration={movie.duration}
				/>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
