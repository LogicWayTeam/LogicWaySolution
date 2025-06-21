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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
        fontSize: '1.2rem',
        color: '#333',
      }}
    >
      <div className="spinner" />
      <div className="loading-text">
        Calculating the best route for you
        <span className="dots">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    </div>
  );
};

export default MapOverlay;
