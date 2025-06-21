import L from 'leaflet';

export default function bindPersistentPopup(marker, content) {
  const popup = L.popup({ closeButton: false }).setContent(content);

  marker.bindPopup(popup);

  let isOverMarker = false;
  let isOverPopup = false;
  let closeTimeout = null;

  const open = () => {
    marker.openPopup();
  };

  const scheduleClose = () => {
    closeTimeout = setTimeout(() => {
      if (!isOverMarker && !isOverPopup) {
        marker.closePopup();
      }
    }, 300); 
  };

  marker.on('mouseover', () => {
    isOverMarker = true;
    clearTimeout(closeTimeout);
    open();
  });

  marker.on('mouseout', () => {
    isOverMarker = false;
    scheduleClose();
  });

  marker.on('popupopen', () => {
    const popupEl = marker.getPopup().getElement();
    if (!popupEl) return;

    popupEl.addEventListener('mouseenter', () => {
      isOverPopup = true;
      clearTimeout(closeTimeout);
    });

    popupEl.addEventListener('mouseleave', () => {
      isOverPopup = false;
      scheduleClose();
    });
  });
}
