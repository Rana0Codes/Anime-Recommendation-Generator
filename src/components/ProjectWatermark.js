import React from 'react';
import { Box } from '@mui/material';
import { BRAND } from '../constants/brand';

/**
 * ProjectWatermark Component
 * 
 * Renders the small, subtle official project watermark anchored in the bottom-left
 * corner of exported recommendation cards.
 * 
 * Spec:
 * - 2-3% of export canvas width (~26-32px)
 * - Subordinate opacity (0.75)
 * - Zero intrusive background panels or heavy text captions
 * - Distinct from creator personal identity
 */
const ProjectWatermark = ({
  size = 28,
  insetBottom = 18,
  insetLeft = 20,
  opacity = 0.75,
  style = {},
}) => {
  const logoSrc = BRAND.logoBase64 || BRAND.logoPath || '/brand/logo-64.png';

  return (
    <Box
      data-arg-watermark="true"
      sx={{
        position: 'absolute',
        bottom: `${insetBottom}px`,
        left: `${insetLeft}px`,
        zIndex: 10,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: opacity,
        pointerEvents: 'none',
        userSelect: 'none',
        filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.85))',
        ...style,
      }}
    >
      <img
        src={logoSrc}
        alt="ARG Watermark"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </Box>
  );
};

export default ProjectWatermark;
