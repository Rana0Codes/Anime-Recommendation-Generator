import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Avatar,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {
  getCreatorSettings,
  saveCreatorLogo,
  saveCreatorHandle,
  removeCreatorLogo,
  processCreatorLogoFile,
} from '../services/creatorStorage';

const CreatorProfileDialog = ({ open, onClose }) => {
  const [handle, setHandle] = useState('@Rana0Codes');
  const [logo, setLogo] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (open) {
      const s = getCreatorSettings();
      setHandle(s.handle || '@Rana0Codes');
      setLogo(s.logo);
      setError('');
      setSuccess('');
    }
  }, [open]);

  const handleFileUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const dataUrl = await processCreatorLogoFile(file);
      setLogo(dataUrl);
      saveCreatorLogo(dataUrl);
      setError('');
      setSuccess('Logo updated successfully!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message || 'Failed to process logo file.');
    }
  };

  const handleRemove = () => {
    setLogo(null);
    removeCreatorLogo();
    setSuccess('Restored default creator avatar.');
    setTimeout(() => setSuccess(''), 2500);
  };

  const handleSaveHandle = (e) => {
    const val = e.target.value;
    setHandle(val);
    saveCreatorHandle(val);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '10px',
          background: 'linear-gradient(160deg, #121829 0%, #0a0d18 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8)',
          p: 1,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.15rem' }}>
            Creator Identity
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Custom signature featured on your exported cards
          </Typography>
        </Box>
        <IconButton size="small" onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '6px' }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: '6px' }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Avatar Display & Actions */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2.5,
            mb: 2.5,
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px dashed rgba(255, 255, 255, 0.15)',
          }}
        >
          <Avatar
            src={logo || ''}
            sx={{
              width: 72,
              height: 72,
              mb: 1.5,
              fontSize: '1.8rem',
              background: 'linear-gradient(135deg, #6366f1, #ec4899)',
              border: '2px solid rgba(255, 255, 255, 0.25)',
              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
            }}
          >
            🎌
          </Avatar>

          <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
            PNG, JPEG, or WebP (max 3MB)
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              component="label"
              size="small"
              startIcon={<CloudUploadIcon />}
              sx={{ borderRadius: '6px', textTransform: 'none', fontWeight: 700 }}
            >
              Upload Logo
              <input type="file" accept="image/png, image/jpeg, image/webp" hidden onChange={handleFileUpload} />
            </Button>
            {logo && (
              <Button
                variant="text"
                color="error"
                size="small"
                startIcon={<DeleteOutlineIcon />}
                onClick={handleRemove}
                sx={{ borderRadius: '6px', textTransform: 'none' }}
              >
                Reset
              </Button>
            )}
          </Box>
        </Box>

        {/* Curator Handle */}
        <TextField
          fullWidth
          size="small"
          label="Curator Handle / Name"
          value={handle}
          onChange={handleSaveHandle}
          placeholder="@YourHandle or Brand Name"
          helperText="Appears next to your avatar on single & weekly graphics"
          sx={{ mb: 1 }}
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={onClose}
          startIcon={<CheckCircleOutlineIcon />}
          sx={{
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            borderRadius: '6px',
            fontWeight: 800,
            textTransform: 'none',
            py: 1,
          }}
        >
          Done
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreatorProfileDialog;
