import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RouteIcon from '@mui/icons-material/AltRoute';
import CloseIcon from '@mui/icons-material/Close';

// === Styles ===
const inputStyles = {
  flex: 1,
  ml: 3,
};

const paperStyles = {
  display: 'flex',
  alignItems: 'center',
  borderRadius: '30px',
  px: 1,
  py: 0.5,
  position: 'relative',
};

const wrapperStyles = {
  position: 'absolute',
  top: 20,
  right: 20,
  zIndex: 1000,
  width: 400,
};

const suggestionsStyles = {
  mt: 0.5,
  borderRadius: '0 0 12px 12px',
  overflow: 'hidden',
};

// === UI components ===

const RouteButton = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    sx={{
      backgroundColor: '#4caf50',
      color: 'white',
      padding: '6px',
      borderRadius: '50%',
      '&:hover': {
        backgroundColor: '#45a049',
      },
      width: 35,
      height: 35,
    }}
  >
    <RouteIcon fontSize="small" />
  </IconButton>
);



const SearchButton = ({ onClick } ) => (
  <IconButton onClick={onClick} sx={{ color: '#666' }}>
    <SearchIcon />
  </IconButton>
);

const QueryInput = ({ value, onChange, onClear }) => (
  <TextField
    placeholder="Search for a place"
    variant="standard"
    value={value}
    onChange={onChange}
    sx={{
      ...inputStyles,
      input: { color: '#393939' },
      '& .MuiInputBase-input::placeholder': {
        color: '#666',
        opacity: 1,
      },
    }}
    InputProps={{
      disableUnderline: true,
      endAdornment: value && (
        <IconButton
          onClick={onClear}
          size="small"
          sx={{
            visibility: value ? 'visible' : 'hidden',
            color: '#c23057',
            padding: '4px',
          }}
        >
          <CloseIcon fontSize="inherit" />
        </IconButton>
      ),
    }}
  />
);


// === Main component ===

const GeocoderInput = ({ onSearchClick, onRouteClick }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (text) => {
    if (!text) return setSuggestions([]);

    const dummy = [
      { place_name: 'Moscow, Russia' },
      { place_name: 'Moscow State University' },
      { place_name: 'Moscow City' },
    ];

    const filtered = dummy.filter((d) =>
      d.place_name.toLowerCase().includes(text.toLowerCase())
    );

    setSuggestions(filtered);
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    fetchSuggestions(value);
  };

  const handleSelect = (place) => {
    setQuery(place.place_name);
    setSuggestions([]);
    onSearchClick(place.place_name);
  };

  const handleSearch = () => {
    onSearchClick(query);
  };

  return (
    <Box sx={wrapperStyles}>
      <Paper elevation={4} sx={paperStyles}>
        <RouteButton onClick={onRouteClick} />
        <QueryInput value={query} onChange={handleChange} onClear={() => setQuery('')} />
        <SearchButton onClick={handleSearch} />
      </Paper>

      {suggestions.length > 0 && (
        <Paper elevation={2} sx={suggestionsStyles}>
          {suggestions.map((s, i) => (
            <MenuItem key={i} onClick={() => handleSelect(s)}>
              {s.place_name}
            </MenuItem>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default GeocoderInput;
