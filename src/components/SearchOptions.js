import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RecommendationType from './RecommendationType';

const SearchOptions = () => {
  const [activeOption, setActiveOption] = useState('api');

  return (
    <Box sx={{ mb: 4 }}>
      {/* Source Switcher */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        <Button
          variant={activeOption === 'api' ? 'contained' : 'outlined'}
          onClick={() => setActiveOption('api')}
          startIcon={<TravelExploreIcon />}
          sx={{
            minWidth: '170px',
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          AniList API Search
        </Button>
        <Button
          variant={activeOption === 'manual' ? 'contained' : 'outlined'}
          onClick={() => setActiveOption('manual')}
          startIcon={<EditNoteIcon />}
          sx={{
            minWidth: '170px',
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            borderColor: 'rgba(255, 255, 255, 0.2)',
          }}
        >
          Custom / Manual Entry
        </Button>
      </Box>

      {/* Main Content Area */}
      <RecommendationType searchType={activeOption} />
    </Box>
  );
};

export default SearchOptions;
