import { useEffect, useState } from 'react'
import Filters from '../components/filters'
import Header from '../components/header'
import MovieCard from '../components/movieCard'
import { Movie } from '../types'
import { Box, Pagination } from "@mui/material";
import { useRouter } from 'next/router';

const ITEMS_PER_PAGE = 12; // Number of movies to show per page

export default function Home() {
	const [genresMap, setGenresMap] = useState(new Map<number, string>())
	const [movies, setMovies] = useState<Movie[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [moviesLoaded, setMoviesLoaded] = useState<boolean>(false)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState<number | null>(null)
	const [watchlist, setWatchlist] = useState<string[]>([])

	const [search, setSearch] = useState<string>('')
	const [showAdult, setShowAdult] = useState<boolean>(false)
	const [selectedGenres, setSelectedGenres] = useState<number[]>([])
	const [minDuration, setMinDuration] = useState<number | null>(null)
	const [maxDuration, setMaxDuration] = useState<number | null>(null)
	const [minRating, setMinRating] = useState<number | null>(null)
	const [maxRating, setMaxRating] = useState<number | null>(null)
	const [startYear, setStartYear] = useState<number | null>(null)
	const [endYear, setEndYear] = useState<number | null>(null)
	const [minVotes, setMinVotes] = useState<number | null>(null)

	const router = useRouter()

	const fetchGenres = async () => {
		try {
			const response = await fetch('/api/genres')
			const data = await response.json()
			const map = new Map<number, string>()
			data.forEach((genre: { id: number, name: string }) => map.set(genre.id, genre.name))
			setGenresMap(map)
		} catch (error) {
			console.error('Failed to fetch genres:', error)
		}
	}

	const fetchPagecount = async () => {
		try {
			const response = await fetch('/api/movies?count=true')
			const data = await response.json()
			setTotalPages(data)
		} catch (error) {
			console.error('Failed to fetch total movies:', error)
		}
	}

	const fetchUserWatchlist = async () => {
		const userId = localStorage.getItem('userId');
		if (!userId) return;

		try {
			const response = await fetch(`/api/watchlists?userId=${userId}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});
			if (!response.ok) {
				throw new Error('Failed to fetch watchlist');
			}
			const data = await response.json();		
			setWatchlist(data);
		} catch (error) {
			console.error('Failed to fetch watchlist:', error);
		}
	};

	useEffect(() => {
		setLoading(true)
		fetchPagecount()
		fetchGenres()
		fetchUserWatchlist()
		setLoading(false)
	}, [])

	useEffect(() => {
		const fetchMovies = async () => {
			setMoviesLoaded(true)
			try {
				const queryParams = new URLSearchParams({
					...(search !== '' && { searchQuery: search}),
					...(selectedGenres.length !== 0 && { genreIds: selectedGenres.join(',')}),
					isAdult: showAdult.toString(),
					...(minDuration && { minDuration: minDuration.toString() }),
					...(maxDuration && { maxDuration: maxDuration.toString()}),
					...(minRating && { minRating: minRating.toString()}),
					...(maxRating && { maxRating: maxRating.toString()}),
					...(startYear && { startYear: startYear.toString()}),
					...(endYear && { endYear: endYear.toString()}),
					...(minVotes && { minVotes: minVotes.toString()}),
					pageSize: ITEMS_PER_PAGE.toString(),
					page: page.toString()
				})
				const queryString = queryParams.toString()
				const url = queryString ? `api/movies?${queryParams}` : '/api/movies'
				const res = await fetch(url)
				const data = await res.json()
				setMovies(data)
			} catch (error) {
				console.error('Failed to fetch movies:', error)
			}
			setMoviesLoaded(false)
		}

		fetchMovies()
	}, [minDuration, maxDuration, startYear, endYear, minRating, maxRating, selectedGenres, search, showAdult, minVotes, page])
	
	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value)
	}

	const handleWatchlistToggle = async (movieId: string) => {
		const userId = localStorage.getItem('userId');
		if (!userId) {
			router.push('/auth');
			return;
		}

		try {
			const isInWatchlist = watchlist.includes(movieId);
			const response = await fetch('/api/watchlists', {
				method: isInWatchlist ? 'DELETE' : 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId,
					movieId
				})
			});

			if (!response.ok) {
				throw new Error('Failed to update watchlist');
			}

			setWatchlist(prev => 
				isInWatchlist 
					? prev.filter(id => id !== movieId)
					: [...prev, movieId]
			);
		} catch (error) {
			console.error('Failed to update watchlist:', error);
		}
	};

	return (
		<div className="container p-1 text-black dark:text-white min-w-full">
			<div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
				<Header 
					setSearch={setSearch}
				/>
			</div>
			<div className="flex h-screen pt-20">
				<div className="w-1/4 p-4 overflow-y-auto">
					<Filters
						genres={genresMap}
						setSelectedGenres={setSelectedGenres}
						setMinDuration={setMinDuration}
						setMaxDuration={setMaxDuration}
						setMinRating={setMinRating}
						setMaxRating={setMaxRating}
						setStartYear={setStartYear}
						setEndYear={setEndYear}
						setIncludeAdult={setShowAdult}
						setMinVotes={setMinVotes}
					/>
				</div>
				<div className="w-full p-4 overflow-y-auto">
					{moviesLoaded || loading ? (
						<p>Loading...</p>
					) : (
						<>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-12 place-items-center">
								{movies.map((movie) => (
									<MovieCard
										key={movie.id}
										id={movie.id}
										movie={movie.movie}
										rating={movie.rating}
										genres={movie.genre_ids ? movie.genre_ids.map((id) => genresMap.get(id)) : null}
										duration={movie.duration}
										votes={movie.votes}
										isInWatchlist={watchlist.includes(movie.id)}
										onWatchlistToggle={handleWatchlistToggle}
									/>
								))}
							</div>
							<Box className="flex justify-center mt-8">
								<Pagination
									count={totalPages ? Math.ceil(totalPages / ITEMS_PER_PAGE) : 0}
									page={page}
									onChange={handlePageChange}
									color="primary"
									size="large"
									showFirstButton
									showLastButton
									className="bg-white px-4 py-2 rounded-lg shadow-sm"
								/>
							</Box>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
