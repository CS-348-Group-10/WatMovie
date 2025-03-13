import Box from '@mui/material/Box'
import Rating from '@mui/material/Rating'
import Typography from '@mui/material/Typography'
import * as React from 'react'

interface MovieRatingProps {
  value: number | null;
}

export default function MovieRating({ value }: MovieRatingProps) {
	return (
		<div>
			<Rating name="read-only" value={value} precision={0.5} readOnly/>
		</div>
	)
}