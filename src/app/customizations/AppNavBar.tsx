import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import en from '../i18n/en';

const NAV_LINKS = [
  { to: '/budget', label: en.nav.budget },
  { to: '/home', label: en.nav.home },
  { to: '/tasks', label: en.nav.tasks },
];

const AppNavBar: React.FC = () => {
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <AppBar position="static">
      <Toolbar>
        <img
          src={`${process.env.PUBLIC_URL}/logo192.png`}
          alt=""
          width={32}
          height={32}
          style={{ marginRight: 12 }}
        />
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
        >
          {en.nav.appName}
        </Typography>
        <IconButton
          size="large"
          edge="end"
          color="inherit"
          aria-label={en.nav.openMenu}
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MenuIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
          {NAV_LINKS.map((link) => (
            <MenuItem
              key={link.to}
              component={Link}
              to={link.to}
              selected={location.pathname.startsWith(link.to)}
              onClick={handleCloseMenu}
            >
              {link.label}
            </MenuItem>
          ))}
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AppNavBar;
