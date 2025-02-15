import React, { useState } from 'react';
import { Box, Button, Paper } from '@mui/material';
import ApiSearch from './ApiSearch';

const RecommendationType = ({ searchType }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [selectedAnime, setSelectedAnime] = useState(null);

  const handleAnimeSelect = (animeData) => {
    setSelectedAnime(animeData);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        <Button
          variant={selectedType === 'single' ? 'contained' : 'outlined'}
          onClick={() => setSelectedType('single')}
          sx={{ minWidth: '200px' }}
        >
          Single Recommendation
        </Button>
        <Button
          variant={selectedType === 'weekly' ? 'contained' : 'outlined'}
          onClick={() => setSelectedType('weekly')}
          sx={{ minWidth: '200px' }}
        >
          Weekly Recommendation
        </Button>
      </Box>

      {selectedType === 'single' && (
        <Box>
          <Paper elevation={3} sx={{ p: 3, mt: 2, mb: 4 }}>
            {searchType === 'api' ? (
              <ApiSearch onAnimeSelect={handleAnimeSelect} />
            ) : (
              <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                Manual input form coming soon...
              </Box>
            )}
          </Paper>
          
          {selectedAnime && (
            <Box sx={{ mt: 4 }}>
              <Paper elevation={3} sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', gap: 3 }}>
                  {/* Anime Cover */}
                  <Box sx={{ flexShrink: 0 }}>
                    <img
                      src={selectedAnime.coverImage?.large || selectedAnime.coverImage?.medium}
                      alt={selectedAnime.title}
                      style={{
                        width: '200px',
                        height: '300px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                      }}
                    />
                  </Box>
                  
                  {/* Anime Details */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ fontSize: '24px', fontWeight: 'bold', mb: 2 }}>
                      {selectedAnime.title}
                    </Box>
                    <Box sx={{ fontSize: '16px', color: 'text.secondary', mb: 2 }}>
                      {selectedAnime.description?.replace(/<[^>]*>/g, '')}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 3, color: 'text.secondary' }}>
                      <Box>
                        <strong>Rating:</strong> {selectedAnime.averageScore ? `${selectedAnime.averageScore}/100` : 'N/A'}
                      </Box>
                      <Box>
                        <strong>Episodes:</strong> {selectedAnime.episodes || 'N/A'}
                      </Box>
                      <Box>
                        <strong>Status:</strong> {selectedAnime.status || 'N/A'}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Box>
          )}
        </Box>
      )}

      {selectedType === 'weekly' && (
        <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 4 }}>
          Weekly recommendation feature coming soon...
        </Box>
      )}
    </Box>
  );
};

export default RecommendationType;
