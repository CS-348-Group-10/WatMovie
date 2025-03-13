import * as React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';

interface FiltersProps {
  movieType: string[];
  genre: string;
  duration: string;
  rating: string;
  setMovieType: (type: string[]) => void;
  setGenre: (genre: string) => void;
  setDuration: (duration: string) => void;
  setRating: (rating: string) => void;
}

const Filters: React.FC<FiltersProps> = ({ movieType, genre, duration, rating, setMovieType, setGenre, setDuration, setRating }) => {
  const [expanded, setExpanded] = React.useState<string | false>(false);

  const handleExpandAll = () => {
    setExpanded(expanded ? false : 'panel');
  };

  const handleChipClick = (type: string) => {
    if (movieType.includes(type)) {
      setMovieType(movieType.filter(t => t !== type));
    } else {
      setMovieType([...movieType, type]);
    }
  };

  const titleTypes = [
    "Movie", "TV Series", "Short", "TV Episode", "TV Mini Series", "TV Movie", "TV Special", "Video Game", "Video", "Music Video", "Podcast Series", "Podcast Episode"
  ];
  const genres = [
    "Movie", "TV Series", "Short", "TV Episode", "TV Mini Series", "TV Movie", "TV Special", "Video Game", "Video", "Music Video", "Podcast Series", "Podcast Episode"
  ];

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Typography variant="h6">Search Filters</Typography>
        <Button onClick={handleExpandAll} endIcon={<ExpandMoreIcon />}>
          {expanded ? 'Collapse all' : 'Expand all'}
        </Button>
      </div>

      <Accordion expanded={expanded === 'panel1'} onChange={() => setExpanded(expanded === 'panel1' ? false : 'panel1')} sx={{ boxShadow: 'none', border: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Title Name</Typography>
        </AccordionSummary>
        <AccordionDetails style={{ padding: '0' }}>
          <TextField
            fullWidth
            placeholder="e.g. The Godfather"
          />
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel2'} onChange={() => setExpanded(expanded === 'panel2' ? false : 'panel2')} sx={{ boxShadow: 'none', border: 'none' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Title Type</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {titleTypes.map(type => (
              <Chip
                key={type}
                label={type}
                clickable
                onClick={() => handleChipClick(type)}
                onDelete={movieType.includes(type) ? () => handleChipClick(type) : undefined}
                deleteIcon={movieType.includes(type) ? <CloseIcon sx={{color: 'black !important'}} /> : undefined}
                sx={{
                  backgroundColor: movieType.includes(type) ? '#fad02c' : 'white',
                  border: '1px solid black',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: movieType.includes(type) ? '#fad02c' : '#fad02c'
                  }
                }}
              />
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: 'none', border: 'none' }} expanded={expanded === 'panel3'} onChange={() => setExpanded(expanded === 'panel3' ? false : 'panel3')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Release Date</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Release Date"
            placeholder="dd/mm/yyyy"
          />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: 'none', border: 'none' }} expanded={expanded === 'panel4'} onChange={() => setExpanded(expanded === 'panel4' ? false : 'panel4')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>IMDb Ratings</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="IMDb Ratings"
            placeholder="e.g. 1.0 to 10.0"
          />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: 'none', border: 'none' }} expanded={expanded === 'panel5'} onChange={() => setExpanded(expanded === 'panel5' ? false : 'panel5')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Number of Votes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Number of Votes"
            placeholder="e.g. 0 to 700000"
          />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: 'none', border: 'none' }} expanded={expanded === 'panel6'} onChange={() => setExpanded(expanded === 'panel6' ? false : 'panel6')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Genre</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {genres.map(type => (
              <Chip
                key={type}
                label={type}
                clickable
                onClick={() => handleChipClick(type)}
                onDelete={movieType.includes(type) ? () => handleChipClick(type) : undefined}
                deleteIcon={movieType.includes(type) ? <CloseIcon sx={{color: 'black !important'}} /> : undefined}
                sx={{
                  backgroundColor: movieType.includes(type) ? '#fad02c' : 'white',
                  border: '1px solid black',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: movieType.includes(type) ? '#fad02c' : '#fad02c'
                  }
                }}
              />
            ))}
          </div>
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: 'none', border: 'none' }} expanded={expanded === 'panel7'} onChange={() => setExpanded(expanded === 'panel7' ? false : 'panel7')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Duration</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            fullWidth
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 90"
          />
        </AccordionDetails>
      </Accordion>

      <Accordion sx={{ boxShadow: 'none', border: 'none' }} expanded={expanded === 'panel8'} onChange={() => setExpanded(expanded === 'panel8' ? false : 'panel8')}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Rating</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>Rating</InputLabel>
            <Select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="4">4 stars and up</MenuItem>
              <MenuItem value="3">3 stars and up</MenuItem>
              <MenuItem value="2">2 stars and up</MenuItem>
              <MenuItem value="1">1 star and up</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
    </div>
  );
};

export default Filters;