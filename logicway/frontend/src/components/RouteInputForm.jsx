import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CircleIcon from '@mui/icons-material/Circle';
import FlagIcon from '@mui/icons-material/Flag';

// TextField Styles
const inputStyles = {
  '& label.Mui-focused': {
    color: '#45a049',
  },
  '& .MuiOutlinedInput-root': {
    '&.Mui-focused fieldset': {
      borderColor: '#45a049',
    },
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

// Input field with icon
const InputWithIcon = ({ icon, label, value, onChange }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
    <Box sx={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {icon}
    </Box>
    <TextField
      label={label}
      variant="outlined"
      value={value}
      onChange={onChange}
      fullWidth
      sx={inputStyles}
    />
  </Box>
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
      backgroundColor: '#4caf50',
      '&:hover': {
        backgroundColor: '#45a049',
      },
    }}
  >
    Build route
  </Button>
);

const RouteInputForm = ({ onRouteSubmit }) => {
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
        top: 80,
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
        
        <SubmitButton />
      </Box>     
    </Paper>
  );
};

export default RouteInputForm;
