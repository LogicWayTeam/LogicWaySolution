import { useMap } from 'react-leaflet';
import { useEffect, useRef } from 'react';
import { IconButton, Box, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import L from 'leaflet';

const ZoomControl = () => {
  const map = useMap();
  const controlRef = useRef(null);

  const buttonStyles = {
    width: '100%',
    height: 28,
    padding: 0,
    justifyContent: 'center',
    color: '#555',
    backgroundColor: 'transparent',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '&:hover .MuiSvgIcon-root': {
      color: '#000',
    },
  };

  // Prevent clicks and scrolls from moving the map
  useEffect(() => {
    if (controlRef.current) {
      L.DomEvent.disableClickPropagation(controlRef.current);
      L.DomEvent.disableScrollPropagation(controlRef.current);
    }
  }, []);

  return (
    <Box
      ref={controlRef}
      sx={{
        position: 'absolute',
        bottom: 24,
        right: 10,
        zIndex: 1000,
        borderRadius: '6px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
        backgroundColor: 'rgb(255,255,255)',
        display: 'flex',
        flexDirection: 'column',
        width: 28,
        cursor: 'pointer',
      }}
    >
      <IconButton onClick={() => map.zoomIn()} size="small" sx={buttonStyles}>
        <AddIcon fontSize="inherit" />
      </IconButton>

      <Divider sx={{ margin: 0, pointerEvents: 'none' }} />

      <IconButton onClick={() => map.zoomOut()} size="small" sx={buttonStyles}>
        <RemoveIcon fontSize="inherit" />
      </IconButton>
    </Box>
  );
};

export default ZoomControl;
