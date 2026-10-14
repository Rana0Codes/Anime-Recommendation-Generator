import React, { useState, useRef } from 'react';
import { Box, Button, Typography, Avatar, Tooltip } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { processCreatorLogoFile, saveCreatorLogo, removeCreatorLogo } from '../services/creatorStorage';

/**
 * CreatorLogoControl Component
 * 
 * Provides a clean, compact UI control to upload, preview, replace,
 * and remove the creator's personal logo/avatar.
 */

const CreatorLogoControl = ({
  creatorLogo,
  onLogoChange,
  size = 36,
  label = 'Creator Logo / Avatar',
}) => {
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setErrorMessage('');
      const base64 = await processCreatorLogoFile(file);
      saveCreatorLogo(base64);
      if (onLogoChange) onLogoChange(base64);
    } catch (err) {
      setErrorMessage(err.message || 'Upload failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    removeCreatorLogo();
    if (onLogoChange) onLogoChange('');
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6 }}>
      {label && (
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, display: 'block' }}>
          {label}
        </Typography>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
        {/* Logo Preview Container */}
        <Box
          sx={{
            width: size,
            height: size,
            borderRadius: '50%',
            overflow: 'hidden',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: creatorLogo ? '1.5px solid #6366f1' : '1px dashed rgba(255, 255, 255, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: creatorLogo ? '0 2px 8px rgba(99, 102, 241, 0.35)' : 'none',
          }}
        >
          {creatorLogo ? (
            <img
              src={creatorLogo}
              alt="Creator Logo Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: size,
                height: size,
                fontSize: size * 0.45,
                bgcolor: 'transparent',
                color: '#94a3b8',
              }}
            >
              🎌
            </Avatar>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            component="label"
            startIcon={<AddPhotoAlternateIcon sx={{ fontSize: 15 }} />}
            sx={{
              borderRadius: '6px',
              textTransform: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              py: 0.45,
              px: 1.2,
              borderColor: 'rgba(255, 255, 255, 0.18)',
              color: '#f8fafc',
              '&:hover': {
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
              },
            }}
          >
            {creatorLogo ? 'Replace' : 'Upload Logo'}
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
            />
          </Button>

          {creatorLogo && (
            <Tooltip title="Remove custom logo (restore default avatar)">
              <Button
                variant="outlined"
                size="small"
                onClick={handleRemove}
                startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                sx={{
                  color: '#f43f5e',
                  borderColor: 'rgba(244, 63, 94, 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  py: 0.45,
                  px: 1,
                  borderRadius: '6px',
                  '&:hover': {
                    borderColor: '#f43f5e',
                    backgroundColor: 'rgba(244, 63, 94, 0.12)',
                  },
                }}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {errorMessage && (
        <Typography variant="caption" sx={{ color: '#f43f5e', fontSize: '0.7rem' }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default CreatorLogoControl;
