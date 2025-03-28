import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import * as React from 'react'
import HeartVote from './heartVote'
import MovieRating from './rating'
import Link from 'next/link'
import IconButton from '@mui/material/IconButton'
import AddIcon from '@mui/icons-material/Add'
import CheckIcon from '@mui/icons-material/Check'

interface MovieCardProps {
  id: string;
  movie: string;
  imdb_rating: number | null;
  genres: (string | undefined)[] | null;
  imdb_votes: number | null;
  duration: number | null;
  isInWatchlist: boolean;
  onWatchlistToggle: (movieId: string) => Promise<void>;
  currentPage?: number;
}

export default function MovieCard({ id, movie, imdb_rating, genres, duration, imdb_votes, isInWatchlist, onWatchlistToggle, currentPage }: MovieCardProps) {
	const [posterUrl, setPosterUrl] = React.useState<string>('')
	const [imageError, setImageError] = React.useState<boolean>(false)

	React.useEffect(() => {
		const fetchPoster = async () => {
			try {
				const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_POSTER_API_KEY}&i=${id}`)
				if (!response.ok) {
					throw new Error('Failed to fetch poster')
				}
				const data = await response.json()
				
				// Check if the poster URL is valid
				const isValidPosterUrl = data.Poster && 
					data.Poster !== 'N/A' && 
					!data.Error && 
					response.ok && 
					response.status === 200 &&
					data.Poster.startsWith('http');

				setPosterUrl(isValidPosterUrl ? data.Poster : '/placeholder.png')
			} catch (error) {
				setPosterUrl('/placeholder.png')
			}
		}

		fetchPoster()
	}, [id])

	const handleImageError = () => {
		setImageError(true)
		setPosterUrl('/placeholder.png')
	}

	const handleAddToWatchlist = async (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent navigation when clicking the button
		await onWatchlistToggle(id);
	};

	const handleMovieClick = (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent default navigation
		if (currentPage) {
			localStorage.setItem('currentPage', currentPage.toString());
		}
		// Manually navigate after storing the page
		window.location.href = `/movies/${id}`;
	};

	return (
		<Card className="w-full h-full rounded-lg shadow-lg">
			<div className="relative">
				{posterUrl && (
					<div className="relative w-full h-96">
						<Image
							loader={(prop) => prop.src}
							src={posterUrl}
							alt={movie}
							layout="fill"
							objectFit="cover"
							objectPosition="cover"
							className="rounded-t-lg"
							sizes="(max-width: 768px) 100vw, 50vw"
							onError={handleImageError}
						/>
						<IconButton
							onClick={handleAddToWatchlist}
							className={`absolute top-2 right-2 text-white shadow-lg transition-colors duration-200 ${
								isInWatchlist 
									? 'bg-green-500 hover:bg-green-600' 
									: 'bg-[#FFB800] hover:bg-[#FFA500]'
							}`}
							size="large"
						>
							{isInWatchlist ? <CheckIcon /> : <AddIcon />}
						</IconButton>
					</div>
				)}
				<Link 
					className="min-w-full min-h-full" 
					href={`/movies/${id}`} 
					onClick={handleMovieClick}
					prefetch={false}
				>
					<CardContent className="p-4">
						<Typography gutterBottom variant="h5" component="div" sx={{fontFamily: 'fangsong'}} >{movie}</Typography>
						<Box className="flex justify-between items-center">
							<MovieRating value={imdb_rating} />
							<HeartVote value={imdb_votes} />
						</Box>
						<Box className="flex justify-between items-center">
							{genres && genres.length > 0 ? (
								<Typography variant="body2" color="text.secondary" className="mt-1">
									{genres.slice(0, 3).join(', ')}
								</Typography>
							) : (
								<Typography variant="body2" color="text.secondary" className="mt-1">
									&nbsp;
								</Typography>
							)}
							<Box className="flex items-center mt-1">
								<AccessTimeIcon className="mr-1 text-sm" />
								<Typography variant="body2" color="text.secondary">{duration ? `${duration} min` : '-'}</Typography>
							</Box>
						</Box>
					</CardContent>
				</Link>
			</div>
		</Card>
	)
}
