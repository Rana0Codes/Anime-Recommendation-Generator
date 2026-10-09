import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Rating,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';

const ALL_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
  'Mecha', 'Music', 'Mystery', 'Psychological', 'Romance', 'Sci-Fi',
  'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

const ManualInput = ({ onAnimeSelect }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [rating, setRating] = useState(4.5);
  const [episodes, setEpisodes] = useState('');
  const [format, setFormat] = useState('TV');
  const [status, setStatus] = useState('Finished');
  const [seasonYear, setSeasonYear] = useState(new Date().getFullYear().toString());
  const [studio, setStudio] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(['Action', 'Adventure']);
  const [error, setError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file (PNG, JPG, WebP).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setCoverImage(reader.result);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      if (selectedGenres.length >= 5) return;
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Anime title is required.');
      return;
    }

    const processedAnime = {
      title: title.trim(),
      description: description.trim() || 'A handpicked anime recommendation curated for quality storytelling and animation.',
      coverImage: {
        extraLarge: coverImage || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80',
        large: coverImage,
      },
      bannerImage: coverImage || null,
      genres: selectedGenres.length > 0 ? selectedGenres : ['Action', 'Fantasy'],
      averageScore: Math.round(rating * 20),
      episodes: episodes ? parseInt(episodes, 10) : null,
      seasonYear: seasonYear ? parseInt(seasonYear, 10) : null,
      status: status,
      format: format,
      studios: studio ? [studio] : ['Independent'],
    };

    onAnimeSelect(processedAnime);
  };

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 2.5, md: 4 },
        borderRadius: 3,
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <AutoAwesomeIcon color="secondary" /> Custom Anime Recommendation Entry
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Enter any anime, hidden gem, or upcoming series manually to generate a custom 1080p recommendation poster.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Left Column: Details */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Anime Title *"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Frieren: Beyond Journey's End"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Synopsis / Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this anime about? Give a brief teaser..."
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Total Episodes"
                  type="number"
                  value={episodes}
                  onChange={(e) => setEpisodes(e.target.value)}
                  placeholder="e.g. 24"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="format-label">Format</InputLabel>
                  <Select
                    labelId="format-label"
                    value={format}
                    label="Format"
                    onChange={(e) => setFormat(e.target.value)}
                  >
                    <MenuItem value="TV">TV Series</MenuItem>
                    <MenuItem value="MOVIE">Movie</MenuItem>
                    <MenuItem value="OVA">OVA</MenuItem>
                    <MenuItem value="ONA">ONA</MenuItem>
                    <MenuItem value="SPECIAL">Special</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel id="status-label">Status</InputLabel>
                  <Select
                    labelId="status-label"
                    value={status}
                    label="Status"
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <MenuItem value="Finished">Finished Airing</MenuItem>
                    <MenuItem value="Releasing">Currently Airing</MenuItem>
                    <MenuItem value="Upcoming">Not Yet Released</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Release Year"
                  value={seasonYear}
                  onChange={(e) => setSeasonYear(e.target.value)}
                  placeholder="e.g. 2024"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Animation Studio"
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                  placeholder="e.g. Madhouse, MAPPA, Ufotable"
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
                  Select Genres (Max 5):
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}>
                  {ALL_GENRES.map((g) => {
                    const isSelected = selectedGenres.includes(g);
                    return (
                      <Chip
                        key={g}
                        label={g}
                        clickable
                        onClick={() => handleGenreToggle(g)}
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                        size="small"
                      />
                    );
                  })}
                </Box>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Column: Visuals & Cover */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 2.5,
                border: '1px dashed rgba(255, 255, 255, 0.2)',
                borderRadius: 3,
                textAlign: 'center',
                backgroundColor: 'rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '260px',
              }}
            >
              {imagePreview ? (
                <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
                  <img
                    src={imagePreview}
                    alt="Cover preview"
                    style={{
                      maxHeight: '220px',
                      maxWidth: '100%',
                      borderRadius: '8px',
                      objectFit: 'cover',
                    }}
                  />
                  <Button
                    size="small"
                    color="secondary"
                    onClick={() => { setImagePreview(null); setCoverImage(''); }}
                    sx={{ mt: 1, display: 'block', mx: 'auto' }}
                  >
                    Remove Image
                  </Button>
                </Box>
              ) : (
                <>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Upload Poster / Cover Image
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    PNG, JPG, or WebP from your device
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    size="small"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                  >
                    Choose Local File
                    <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                  </Button>
                </>
              )}

              <Box sx={{ width: '100%', mt: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Or Paste Cover Image URL"
                  value={typeof coverImage === 'string' && !coverImage.startsWith('data:') ? coverImage : ''}
                  onChange={(e) => {
                    setCoverImage(e.target.value);
                    setImagePreview(e.target.value);
                  }}
                  placeholder="https://..."
                />
              </Box>
            </Box>

            <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.03)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                Your Rating ({rating * 2} / 10)
              </Typography>
              <Rating
                value={rating}
                precision={0.5}
                onChange={(_, v) => v && setRating(v)}
                emptyIcon={<StarIcon style={{ opacity: 0.2 }} fontSize="inherit" />}
              />
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            startIcon={<AutoAwesomeIcon />}
            sx={{
              background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
              px: 4,
              py: 1.2,
              fontWeight: 700,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(99, 102, 241, 0.4)',
              textTransform: 'none',
            }}
          >
            Generate Template Poster
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default ManualInput;
