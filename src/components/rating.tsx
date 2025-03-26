import Rating from '@mui/material/Rating'
import Typography from '@mui/material/Typography'
import * as React from 'react'

interface MovieRatingProps {
  value: number | null;
}

export default function MovieRating({ value }: MovieRatingProps) {
	return (
		<div className='flex items-center'>
			<Rating name="read-only" value={value} max={1} precision={0.5} readOnly/>
			<Typography variant="body2" color="text.secondary" className="p-2">{value ? `${value} / 10`  : 'N/A'}</Typography>
		</div>
	)
}