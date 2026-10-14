/**
 * Creator Profile Storage Service
 * Manages creator logo and username persistence in localStorage,
 * allowing single and weekly recommendation workflows to share branding seamlessly.
 */

const STORAGE_KEYS = {
  LOGO: 'arg_creator_logo',
  HANDLE: 'arg_creator_handle',
};

export const getCreatorSettings = () => {
  try {
    const logo = localStorage.getItem(STORAGE_KEYS.LOGO) || '';
    const handle = localStorage.getItem(STORAGE_KEYS.HANDLE) || '@Rana0Codes';
    return { logo, handle };
  } catch (err) {
    console.warn('localStorage read error:', err);
    return { logo: '', handle: '@Rana0Codes' };
  }
};

export const saveCreatorLogo = (base64Data) => {
  try {
    if (base64Data) {
      localStorage.setItem(STORAGE_KEYS.LOGO, base64Data);
    } else {
      localStorage.removeItem(STORAGE_KEYS.LOGO);
    }
    // Dispatch custom event so all active components sync immediately
    window.dispatchEvent(new Event('arg_creator_settings_updated'));
    return true;
  } catch (err) {
    console.warn('Failed to save creator logo:', err);
    return false;
  }
};

export const removeCreatorLogo = () => {
  return saveCreatorLogo('');
};

export const saveCreatorHandle = (handle) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HANDLE, handle);
    window.dispatchEvent(new Event('arg_creator_settings_updated'));
    return true;
  } catch (err) {
    console.warn('Failed to save creator handle:', err);
    return false;
  }
};

/**
 * Validates and converts an uploaded image File into a Base64 data URL.
 * Supports PNG, JPEG, and WebP, maintaining transparency.
 */
export const processCreatorLogoFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return reject(new Error('Invalid format. Please upload a PNG, JPEG, or WebP image.'));
    }

    // Max 3MB limit
    if (file.size > 3 * 1024 * 1024) {
      return reject(new Error('File size exceeds 3MB limit. Please choose a smaller image.'));
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
};
