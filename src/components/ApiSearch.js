import React, { useState, useCallback } from 'react';
import { 
  Box, 
  TextField, 
  Typography, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  Button,
  Tooltip,
  Alert,
  CircularProgress,
  Backdrop,
  Skeleton,
  Fade,
  LinearProgress
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ShuffleIcon from '@mui/icons-material/Shuffle';

const getHighestQualityImage = (coverImage) => {
  if (!coverImage) return null;
  
  // Priority order: extraLarge > large > medium > color (fallback)
  return coverImage.extraLarge || coverImage.large || coverImage.medium || null;
};

const AnimeCardSkeleton = () => (
  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Skeleton 
      variant="rectangular" 
      height={200} 
      animation="wave"
      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
    />
    <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
      <Skeleton variant="text" width="80%" height={32} animation="wave" />
      <Skeleton variant="text" width="100%" height={20} animation="wave" />
      <Skeleton variant="text" width="90%" height={20} animation="wave" />
      <Box sx={{ display: 'flex', gap: 1, mt: 2, mb: 1 }}>
        <Skeleton variant="rounded" width={60} height={24} animation="wave" />
        <Skeleton variant="rounded" width={60} height={24} animation="wave" />
        <Skeleton variant="rounded" width={60} height={24} animation="wave" />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Skeleton variant="text" width={80} height={24} animation="wave" />
        <Skeleton variant="text" width={80} height={24} animation="wave" />
      </Box>
    </CardContent>
  </Card>
);

const ApiSearch = ({ onAnimeSelect, isWeekly, selectedCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState({ message: '', details: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState(''); // 'manual' or 'random'
  const [loadingProgress, setLoadingProgress] = useState(0);

  const popularGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller'
  ];

  const startLoadingProgress = () => {
    setLoadingProgress(0);
    const interval = setInterval(() => {
      setLoadingProgress((prevProgress) => {
        if (prevProgress >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prevProgress + 10;
      });
    }, 200);
    return interval;
  };

  const searchAnime = async (query, isRandom = false) => {
    if (!isRandom && !query.trim()) {
      setSearchResults([]);
      return;
    }

    let loadingInterval;
    if (isRandom) {
      setIsLoading(true);
      setLoadingProgress(0);
      loadingInterval = startLoadingProgress();
    }
    
    setError({ message: '', details: '' });
    setSearchType(isRandom ? 'random' : 'manual');

    try {
      const variables = isRandom 
        ? { 
            genre: popularGenres[Math.floor(Math.random() * popularGenres.length)],
            page: Math.floor(Math.random() * 10) + 1
          }
        : { search: query };

      const queryString = `
        query ($${isRandom ? 'genre: String, $page: Int' : 'search: String'}) {
          Page(page: ${isRandom ? '$page' : '1'}, perPage: 9) {
            media(${isRandom ? 'genre: $genre' : 'search: $search'}, type: ANIME, sort: POPULARITY_DESC) {
              id
              title {
                userPreferred
                english
                romaji
                native
              }
              description
              coverImage {
                extraLarge
                large
                medium
                color
              }
              bannerImage
              genres
              averageScore
              episodes
              duration
              season
              seasonYear
              status
              source
              format
              studios {
                nodes {
                  name
                }
              }
            }
          }
        }
      `;

      const response = await fetch('https://graphql.anilist.co', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: queryString,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        const errorMessage = data.errors.map(err => err.message).join(', ');
        throw new Error(errorMessage);
      }

      if (!data.data?.Page?.media || data.data.Page.media.length === 0) {
        setError({
          message: 'No results found',
          details: isRandom 
            ? 'Try another random search'
            : `No anime found matching "${query}". Try a different search term.`
        });
        setSearchResults([]);
        return;
      }

      setSearchResults(data.data.Page.media);
      setError({ message: '', details: '' });
    } catch (err) {
      console.error('Search error:', err);
      
      let errorMessage = 'Failed to fetch anime data.';
      let errorDetails = '';

      if (err.message.includes('Network error')) {
        errorMessage = 'Network error occurred';
        errorDetails = 'Please check your internet connection and try again.';
      } else if (err.message.includes('rate limit')) {
        errorMessage = 'Too many requests';
        errorDetails = 'Please wait a moment before trying again.';
      } else {
        errorMessage = 'An error occurred while searching';
        errorDetails = err.message || 'Please try again later.';
      }

      setError({ message: errorMessage, details: errorDetails });
      setSearchResults([]);
    } finally {
      if (isRandom) {
        clearInterval(loadingInterval);
        setLoadingProgress(100);
        // Delay hiding loading state slightly for smooth transition
        setTimeout(() => {
          setIsLoading(false);
          setLoadingProgress(0);
        }, 300);
      }
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);
    searchAnime(query);
  };

  const handleRandomSearch = () => {
    setSearchQuery('');
    searchAnime('', true);
  };

  const handleAnimeSelect = useCallback((anime) => {
    if (isWeekly && selectedCount >= 3) {
      setError('You can only select up to 3 anime for weekly recommendations');
      return;
    }
    
    const processedAnime = {
      title: anime.title.userPreferred || anime.title.english || anime.title.romaji || anime.title.native,
      description: anime.description,
      coverImage: getHighestQualityImage(anime.coverImage),
      bannerImage: anime.bannerImage,
      genres: anime.genres,
      averageScore: anime.averageScore,
      episodes: anime.episodes,
      duration: anime.duration,
      season: anime.season,
      seasonYear: anime.seasonYear,
      status: anime.status,
      source: anime.source,
      format: anime.format,
      studios: anime.studios?.nodes?.map(studio => studio.name) || []
    };

    onAnimeSelect(processedAnime);
    setSearchQuery('');
    setSearchResults([]);
  }, [onAnimeSelect, isWeekly, selectedCount]);

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: 2 }}>
      {isLoading && searchType === 'random' && (
        <LinearProgress 
          variant="determinate" 
          value={loadingProgress}
          sx={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.drawer + 2,
          }} 
        />
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Search Anime"
          variant="outlined"
          value={searchQuery}
          onChange={handleSearchChange}
          disabled={isLoading && searchType === 'random'}
          sx={{ 
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
            transition: 'opacity 0.3s',
            opacity: (isLoading && searchType === 'random') ? 0.7 : 1,
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleRandomSearch}
          disabled={isLoading && searchType === 'random'}
          startIcon={isLoading && searchType === 'random' ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <ShuffleIcon />
          )}
          sx={{
            minWidth: '120px',
            transition: 'all 0.3s',
            opacity: (isLoading && searchType === 'random') ? 0.7 : 1,
            '&:hover': {
              transform: (isLoading && searchType === 'random') ? 'none' : 'scale(1.05)',
            },
          }}
        >
          {isLoading && searchType === 'random' ? 'Loading...' : 'Random'}
        </Button>
      </Box>

      {error.message && (
        <Fade in={!!error.message}>
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setError({ message: '', details: '' })}
              >
                Dismiss
              </Button>
            }
          >
            <Typography variant="subtitle2">{error.message}</Typography>
            {error.details && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {error.details}
              </Typography>
            )}
          </Alert>
        </Fade>
      )}

      {isWeekly && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Selected: {selectedCount}/3 anime
        </Typography>
      )}

      <Fade in={!isLoading && searchResults.length > 0}>
        <Grid container spacing={3}>
          {searchResults.map((anime) => (
            <Grid item xs={12} sm={6} md={4} key={anime.id}>
              <Card 
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={getHighestQualityImage(anime.coverImage)}
                  alt={anime.title.userPreferred}
                  sx={{ 
                    objectFit: 'cover',
                    backgroundColor: anime.coverImage?.color || 'transparent'
                  }}
                />
                <CardContent sx={{ flexGrow: 1, position: 'relative' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {anime.title.userPreferred || anime.title.english || anime.title.romaji}
                    </Typography>
                    <Tooltip title="Add to selection">
                      <IconButton 
                        onClick={() => handleAnimeSelect(anime)}
                        color="primary"
                        sx={{ 
                          ml: 1,
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <AddCircleIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {anime.description?.replace(/<[^>]*>/g, '') || 'No description available'}
                  </Typography>

                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {anime.genres.slice(0, 3).map((genre) => (
                      <Chip
                        key={genre}
                        label={genre}
                        size="small"
                        sx={{ 
                          backgroundColor: 'primary.light',
                          color: 'primary.contrastText',
                        }}
                      />
                    ))}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {anime.averageScore && (
                      <Typography variant="body2" color="text.secondary">
                        Score: {anime.averageScore}%
                      </Typography>
                    )}
                    {anime.episodes && (
                      <Typography variant="body2" color="text.secondary">
                        Episodes: {anime.episodes}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Fade>

      {isLoading && searchType === 'random' && (
        <Fade in={isLoading}>
          <Grid container spacing={3}>
            {[...Array(9)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <AnimeCardSkeleton />
              </Grid>
            ))}
          </Grid>
        </Fade>
      )}
    </Box>
  );
};

export default ApiSearch;
