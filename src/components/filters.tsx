import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FormControlLabel, Radio, RadioGroup, TextField, Checkbox } from '@mui/material'
import MuiAccordion, { AccordionProps } from '@mui/material/Accordion'
import MuiAccordionDetails from '@mui/material/AccordionDetails'
import MuiAccordionSummary, {
	AccordionSummaryProps,
	accordionSummaryClasses,
} from '@mui/material/AccordionSummary'
import Chip from '@mui/material/Chip'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import * as React from 'react'

const Accordion = styled((props: AccordionProps) => (
	<MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
	border: `1px solid ${theme.palette.divider}`,
	'&:not(:last-child)': {
		borderBottom: 0,
	},
	'&::before': {
		display: 'none',
	},
}))

const AccordionSummary = styled((props: AccordionSummaryProps) => (
	<MuiAccordionSummary
		expandIcon={<ExpandMoreIcon />}
		{...props}
	/>
))(({ theme }) => ({
	backgroundColor: 'rgba(0, 0, 0, .03)',
	flexDirection: 'row-reverse',
	[`& .${accordionSummaryClasses.expandIconWrapper}.${accordionSummaryClasses.expanded}`]:
    {
    	transform: 'rotate(180deg)',
    },
	[`& .${accordionSummaryClasses.content}`]: {
		marginLeft: theme.spacing(1),
	},
	...theme.applyStyles('dark', {
		backgroundColor: 'rgba(255, 255, 255, .05)',
	}),
}))

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
	padding: theme.spacing(2),
	borderTop: '1px solid rgba(0, 0, 0, .125)',
}))

interface FiltersProps {
    genres: Map<number, string>;

    setSelectedGenres: (selectedGenres: number[]) => void;
    setMinDuration: (minDuration: number | null) => void;
    setMaxDuration: (maxDuration: number | null) => void;
    setMinRating: (minRating: number | null) => void;
    setMaxRating: (maxRating: number | null) => void;
	setStartYear: (startYear: number | null) => void;
	setEndYear: (endYear: number | null) => void;
	setExcludeAdult: (excludeAdult: boolean) => void;
	setMinVotes: (minVotes: number | null) => void;
}


export default function Filters(filters: FiltersProps) {
	const [selectedGenres, setSelectedGenres] = React.useState<number[]>([])
	const [minDuration] = React.useState<number | null>(null)
	const [maxDuration] = React.useState<number | null>(null)
	const [startYear] = React.useState<number | null>(null)
	const [endYear] = React.useState<number | null>(null)
	const [minRating, setMinRating] = React.useState<number | null>(7)
	const [maxRating] = React.useState<number | null>(null)
	const [excludeAdult, setExcludeAdult] = React.useState<boolean>(false)
	const [minVotes, setMinVotes] = React.useState<number | null>(2000)

	const handleGenreClick = (id: number) => {
		if (selectedGenres.includes(id)) {
			filters.setSelectedGenres(selectedGenres.filter(t => t !== id))
			setSelectedGenres(selectedGenres.filter(t => t !== id))
		} else {
			filters.setSelectedGenres([...selectedGenres, id])
			setSelectedGenres([...selectedGenres, id])
		}
	}

	return (
		<div>
			<Accordion>
				<AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
					<Typography component="span" className="font-bold">Genres</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<div className="flex flex-wrap gap-2">
						{Array.from(filters.genres).map(([genre_id, genre_name]) => (
							<Chip
								key={genre_id}
								label={genre_name}
								clickable
								onClick={() => handleGenreClick(genre_id)}
								onDelete={selectedGenres.includes(genre_id) ? () => handleGenreClick(genre_id) : undefined}
								deleteIcon={selectedGenres.includes(genre_id) ? <CloseIcon /> : undefined}
								className={`border-black border border-solid ${selectedGenres.includes(genre_id) ? 'bg-[#fad02c]' : 'bg-white'} hover:bg-[#fad02c]`}
							/>
						))}
					</div>
				</AccordionDetails>
			</Accordion>

			<Accordion>
				<AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
					<Typography component="span" className="font-bold">Duration</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography component="span">In minutes</Typography>
					<div className="flex flex-wrap gap-2">
						<TextField
							value={minDuration}
							onChange={(e) => filters.setMinDuration(Number(e.target.value))}
							placeholder="e.g. 1"
							type="number"
							className='flex-1'
						/>
						<Typography component="span" className='flex items-center'>to</Typography>
						<TextField
							value={maxDuration}
							onChange={(e) => filters.setMaxDuration(Number(e.target.value))}
							placeholder="e.g. 180"
							type="number"
							className='flex-1'
						/>
					</div>
				</AccordionDetails>
			</Accordion>

			<Accordion>
				<AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
					<Typography component="span" className="font-bold">Release Year</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography component="span">In years</Typography>
					<div className="flex flex-wrap gap-2">
						<TextField
							value={startYear}
							onChange={(e) => filters.setStartYear(Number(e.target.value))}
							placeholder="e.g. 1996"
							type="number"
							className='flex-1'
						/>
						<Typography component="span" className='flex items-center'>to</Typography>
						<TextField
							value={endYear}
							onChange={(e) => filters.setEndYear(Number(e.target.value))}
							placeholder="e.g. 2025"
							type="number"
							className='flex-1'
						/>
					</div>
				</AccordionDetails>
			</Accordion>

			<Accordion defaultExpanded>
				<AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
					<Typography component="span" className="font-bold">IMDb Ratings</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<div className="flex flex-wrap gap-2">
						<TextField
							value={minRating}
							onChange={(e) => {
								filters.setMinRating(Number(e.target.value));
								setMinRating(Number(e.target.value) > 0 ? Number(e.target.value) : null);
							}}
							placeholder="e.g. 1"
							type="number"
							className='flex-1'
						/>
						<Typography component="span" className='flex items-center'>to</Typography>
						<TextField
							value={maxRating}
							onChange={(e) => filters.setMaxRating(Number(e.target.value))}
							placeholder="e.g. 9.8"
							type="number"
							className='flex-1'
							inputProps={{ step: 0.1, min: 1, max: 10 }}
						/>
					</div>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
					<Typography component="span" className="font-bold">Adult movies</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<FormControlLabel
						control={
							<Checkbox
								checked={excludeAdult}
								onChange={(e) => {
									filters.setExcludeAdult(e.target.checked)
									setExcludeAdult(e.target.checked)
								}}
								className="text-[#fad02c]"
							/>
						}
						label="Exclude"
					/>
				</AccordionDetails>
			</Accordion>
			<Accordion defaultExpanded>
				<AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
					<Typography component="span" className="font-bold">Number of votes</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography component="span">Minimum votes:</Typography>
					<div className="flex flex-wrap gap-2">
						<TextField
							value={minVotes}
							onChange={(e) => {
								filters.setMinVotes(Number(e.target.value));
								setMinVotes(Number(e.target.value) > 0 ? Number(e.target.value) : null);
							}}
							placeholder="e.g. 1"
							type="number"
							className='flex-1'
						/>
					</div>
				</AccordionDetails>
			</Accordion>
		</div>
	)
}
