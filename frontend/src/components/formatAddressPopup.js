export const formatAddressPopup = (address) => {
    console.log("Address for popup:", address);
  if (!address || typeof address !== 'object') return "No address found";

  const {
    house_number,
    road,
    postcode,
    city,
  } = address;

  const line1 = `${road ?? ''} ${house_number ?? ''}`.trim();
  const line2 = postcode ?? '';
  const line3 = city ?? '';

  return `
    <div class="custom-popup">
      <div class="popup-line1"><strong>${line1}</strong></div>
      <div class="popup-line2">${line2}</div>
      <div class="popup-line3">${line3}</div>
    </div>
  `;
};
