import React, { useRef, useEffect, useState } from 'react';
import L from 'leaflet';
import { Box, TextField, IconButton, Paper, MenuItem } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RouteIcon from '@mui/icons-material/AltRoute';
import CloseIcon from '@mui/icons-material/Close';
import { redIcon } from './constants';
import { useLeafletMap } from './MapComponent';

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

const QueryInput = ({ value, onChange, onClear, onKeyDown }) => (
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
      onKeyDown={onKeyDown}
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

const GeocoderSearchBar = ({ onSearchClick, onRouteClick }) => {
  const [query, setQuery] = useState('');
  // const [suggestions, setSuggestions] = useState([]); // Подсказки временно отключены
  const containerRef = useRef(null);
  const searchMarkerRef = useRef(null);
  const map = useLeafletMap();

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

  // Prevent clicks and scrolls from moving the map
    useEffect(() => {
    if (containerRef.current) {
      L.DomEvent.disableClickPropagation(containerRef.current);
      L.DomEvent.disableScrollPropagation(containerRef.current);
    }
  }, []);


const searchPlace = async (text) => {
  // Проверка входных параметров
  if (!text) {
    console.warn('⛔️ searchPlace: текст запроса отсутствует');
    return;
  }

  if (!map) {
    console.warn('⛔️ searchPlace: объект карты (map) не инициализирован');
    return;
  }

  console.log('🔍 Ищем адрес:', text);

  const url = `/routing/proxy_route_engine/geocode/geocode?address=${encodeURIComponent(text)}`;
  console.log('🌐 URL запроса:', url);

  try {
    const response = await fetch(url);
    console.log('📡 Ответ от сервера:', response);

    if (!response.ok) {
      throw new Error(`❌ HTTP ошибка: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 Данные из JSON:', data);

    if (!data || typeof data !== 'object') {
      throw new Error('❌ Неверный формат ответа от сервера');
    }

    if (!data.latitude || !data.longitude) {
      throw new Error('❌ Координаты не найдены в ответе');
    }

    const latlng = L.latLng(data.latitude, data.longitude);
    console.log('📍 Координаты:', latlng);

    // Удалить предыдущий маркер, если он есть
    if (searchMarkerRef.current) {
      console.log('🧹 Удаляем предыдущий маркер');
      map.removeLayer(searchMarkerRef.current);
    }

    const marker = L.marker(latlng, { icon: redIcon })
      .addTo(map)
      .bindPopup(data.address || text)
      .openPopup();

    searchMarkerRef.current = marker;

    console.log('✅ Новый маркер добавлен и открыт');

    map.setView(latlng, 16);
    console.log('🗺 Центр карты установлен на координаты');

    if (onSearchClick) {
      console.log('📨 Вызываем onSearchClick с координатами и адресом');
      onSearchClick({
        lat: data.latitude,
        lng: data.longitude,
        label: data.address || text,
        markerRef: marker,
      });
    }

  } catch (error) {
    console.error('🚨 Ошибка при поиске адреса:', error);
    alert('Не удалось найти адрес: ' + error.message);
  }
};


  const handleChange = (e) => {
    setQuery(e.target.value);
    // fetchSuggestions(e.target.value); // Временно отключено
  };

  const handleSearch = () => {
    console.log('handleSearch вызван с:', query); // ← добавим отладку
    searchPlace(query);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      console.log('Enter pressed'); // ✅ проверка
      handleSearch();
    }
  };


  const clearSearch = () => {
    setQuery('');

    if (searchMarkerRef.current && map) {
      map.removeLayer(searchMarkerRef.current);
      searchMarkerRef.current = null;
    }

    if (onSearchClick) {
      onSearchClick(null);
    }
  };

  return (
    <Box ref={containerRef} sx={wrapperStyles}>
      <Paper elevation={4} sx={paperStyles}>
        <RouteButton onClick={onRouteClick} />
        <QueryInput value={query} onChange={handleChange} onKeyDown={handleKeyDown} onClear={clearSearch} />
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
