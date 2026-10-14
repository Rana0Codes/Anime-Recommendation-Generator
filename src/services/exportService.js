import { toPng, toBlob } from 'html-to-image';
import html2canvas from 'html2canvas';

/**
 * Ensures all document fonts and target images are fully loaded and decoded.
 */
export async function prepareNodeForExport(node) {
  if (document.fonts && document.fonts.ready) {
    await document.fonts.ready;
  }

  // Pre-decode all <img> elements inside the node
  const images = node.querySelectorAll('img');
  await Promise.all(
    Array.from(images).map(async (img) => {
      if (!img.complete) {
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }
      if (img.decode) {
        try {
          await img.decode();
        } catch (_) {
          // ignore decode errors if already rendered
        }
      }
    })
  );
}

/**
 * Exports a DOM node to a high-resolution PNG data URL.
 * Uses html-to-image (SVG foreignObject) for 1:1 native browser rendering fidelity,
 * falling back to html2canvas if necessary.
 */
export async function exportNodeToDataUrl(node, options = {}) {
  await prepareNodeForExport(node);

  const targetWidth = options.width || node.offsetWidth;
  const targetHeight = options.height || node.offsetHeight;
  
  // High-fidelity quality determination:
  // 'ultra' = 2.5x (~300 DPI / true 4K sharpness)
  // 'hd' or default = 2.0x (1080p-1440p crisp resolution)
  let pixelRatio = options.pixelRatio;
  if (!pixelRatio) {
    if (options.exportQuality === 'ultra' || options.quality === 'ultra') {
      pixelRatio = 2.5;
    } else {
      pixelRatio = 2.0;
    }
  }

  // Preserve previous styles before applying export overrides
  const prevRadius = node.style.borderRadius;
  const prevFlexShrink = node.style.flexShrink;
  const prevMinWidth = node.style.minWidth;
  const prevMaxWidth = node.style.maxWidth;
  const prevWidth = node.style.width;
  const prevMinHeight = node.style.minHeight;
  const prevMaxHeight = node.style.maxHeight;
  const prevHeight = node.style.height;
  const prevWebkitFontSmoothing = node.style.webkitFontSmoothing;
  const prevMozOsxFontSmoothing = node.style.mozOsxFontSmoothing;
  const prevTextRendering = node.style.textRendering;

  // Phase 3 & 4: Guarantee crisp square outer canvas corners and full-width layout
  node.style.setProperty('border-radius', '0px', 'important');
  node.style.setProperty('flex-shrink', '0', 'important');
  node.style.setProperty('min-width', `${targetWidth}px`, 'important');
  node.style.setProperty('max-width', `${targetWidth}px`, 'important');
  node.style.setProperty('width', `${targetWidth}px`, 'important');
  node.style.setProperty('-webkit-font-smoothing', 'antialiased', 'important');
  node.style.setProperty('-moz-osx-font-smoothing', 'grayscale', 'important');
  node.style.setProperty('text-rendering', 'optimizeLegibility', 'important');

  if (targetHeight) {
    node.style.setProperty('min-height', `${targetHeight}px`, 'important');
    node.style.setProperty('max-height', `${targetHeight}px`, 'important');
    node.style.setProperty('height', `${targetHeight}px`, 'important');
  }

  // Force layout reflow
  void node.offsetWidth;

  try {
    // 1st Priority: html-to-image (Native browser rendering via SVG foreignObject)
    const dataUrl = await toPng(node, {
      pixelRatio,
      width: targetWidth,
      height: targetHeight,
      cacheBust: true,
      skipAutoScale: true,
      ...options.htmlToImageOptions,
    });
    return dataUrl;
  } catch (err) {
    console.warn('html-to-image export warning, falling back to html2canvas:', err);
    // 2nd Priority Fallback: html2canvas
    const canvas = await html2canvas(node, {
      useCORS: true,
      allowTaint: true,
      scale: pixelRatio,
      backgroundColor: null,
      logging: false,
      width: targetWidth,
      height: targetHeight,
      ...options.html2canvasOptions,
    });
    return canvas.toDataURL('image/png');
  } finally {
    // Restore original styles
    if (prevRadius) node.style.borderRadius = prevRadius;
    else node.style.removeProperty('border-radius');

    if (prevFlexShrink) node.style.flexShrink = prevFlexShrink;
    else node.style.removeProperty('flex-shrink');

    if (prevMinWidth) node.style.minWidth = prevMinWidth;
    else node.style.removeProperty('min-width');

    if (prevMaxWidth) node.style.maxWidth = prevMaxWidth;
    else node.style.removeProperty('max-width');

    if (prevWidth) node.style.width = prevWidth;
    else node.style.removeProperty('width');

    if (prevMinHeight) node.style.minHeight = prevMinHeight;
    else node.style.removeProperty('min-height');

    if (prevMaxHeight) node.style.maxHeight = prevMaxHeight;
    else node.style.removeProperty('max-height');

    if (prevHeight) node.style.height = prevHeight;
    else node.style.removeProperty('height');

    if (prevWebkitFontSmoothing) node.style.webkitFontSmoothing = prevWebkitFontSmoothing;
    else node.style.removeProperty('-webkit-font-smoothing');

    if (prevMozOsxFontSmoothing) node.style.mozOsxFontSmoothing = prevMozOsxFontSmoothing;
    else node.style.removeProperty('-moz-osx-font-smoothing');

    if (prevTextRendering) node.style.textRendering = prevTextRendering;
    else node.style.removeProperty('text-rendering');
  }
}

/**
 * Downloads a DOM node as a PNG file.
 */
export async function downloadNodeAsPng(node, filename, options = {}) {
  const dataUrl = await exportNodeToDataUrl(node, options);
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
  return dataUrl;
}

/**
 * Copies a DOM node as a PNG image to the system clipboard (if supported).
 */
export async function copyNodeToClipboard(node, options = {}) {
  await prepareNodeForExport(node);
  const pixelRatio = options.pixelRatio || 2;
  const width = options.width || node.offsetWidth;
  const height = options.height || node.offsetHeight;

  try {
    const blob = await toBlob(node, {
      pixelRatio,
      width,
      height,
      cacheBust: true,
      skipAutoScale: true,
    });
    if (navigator.clipboard && navigator.clipboard.write) {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ]);
      return { success: true, method: 'clipboard' };
    }
  } catch (err) {
    console.warn('Clipboard write error, falling back to download:', err);
  }

  // Fallback: trigger download
  await downloadNodeAsPng(node, 'anime-recommendation.png', options);
  return { success: true, method: 'download' };
}
