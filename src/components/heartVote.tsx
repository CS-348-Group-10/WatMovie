import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import Rating from '@mui/material/Rating'
import styled from '@mui/material/styles/styled'
import Typography from '@mui/material/Typography'
import * as React from 'react'

interface HeartVoteProps {
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

export default function HeartVote({ value }: HeartVoteProps) {
	return (
		<div className='flex items-center'>
			<StyledRating
                readOnly
				name="customized-color"
				defaultValue={1}
				getLabelText={(value: number) => `${value} Heart${value !== 1 ? 's' : ''}`}
				precision={0.5}
				max={1}
				icon={<FavoriteIcon fontSize="inherit" />}
				emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
			/>
			<Typography variant="body2" color="text.secondary" className="p-2">{value ? `${value}`  : 'N/A'}</Typography>
		</div>
	)
}