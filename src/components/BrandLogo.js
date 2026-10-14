import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { BRAND } from '../constants/brand';

/**
 * BrandLogo Component
 * 
 * Renders the official supplied brand logo for Anime Recommendation Generator (ARG).
 * Uses high-res Base64 / raster asset with crisp rendering across retina screens
 * and inline serialization for canvas exports, with vector geometric fallback.
 */

const BrandLogo = ({
  size = 32,
  variant = 'compact', // 'icon-only' | 'compact' | 'full'
  showSubtitle = true,
  inverted = false,
  customAsset = null,
}) => {
  const [loadError, setLoadError] = useState(false);
  const logoSrc = customAsset || BRAND.logoBase64 || BRAND.logoPath;

  // Clean vector fallback emblem in case raster fails
  const renderVectorFallback = () => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="arg_brand_gradient_fb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="60%" stopColor="#ec4899" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <rect
        x="6"
        y="6"
        width="28"
        height="28"
        rx="8"
        transform="rotate(45 20 20)"
        fill="url(#arg_brand_gradient_fb)"
      />
      <circle cx="20" cy="20" r="4" fill="#ffffff" />
    </svg>
  );

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.2,
        userSelect: 'none',
      }}
    >
      {/* Official Supplied Logo Asset */}
      {!loadError && logoSrc ? (
        <img
          src={logoSrc}
          alt={`${BRAND.name} Official Logo`}
          onError={() => setLoadError(true)}
          style={{
            width: size,
            height: size,
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
            filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))',
          }}
        />
      ) : (
        renderVectorFallback()
      )}

      {/* Optional Typographic Lockup */}
      {variant !== 'icon-only' && (
        <Box sx={{ textAlign: 'left', lineHeight: 1 }}>
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: size <= 32 ? '0.86rem' : '1.05rem',
              letterSpacing: '-0.02em',
              color: inverted ? '#070914' : '#ffffff',
              lineHeight: 1.15,
              textTransform: 'uppercase',
            }}
          >
            {variant === 'full' ? BRAND.name : BRAND.shortName}
          </Typography>
          {showSubtitle && (
            <Typography
              sx={{
                fontSize: size <= 32 ? '0.60rem' : '0.70rem',
                letterSpacing: '0.08em',
                fontWeight: 700,
                color: inverted ? 'rgba(7, 9, 20, 0.7)' : '#94a3b8',
                textTransform: 'uppercase',
                display: 'block',
                mt: 0.2,
              }}
            >
              Rec Generator
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default BrandLogo;
