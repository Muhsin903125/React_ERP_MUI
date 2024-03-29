import { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, Collapse, ListItemText,  } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import {   useTheme } from '@mui/material/styles';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';
// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  const theme = useTheme();
  const [open, setOpen] = useState({});
  const handleClick = (title) => {
    setOpen({
      ...open,
      [title]: !open[title],
    });
  };

  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }} component="nav">
        {data.map((item) => (
          item.childern !== undefined && item.childern.length > 0 ?
            <>
              <StyledNavItem onClick={() => { handleClick(item.title) }} disableGutters    >

                <StyledNavItemIcon>{item.icon && item.icon}</StyledNavItemIcon>

                <ListItemText disableTypography primary={item.title} />
                {open[item.title] ?
                  <StyledNavItemIcon><ExpandMore /> </StyledNavItemIcon>
                  : <StyledNavItemIcon><NavigateNextIcon /></StyledNavItemIcon>
                }

              </StyledNavItem>
              <Collapse in={open[item.title]} timeout="auto" unmountOnExit style={{ backgroundColor: theme.palette.background.neutral }}>
                <List disablePadding>
                  {item.childern.map((item2) => (
                    <NavItem key={item2.title} item={item2} />
                  ))}
                </List>
              </Collapse>
            </>
            :

            <NavItem key={item.title} item={item} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item }) {

  const { title, path, icon, info } = item;

  return (

    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
          // boxShadow: '2px 5px 7px 0px rgb(32 101 209 / 20%)'
        },
      }}
    >
      <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
}
