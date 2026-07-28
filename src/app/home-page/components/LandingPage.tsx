import React from 'react';
import { Box } from '@mui/material';
import WordOfTheDay from './WordOfTheDay';
import TodayTasksCard from '../../tasks-page/components/TodayTasksCard';

const LandingPage: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 2 }}>
      <WordOfTheDay />
      <TodayTasksCard />
    </Box>
  );
};

export default LandingPage;
