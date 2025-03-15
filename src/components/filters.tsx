import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FormControlLabel, Radio, RadioGroup, TextField } from '@mui/material'
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
    types: Map<number, string>;
    genres: Map<number, string>;

    setSelectedTypes: (selectedTypes: number[]) => void;
    setSelectedGenres: (selectedGenres: number[]) => void;
    setMinDuration: (minDuration: number | null) => void;
    setMaxDuration: (maxDuration: number | null) => void;
    setMinRating: (minRating: number | null) => void;
    setMaxRating: (maxRating: number | null) => void;
	setStartYear: (startYear: number | null) => void;
	setEndYear: (endYear: number | null) => void;
	setIncludeAdult: (includeAdult: boolean) => void;
	setMinVotes: (minVotes: number | null) => void;
}


export default function Filters(filters: FiltersProps) {
	const [selectedTypes, setSelectedTypes] = React.useState<number[]>([2])
	const [selectedGenres, setSelectedGenres] = React.useState<number[]>([])
	const [minDuration] = React.useState<number | null>(null)
	const [maxDuration] = React.useState<number | null>(null)
	const [startYear] = React.useState<number | null>(null)
	const [endYear] = React.useState<number | null>(null)
	const [minRating] = React.useState<number | null>(null)
	const [maxRating] = React.useState<number | null>(null)
	const [includeAdult, setIncludeAdult] = React.useState<boolean>(false)
	const [minVotes] = React.useState<number | null>(null)

	const handleTypeClick = (id: number) => {
		if (selectedTypes.includes(id)) {
			filters.setSelectedTypes(selectedTypes.filter(t => t !== id))
			setSelectedTypes(selectedTypes.filter(t => t !== id))
		} else {
			filters.setSelectedTypes([...selectedTypes, id])
			setSelectedTypes([...selectedTypes, id])
		}
	}

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
			<Accordion defaultExpanded>
				<AccordionSummary aria-controls="panel1d-content" id="panel1d-header" >
					<Typography component="span" className="font-bold">Title Type</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<div className="flex flex-wrap gap-2">
						{Array.from(filters.types).map(([type_id, type_name]) => (
							<Chip
								key={type_id}
								label={type_name}
								clickable
								onClick={() => handleTypeClick(type_id)}
								onDelete={selectedTypes.includes(type_id) ? () => handleTypeClick(type_id) : undefined}
								deleteIcon={selectedTypes.includes(type_id) ? <CloseIcon /> : undefined}
								className={`border border-solid border-black ${selectedTypes.includes(type_id) ? 'bg-[#fad02c]' : 'bg-white'} hover:bg-[#fad02c]`}
							/>
						))}
					</div>
				</AccordionDetails>
			</Accordion>
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

			<Accordion defaultExpanded>
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
							onChange={(e) => filters.setMinRating(Number(e.target.value))}
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
			<Accordion defaultExpanded>
				<AccordionSummary aria-controls="panel4d-content" id="panel4d-header">
					<Typography component="span" className="font-bold">Adult titles</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<RadioGroup
						row
						value={includeAdult ? 'include' : 'exclude'}
						onChange={(e) => {
							filters.setIncludeAdult(e.target.value === 'include')
							setIncludeAdult(e.target.value === 'include')
						}}
					>
						<FormControlLabel value="exclude" control={<Radio />} label="Exclude" />
						<FormControlLabel value="include" control={<Radio />} label="Include" />
					</RadioGroup>
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
							onChange={(e) => filters.setMinVotes(Number(e.target.value))}
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
