// Generate a customer-facing tracking code (e.g., "SR-ABC123")
export const generateTrackingCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SR-${code}`;
};

// Generate a driver code (e.g., "DRV-5678")
export const generateDriverCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DRV-${code}`;
};

// Generate a 4-digit PIN for driver authentication
export const generateDriverPassword = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// Generate all tracking codes for an order
export const generateAllTrackingCodes = () => {
  return {
    tracking_code: generateTrackingCode(),
    driver_code: generateDriverCode(),
    driver_password: generateDriverPassword(),
  };
};
