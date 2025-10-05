import React from 'react';
import { Box } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Homepage from './Homepage';
import FundSearch from '../apps/FundSearch';
import FundListByYear from '../apps/FundListByYear';
import FundChart from '../apps/FundChart';

const App = () => {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Header />
        <Box component="main" sx={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/search" element={<FundSearch />} />
            <Route path="/comparison" element={<FundListByYear />} />
            <Route path="/chart" element={<FundChart />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Router>
  );
};

export default App;
