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
}

export default function MovieCard({ id, movie, imdb_rating, genres, duration, imdb_votes, isInWatchlist, onWatchlistToggle }: MovieCardProps) {
	const [posterUrl, setPosterUrl] = React.useState<string>('')

	React.useEffect(() => {
		const fetchPoster = async () => {
			try {
				const response = await fetch(`http://www.omdbapi.com/?apikey=${process.env.NEXT_PUBLIC_POSTER_API_KEY}&i=${id}`)
				if (!response.ok) {
					throw new Error('Failed to fetch poster')
				}
				const data = await response.json()
				setPosterUrl(data.Poster === 'N/A' || data.Error ? '/placeholder.png' : data.Poster )
			} catch (error) {}
		}

		fetchPoster()
	}, [id])

	const handleAddToWatchlist = async (e: React.MouseEvent) => {
		e.preventDefault(); // Prevent navigation when clicking the button
		await onWatchlistToggle(id);
	};

	return (
		<Card className="w-full h-full rounded-lg shadow-lg">
			<Link className="min-w-full min-h-full" href={`/movies/${id}`}>
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
		</Card>
		
	)
}
