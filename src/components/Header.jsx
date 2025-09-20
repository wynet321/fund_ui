import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { UI_CONSTANTS } from '../constants';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {UI_CONSTANTS.APP_TITLE}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={Link} to="/">
            首页
          </Button>
          <Button color="inherit" component={Link} to="/search">
            {UI_CONSTANTS.NAVIGATION.FUND_SEARCH}
          </Button>
          <Button color="inherit" component={Link} to="/comparison">
            {UI_CONSTANTS.NAVIGATION.FUND_COMPARISON}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
