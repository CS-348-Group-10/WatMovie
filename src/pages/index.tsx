import { useEffect, useState } from 'react'
import MovieCard from '../components/movieCard'
import { Title } from '../types'

export default function Home() {
	const [movies, setMovies] = useState<Title[]>([])
	const [search, setSearch] = useState<string>('')
	const [showAdult, setShowAdult] = useState<boolean>(false)
	const [loading, setLoading] = useState<boolean>(false)

	useEffect(() => {
		const fetchMovies = async () => {
			setLoading(true)
			try {
				const queryParams = new URLSearchParams({
					search: search,
					showAdult: showAdult.toString()
				})
				const res = await fetch(`/api/titles?${queryParams}`)
				const data = await res.json()
				setMovies(data)
			} catch (error) {
				console.error('Failed to fetch movies:', error)
			}
			setLoading(false)
		}
		
		fetchMovies()
	}, [search, showAdult])

	const fetchRandomMovie = async () => {
		setLoading(true)
		try {
			const res = await fetch('/api/random-title')
			const data = await res.json()
			setMovies([data])
		} catch (error) {
			console.error('Failed to fetch random movie:', error)
		}
		setLoading(false)
	}

	return (
		<div className="container mx-auto p-4">
			{loading ? (
				<p>Loading...</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					{movies.map((movie) => (
						<MovieCard
							key={movie.id}
							id={movie.id}
							title={movie.title}
							duration={movie.duration}
							genres={movie.genre_ids}
							type={movie.type}
							rating={movie.rating}
						/>
					))}
				</div>
			)}
		</div>
	)
}
