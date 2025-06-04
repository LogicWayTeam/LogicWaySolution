import { createRoot } from 'react-dom/client';
import L from 'leaflet';
import { RadioButtonChecked, Room } from '@mui/icons-material';

/**
 * Renders a MUI icon to a Leaflet divIcon
 */
const renderMuiIconToDivIcon = (MuiIcon, size = 32, color = 'red') => {
  const container = document.createElement('div');
  container.style.width = `${size}px`;
  container.style.height = `${size}px`;
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';

  // Rendering an icon into a DOM node
  createRoot(container).render(
    <MuiIcon style={{ fontSize: size, color }} />
  );

  return L.divIcon({
    html: container,
    iconSize: [size, size],
    className: '', // Disabling standard Leaflet classes
  });
};

export const startIcon = renderMuiIconToDivIcon(RadioButtonChecked, 28, '#222'); // circle icon
export const endIcon = renderMuiIconToDivIcon(Room, 32, '#d32f2f'); // red marker
