/**
 * Utility to reliably load and convert images to Base64 Data URLs.
 * By converting external images to Base64 via our local CORS proxy,
 * html2canvas renders them 100% crisply without any CORS/canvas tainting issues.
 */

export const getProxyImageUrl = (url) => {
  if (!url) return '';
  // If already base64 data URL or blob, return as-is
  if (url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  // Use our local development / production proxy
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
};

export const convertUrlToBase64 = async (url) => {
  if (!url) return '';
  if (url.startsWith('data:')) return url;

  try {
    const proxyUrl = getProxyImageUrl(url);
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image via proxy: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(url); // fallback to original url if conversion fails
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('convertUrlToBase64 error:', err);
    return url; // fallback to original
  }
};

export const createBlurredImageBase64 = async (url, blurRadius = 16, targetWidth = 1200, targetHeight = 675) => {
  if (!url) return '';
  try {
    const base64 = await convertUrlToBase64(url);
    if (!base64 || typeof window === 'undefined') return base64;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const bleed = Math.max(blurRadius * 2, 40);
            const bleedW = canvas.width + bleed * 2;
            const bleedH = canvas.height + bleed * 2;

            // Compute proportional cover scaling
            const imgW = img.naturalWidth || img.width || 1200;
            const imgH = img.naturalHeight || img.height || 675;
            const hRatio = bleedW / imgW;
            const vRatio = bleedH / imgH;
            const scale = Math.max(hRatio, vRatio);

            const drawW = imgW * scale;
            const drawH = imgH * scale;
            const drawX = -bleed + (bleedW - drawW) / 2;
            const drawY = -bleed + (bleedH - drawH) / 2;

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.filter = `blur(${blurRadius}px)`;
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            resolve(canvas.toDataURL('image/jpeg', 0.95));
            return;
          }
        } catch (e) {
          console.warn('Canvas blur error:', e);
        }
        resolve(base64);
      };
      img.onerror = () => resolve(base64);
      img.src = base64;
    });
  } catch (e) {
    return url;
  }
};

