import React, { useState, useRef } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CircleIcon from '@mui/icons-material/Circle';
import FlagIcon from '@mui/icons-material/Flag';
import CloseIcon from '@mui/icons-material/Close';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// TextField Styles
const inputStyles = {
  '& label.Mui-focused': {
    color: '#45a049',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#45a049',
    },
    '&:hover .location-icon': {
      opacity: 1,
    },
    '&.Mui-focused .location-icon': {
      opacity: 1,
    },
  },
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 1000px white inset !important',
    WebkitTextFillColor: '#000',
    transition: 'background-color 0s ease-in-out 0s',
    caretColor: '#000',
  },
  '& input:-webkit-autofill:focus': {
    WebkitBoxShadow: '0 0 0 1000px white inset !important',
  },

};

// Input field with icon
const InputWithIcon = ({ icon, label, value, onChange, onLocateClick }) => {
  const inputRef = useRef();

  const handleFocus = () => {
    inputRef.current?.select();
  };

  return(
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </Box>
    <TextField
      label={label}
      variant="outlined"
      value={value}
      onChange={onChange}
      onFocus={handleFocus}
      inputRef={inputRef}
      fullWidth
      sx={inputStyles}
      InputProps={{
        endAdornment: (
          <LocationButton onClick={onLocateClick} />
        ),
      }}
    />
  </Box>
  );
};

// Location Button
const LocationButton = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    size="small"
    className="location-icon"
    sx={{
      opacity: 0,
      transition: 'opacity 0.2s ease',
      color: '#45a049',
      padding: '4px',
    }}
  >
    <MyLocationIcon fontSize="small" />
  </IconButton>
);

// Swap Button
const SwapButton = ({ onClick }) => (
  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
    <IconButton aria-label="Поменять местами" onClick={onClick}>
      <SwapVertIcon />
    </IconButton>
  </Box>
);

// Submit Button
const SubmitButton = () => (
  <Button
    type="submit"
    variant="contained"
    sx={{
      flex: 1,
      backgroundColor: '#4caf50',
      '&:hover': {
        backgroundColor: '#45a049',
      },
    }}
  >
    Build route
  </Button>
);

// Close Button
const CloseButton = ({ onClick }) => (
  <IconButton
    onClick={onClick}
    disableRipple
    disableFocusRipple
    sx={{
      ml: 1,
      backgroundColor: '#ccc',
      opacity: 0,
      color: '#fff',
      borderRadius: '6px',
      flexShrink: 0,
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: '#ccc',
        opacity: 1,
      },
      '&:active': {
        backgroundColor: '#aaa',
        opacity: 1,
        borderColor: '#aaa',
        transform: 'scale(0.97)',
      },
    }}
  >
    <CloseIcon fontSize="small" />
  </IconButton>
);


const RouteInputForm = ({ onRouteSubmit, onClose }) => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (origin && destination) {
      onRouteSubmit(origin, destination);
    }
  };

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        zIndex: 1000,
        p: 2,
        width: 370,
        borderRadius: '20px',
      }}
    >
      {/* Vertical Container */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Horizontal Container */}
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1 }}>
          {/* Left column */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <InputWithIcon
              icon={<CircleIcon sx={{ color: 'black', fontSize: 13 }} />}
              label="From"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            />
            <InputWithIcon
              icon={<FlagIcon sx={{ color: '#c40035', fontSize: 20 }} />}
              label="To"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </Box>

          {/* Right column */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SwapButton onClick={handleSwap} />
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:hover .close-btn': {opacity: 1,}, }}>
          <SubmitButton />
          <CloseButton onClick={onClose} />
        </Box>
      </Box>     
    </Paper>
  );
};

export default RouteInputForm;
