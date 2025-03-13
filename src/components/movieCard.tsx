import AccessTimeIcon from '@mui/icons-material/AccessTime'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Image from 'next/image'
import * as React from 'react'
import MovieRating from './rating'

interface MovieCardProps {
  id: string;
  title: string;
  rating: number | null;
  genres: (string | undefined)[] | null;
  duration: number | null;
}

export default function MovieCard({ id, title, rating, genres, duration }: MovieCardProps) {
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

	return (
		<Card className="max-w-xs rounded-lg shadow-lg">
			{posterUrl && (
				<div className="relative w-full h-96">
					<Image
						loader={(prop) => prop.src}
						src={posterUrl}
						alt={title}
						layout="fill"
						objectFit="cover"
						objectPosition="cover"
						className="rounded-t-lg"
						sizes="(max-width: 768px) 100vw, 50vw"
					/>
				</div>
			)}
			<CardContent className="p-4">
				<Typography gutterBottom variant="h5" component="div" sx={{fontFamily: 'fangsong'}} >{title}</Typography>
				<MovieRating value={rating} />
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
		</Card>
	)
}