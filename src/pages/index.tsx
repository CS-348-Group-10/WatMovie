import { useEffect, useState } from 'react'
import Filters from '../components/filters'
import Header from '../components/header'
import MovieCard from '../components/movieCard'
import { Movie, SortType, SortOrder } from '../types'
import { Box, Pagination, FormControl, Select, InputLabel, MenuItem, IconButton, Button, CircularProgress } from "@mui/material";
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { useRouter } from 'next/router';

const ITEMS_PER_PAGE = 12; // Number of movies to show per page

type SortOption = {
	value: string;
	label: string;
}

const sortOptions: SortOption[] = [
	{ value: SortType.TITLE, label: 'Title (A - Z)' },
	{ value: SortType.IMDB_RATING, label: 'IMDb Rating' },
	{ value: SortType.YEAR, label: 'Year' },
	{ value: SortType.RUNTIME, label: 'Runtime' }
];

export default function Home() {
	const [genresMap, setGenresMap] = useState(new Map<number, string>())
	const [movies, setMovies] = useState<Movie[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [moviesLoaded, setMoviesLoaded] = useState<boolean>(false)
	const [page, setPage] = useState(1)
	const [totalPages, setTotalPages] = useState<number | null>(null)
	const [watchlist, setWatchlist] = useState<string[]>([])
	const [sortType, setSortType] = useState<SortType | null>(null)
	const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASC)

	const [search, setSearch] = useState<string | null>(null)
	const [excludeAdult, setExcludeAdult] = useState<boolean>(false)
	const [selectedGenres, setSelectedGenres] = useState<number[]>([])
	const [minDuration, setMinDuration] = useState<number | null>(null)
	const [maxDuration, setMaxDuration] = useState<number | null>(null)
	const [minRating, setMinRating] = useState<number | null>(7)
	const [maxRating, setMaxRating] = useState<number | null>(null)
	const [startYear, setStartYear] = useState<number | null>(null)
	const [endYear, setEndYear] = useState<number | null>(null)
	const [minVotes, setMinVotes] = useState<number | null>(2000)

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

	const fetchMovies = async () => {
		setMoviesLoaded(true)
		try {
			const queryParams = new URLSearchParams({
				...(search && search !== '' && { searchQuery: search}),
				...(selectedGenres.length !== 0 && { genreIds: selectedGenres.join(',')}),
				...(excludeAdult && { isAdult: 'false'}),
				...(minDuration && { minDuration: minDuration.toString() }),
				...(maxDuration && { maxDuration: maxDuration.toString()}),
				...(minRating && { minRating: minRating.toString()}),
				...(maxRating && { maxRating: maxRating.toString()}),
				...(startYear && { startYear: startYear.toString()}),
				...(endYear && { endYear: endYear.toString()}),
				...(minVotes && { minVotes: minVotes.toString()}),
				...(sortType && { sortType: sortType}),
				...(sortOrder && { sortOrder: sortOrder}),
				pageSize: ITEMS_PER_PAGE.toString(),
				page: page.toString()
			})
			const queryString = queryParams.toString()
			const url = queryString ? `api/movies?${queryParams}` : '/api/movies'
			const res = await fetch(url)
			const data = await res.json()
			setMovies(data.movies || [])
			setTotalPages(data.total_pages)
		} catch (error) {
			console.error('Failed to fetch movies:', error)
		}
		setMoviesLoaded(false)
	};

	useEffect(() => {
		setLoading(true)
		fetchGenres()
		fetchUserWatchlist()
		fetchMovies()
		setLoading(false)
	}, [])

	// search
	useEffect(() => {
		if (search != null) {
			fetchMovies()
		}
	}, [search])

	// sort by
	useEffect(() => {
		if (sortType) {
			fetchMovies()
		}
	}, [sortType, sortOrder])

	useEffect(() => {
		fetchMovies()
	}, [page])
	
	const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
		setPage(value);
		router.push({
			pathname: '/',
			query: { page: value }
		}, undefined, { shallow: true });
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

	const handleSearchChange = (value: string) => {
		setSearch(value)
		setPage(1)
		router.push({
			pathname: '/',
			query: { page: 1 }
		}, undefined, { shallow: true })
	}

	const handleFilterChange = (setter: (value: any) => void, value: any) => {
		setter(value)
		setPage(1)
		router.push({
			pathname: '/',
			query: { page: 1 }
		}, undefined, { shallow: true })
	}

	const handleSortTypeChange = (event: any) => {
		setSortType(event.target.value);
		setPage(1);
		router.push({
			pathname: '/',
			query: { page: 1 }
		}, undefined, { shallow: true });
	};

	const handleSortOrderChange = () => {
		setSortOrder(prevOrder => 
			prevOrder === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC
		);
		setPage(1);
		router.push({
			pathname: '/',
			query: { page: 1 }
		}, undefined, { shallow: true });
	};

	return (
		<div className="container p-1 text-black dark:text-white min-w-full">
			<div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
				<Header 
					setSearch={handleSearchChange}
				/>
			</div>
			<div className="flex h-screen pt-20">
				<div className="w-1/4 p-4 overflow-y-auto">
					<Filters
						genres={genresMap}
						setSelectedGenres={(value) => handleFilterChange(setSelectedGenres, value)}
						setMinDuration={(value) => handleFilterChange(setMinDuration, value)}
						setMaxDuration={(value) => handleFilterChange(setMaxDuration, value)}
						setMinRating={(value) => handleFilterChange(setMinRating, value)}
						setMaxRating={(value) => handleFilterChange(setMaxRating, value)}
						setStartYear={(value) => handleFilterChange(setStartYear, value)}
						setEndYear={(value) => handleFilterChange(setEndYear, value)}
						setExcludeAdult={(value) => handleFilterChange(setExcludeAdult, value)}
						setMinVotes={(value) => handleFilterChange(setMinVotes, value)}
					/>
					<div className="flex justify-between mt-4">
						<Button
							variant="contained"
							className="bg-gray-500 hover:bg-gray-400 text-white"
							onClick={() => router.reload()}
						>
							Reset
						</Button>
						<Button
							variant="contained"
							className="bg-[#FFB800] hover:bg-[#FFA500] text-white"
							onClick={() => fetchMovies()}
						>
							Filter
						</Button>
					</div>
				</div>
				<div className="w-full p-4 overflow-y-auto">
					{moviesLoaded || loading ? (
						<Box className="flex justify-center items-center h-screen bg-gray-50">
							<CircularProgress className="text-[#FFB800]" />
						</Box>
					) : (
						<>
							<div className="flex justify-end mb-6 items-center gap-2">
								<FormControl size="small" className="min-w-[200px]">
									<InputLabel id="sort-select-label">Sort by</InputLabel>
									<Select
										labelId="sort-select-label"
										id="sort-select"
										value={sortType}
										label="Sort by"
										onChange={handleSortTypeChange}
									>
										{sortOptions.map((option) => (
											<MenuItem key={option.value} value={option.value}>
												{option.label}
											</MenuItem>
										))}
									</Select>
								</FormControl>
								<IconButton 
									onClick={handleSortOrderChange}
									size="small"
									className="bg-gray-100 hover:bg-gray-200"
								>
									{sortOrder === SortOrder.ASC ? (
										<ArrowUpward/>
									) : (
										<ArrowDownward/>
									)}
								</IconButton>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-12 place-items-center">
								{movies.map((movie) => (
									<MovieCard
										key={movie.id}
										id={movie.id}
										movie={movie.movie}
										imdb_rating={movie.imdb_rating}
										genres={movie.genre_ids ? movie.genre_ids.map((id) => genresMap.get(id)) : null}
										duration={movie.duration}
										imdb_votes={movie.imdb_votes}
										isInWatchlist={watchlist.includes(movie.id)}
										onWatchlistToggle={handleWatchlistToggle}
									/>
								))}
							</div>
							<Box className="flex justify-center mt-8">
								<Pagination
									count={totalPages || 1}
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
