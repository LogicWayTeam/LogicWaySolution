import React from 'react';

const MapOverlay = ({ loading }) => {
  if (!loading) return null;

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        zIndex: 500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto', 
      }}
    >
      <div className="spinner" />
    </div>
  );
};

export default MapOverlay;
