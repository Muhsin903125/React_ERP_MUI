import { useState } from 'react';
import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, Collapse, ListItemText, } from '@mui/material';
import { ExpandMore, Padding } from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTheme } from '@mui/material/styles';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';
// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  const theme = useTheme();
  const [open, setOpen] = useState({});
  const [open2, setOpen2] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const handleClick = (title) => {
    setOpen({
      ...open,
      [title]: !open[title],
    });
  };
  const handleClick2 = (title) => {
    setOpen2({
      ...open2,
      [title]: !open2[title],
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
                  {item.childern.map((item2) => (item2.childern !== undefined && item2.childern.length > 0 ?
                    <>
                      <StyledNavItem onClick={() => { handleClick2(item2.title) }} disableGutters
                      sx={{pl:2}}
                      style={{ 
                        backgroundColor: theme.palette.secondary.lighter
                         }}   >

                        <StyledNavItemIcon>{item2.icon && item2.icon}</StyledNavItemIcon>

                        <ListItemText disableTypography primary={item2.title} />
                        {open2[item2.title] ?
                          <StyledNavItemIcon><ExpandMore /> </StyledNavItemIcon>
                          : <StyledNavItemIcon><NavigateNextIcon /></StyledNavItemIcon>
                        }

                      </StyledNavItem>
                      <Collapse in={open2[item2.title]} timeout="auto" unmountOnExit   sx={{pl:4}} style={{ backgroundColor: theme.palette.secondary.lighter }}>
                        <List disablePadding>
                          {item2.childern.map((item3) => (
                            <NavItem key={item3.title} item={item3} />
                          ))}
                        </List>
                      </Collapse>
                    </>
                    : <NavItem key={item2.title} item={item2} />
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
