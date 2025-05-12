import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, IconButton } from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import CircleIcon from '@mui/icons-material/Circle';
import FlagIcon from '@mui/icons-material/Flag';

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
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Строка 1: иконка + поле "Откуда" */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
            width: 24,
            height: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            }}
          >
      <CircleIcon sx={{ color: 'black', fontSize: 13 }} />
    </Box>
    <TextField
      label="From"
      variant="outlined"
      value={origin}
      onChange={(e) => setOrigin(e.target.value)}
      fullWidth
    />
        </Box>

        {/* Строка 2: иконка + поле "Куда" */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlagIcon 
            fontSize="small"
            //color="secondary"
            sx={{ color: '#931050' }}
         />
          <TextField
            label="To"
            variant="outlined"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            fullWidth
          />
        </Box>

        {/* Кнопка обмена */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton aria-label="Поменять местами" onClick={handleSwap}>
            <SwapVertIcon />
          </IconButton>
        </Box>

        {/* Кнопка отправки */}
        <Button
          type="submit"
          variant="contained"
          sx={{
            backgroundColor: '#4caf50',  // Зеленый цвет
            '&:hover': {
              backgroundColor: '#45a049', // Темный зеленый цвет при наведении
            },
          }}
        >
          Build route
        </Button>
      </Box>
    </Paper>
  );
};

export default RouteInputForm;
