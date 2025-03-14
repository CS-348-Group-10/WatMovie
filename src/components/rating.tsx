import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Rating from '@mui/material/Rating'
import styled from '@mui/material/styles/styled'
import Typography from '@mui/material/Typography'
import * as React from 'react'

interface MovieRatingProps {
  value: number | null;
}

const StyledRating = styled(Rating)({
	'& .MuiRating-iconFilled': {
	  color: '#ff6d75',
	},
	'& .MuiRating-iconHover': {
	  color: '#ff3d47',
	},
})

export default function MovieRating({ value }: MovieRatingProps) {
	return (
		<div className='flex items-center'>
			<Rating name="read-only" value={value} max={1} precision={0.5} readOnly/>
			<Typography variant="body2" color="text.secondary" className="p-2">{value ? `${value} / 10`  : 'N/A'}</Typography>
		</div>
	)
}