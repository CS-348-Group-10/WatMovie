import { Container } from '@mui/material'
import { useEffect, useState } from 'react'
import Filters from '../components/filters'
import Header from '../components/header'
import MovieCard from '../components/movieCard'
import { Title } from '../types'

export default function Home() {


	const [typesMap, setTypesMap] = useState(new Map<number, string>())
	const [genresMap, setGenresMap] = useState(new Map<number, string>())
	const [duration, setDuration] = useState<string>('')
	const [rating, setRating] = useState<string>('')	
	const [movies, setMovies] = useState<Title[]>([])
	const [loading, setLoading] = useState<boolean>(false)
	const [moviesLoaded, setMoviesLoaded] = useState<boolean>(false)

	const [selectedTypes, setSelectedTypes] = useState<number[]>([2])
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
		setLoading(true)
		fetchTitleTypes()
		fetchGenres()
		setLoading(false)
	}, [])

	useEffect(() => {
		const fetchMovies = async () => {
			setMoviesLoaded(true)
			try {
				const queryParams = new URLSearchParams({
					...(selectedTypes.length !== 0 && { typeIds: selectedTypes.join(',')}),
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
				})
				const queryString = queryParams.toString()
				const url = queryString ? `api/titles?${queryParams}` : '/api/titles'
				const res = await fetch(url)
				const data = await res.json()
				setMovies(data)
			} catch (error) {
				console.error('Failed to fetch movies:', error)
			}
			setMoviesLoaded(false)
		}

		fetchMovies()
	}, [selectedTypes, minDuration, maxDuration, startYear, endYear, minRating, maxRating, selectedGenres, search, showAdult, minVotes])

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
		    			types={typesMap}
						genres={genresMap}

						setSelectedTypes={setSelectedTypes}
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
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-12 place-items-center">
							{movies.map((movie) => (
								<MovieCard
									key={movie.id}
									id={movie.id}
									title={movie.title}
									rating={movie.rating}
									genres={movie.genre_ids ? movie.genre_ids.map((id) => genresMap.get(id)) : null}
									duration={movie.duration}
									votes={movie.votes}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
