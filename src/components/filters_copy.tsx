import CloseIcon from '@mui/icons-material/Close'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
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
}


export default function Filters(filters: FiltersProps) {
	const [expanded, setExpanded] = React.useState<string | false>('panel1')
	const [selectedTypes, setSelectedTypes] = React.useState<number[]>([])
	const [selectedGenres] = React.useState<number[]>([])


	const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
    	setExpanded(newExpanded ? panel : false)
    }

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
		} else {
			filters.setSelectedGenres([...selectedTypes, id])
		}
	}

	return (
		<div>
			<Accordion>
				<AccordionSummary aria-controls="panel1d-content" id="panel1d-header" >
					<Typography component="span">Title Type</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
						{Array.from(filters.types).map(([type_id, type_name]) => (
							<Chip
								key={type_id}
								label={type_name}
								clickable
								onClick={() => handleTypeClick(type_id)}
								onDelete={selectedTypes.includes(type_id) ? () => handleTypeClick(type_id) : undefined}
								deleteIcon={selectedTypes.includes(type_id) ? <CloseIcon sx={{color: 'black !important'}} /> : undefined}
								sx={{
									backgroundColor: selectedTypes.includes(type_id) ? '#fad02c' : 'white',
									border: '1px solid black',
									color: 'black',
									'&:hover': {
										backgroundColor: selectedTypes.includes(type_id) ? '#fad02c' : '#fad02c'
									}
								}}
							/>
						))}
					</div>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
					<Typography component="span">Collapsible Group Item #2</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor
            sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
					</Typography>
				</AccordionDetails>
			</Accordion>
			<Accordion>
				<AccordionSummary aria-controls="panel3d-content" id="panel3d-header">
					<Typography component="span">Collapsible Group Item #3</Typography>
				</AccordionSummary>
				<AccordionDetails>
					<Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
            malesuada lacus ex, sit amet blandit leo lobortis eget. Lorem ipsum dolor
            sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex,
            sit amet blandit leo lobortis eget.
					</Typography>
				</AccordionDetails>
			</Accordion>
		</div>
	)
}

function setMovieType(arg0: any) {
	throw new Error('Function not implemented.')
}
