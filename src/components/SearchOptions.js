import React, { useState } from 'react';
import { Box, Button, Paper } from '@mui/material';
import RecommendationType from './RecommendationType';

const SearchOptions = () => {
  const [activeOption, setActiveOption] = useState(null);

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
        <Button
          variant={activeOption === 'api' ? 'contained' : 'outlined'}
          onClick={() => setActiveOption('api')}
          sx={{ minWidth: '150px' }}
        >
          API Search
        </Button>
        <Button
          variant={activeOption === 'manual' ? 'contained' : 'outlined'}
          onClick={() => setActiveOption('manual')}
          sx={{ minWidth: '150px' }}
        >
          Manual Input
        </Button>
      </Box>

      {activeOption && (
        <Paper elevation={3} sx={{ p: 3 }}>
          <RecommendationType searchType={activeOption} />
        </Paper>
      )}
    </Box>
  );
};

export default SearchOptions;
