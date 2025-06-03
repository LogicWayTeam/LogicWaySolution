import React, { useState } from 'react';
import { useRef, useEffect } from 'react';
import L from 'leaflet';
import { Box, TextField, IconButton, Paper, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RouteIcon from '@mui/icons-material/AltRoute';
import CloseIcon from '@mui/icons-material/Close';
import { redIcon } from './constants';

// === Styles ===
const inputStyles = {
  flex: 1,
  ml: 3,
  input: {
    color: '#393939',
    borderRadius: '8px',
    padding: '6px 8px',
    backgroundColor: '#fff',
  },
  '& input:-webkit-autofill': {
  WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
  WebkitTextFillColor: 'black',
  transition: 'background-color 0s ease-in-out 0s',
  },
  '& input:-webkit-autofill:focus': {
  WebkitBoxShadow: '0 0 0 1000px #e8f5e9 inset',
  },
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
  top: 12,
  left: 12,
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
  <Box
    sx={{
      ...inputStyles,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      '&:hover .clear-btn, &:focus-within .clear-btn': {
        visibility: 'visible',
      },
    }}
  >
    <TextField
      placeholder="Search for a place"
      variant="standard"
      value={value}
      onChange={onChange}
      sx={{
        flex: 1,
        input: { color: 'black' },
        '& .MuiInputBase-input::placeholder': {
          color: '#666',
          opacity: 1,
        },
      }}
      InputProps={{
        disableUnderline: true,
      }}
      fullWidth
    />

    {value && (
      <IconButton
        onClick={onClear}
        size="small"
        className="clear-btn"
        sx={{
          visibility: 'hidden',
          color: '#999',
          position: 'absolute',
          right: 0,
          mr: 1,
          padding: '4px',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <CloseIcon fontSize="inherit" />
      </IconButton>
    )}
  </Box>
);


// === Main component ===

const GeocoderSearchBar = ({ onSearchClick, onRouteClick, map }) => {
  const [query, setQuery] = useState('');
  // const [suggestions, setSuggestions] = useState([]); // Подсказки временно отключены
  const searchMarkerRef = useRef(null);

  // const fetchSuggestions = async (text) => {
  //   if (!text) return setSuggestions([]);
  //
  //   try {
  //     const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`);
  //     const data = await response.json();
  //
  //     const formatted = data.map((item) => ({
  //       place_name: item.display_name,
  //       lat: item.lat,
  //       lon: item.lon,
  //     }));
  //
  //     setSuggestions(formatted);
  //   } catch (error) {
  //     console.error('Failed to fetch suggestions:', error);
  //     setSuggestions([]);
  //   }
  // };

  const searchPlace = async (text) => {
    if (!text) return;

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=1`);
      const data = await response.json();

      if (data.length === 0) return;

      const place = data[0];

      if (map) {
        console.log('MAP OK');
        const latlng = L.latLng(parseFloat(place.lat), parseFloat(place.lon));

        if (searchMarkerRef.current) {
          map.removeLayer(searchMarkerRef.current);
        }

        const marker = L.marker(latlng, { icon: redIcon })
          .addTo(map)
          .bindPopup(place.display_name)
          .openPopup();

        searchMarkerRef.current = marker;

        map.setView(latlng, 13);
      } else {
        console.log('MAP is null!');
      }

      onSearchClick(place);
    } catch (error) {
      console.error('Failed to search place:', error);
    }
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
    // fetchSuggestions(e.target.value); // Временно отключено
  };

  const handleSearch = () => {
    searchPlace(query);
  };

  return (
    <Box sx={wrapperStyles}>
      <Paper elevation={4} sx={paperStyles}>
        <RouteButton onClick={onRouteClick} />
        <QueryInput value={query} onChange={handleChange} onClear={() => setQuery('')} />
        <SearchButton onClick={handleSearch} />
      </Paper>

      {/* 
      {suggestions.length > 0 && (
        <Paper elevation={2} sx={suggestionsStyles}>
          {suggestions.map((s, i) => (
            <MenuItem key={i} onClick={() => handleSelect(s)}>
              {s.place_name}
            </MenuItem>
          ))}
        </Paper>
      )}
      */}
    </Box>
  );
};


export default GeocoderSearchBar;
