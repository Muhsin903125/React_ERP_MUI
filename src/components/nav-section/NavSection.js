import { useState } from 'react';
import PropTypes from 'prop-types';
// @mui
import { Box, List, Collapse, ListItemText } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { useTheme } from '@mui/material/styles';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';
import NavItem from './NavItem';

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  const theme = useTheme();
  const [openMenus, setOpenMenus] = useState({});

  // Get background color based on level
  const getLevelBgColor = (level) => {
    switch (level) {
      case 0:
        return 'transparent';
      case 1:
        return theme.palette.background.neutral;
      case 2:
        return theme.palette.secondary.lighter;
      case 3:
        return theme.palette.primary.lighter;
      default:
        return theme.palette.info.lighter;
    }
  };

  // Get item background color based on level
  const getItemBgColor = (level) => {
    switch (level) {
      case 0:
        return 'transparent';
      case 1:
        return theme.palette.background.neutral;
      case 2:
        return theme.palette.secondary.lighter;
      case 3:
        return theme.palette.primary.lighter;
      default:
        return theme.palette.info.lighter;
    }
  };

  const handleMenuClick = (menuPath, level) => {
    // If it's a top-level menu (level 0), close all other top-level menus
    if (level === 0) {
      const newOpenMenus = {};
      
      // Toggle the clicked menu
      newOpenMenus[menuPath] = !openMenus[menuPath];
      
      // Keep open state of sub-menus within the clicked menu
      Object.keys(openMenus).forEach(key => {
        if (key.startsWith(`${menuPath}.`) && openMenus[key]) {
          newOpenMenus[key] = true;
        }
      });
      
      setOpenMenus(newOpenMenus);
    } else {
      // For sub-menus, just toggle without affecting other menus
      setOpenMenus(prev => ({
        ...prev,
        [menuPath]: !prev[menuPath]
      }));
    }
  };

  const renderNavItem = (item, level = 0, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}.${item.title}` : item.title;
    const hasChildren = item.childern && item.childern.length > 0;
    const isOpen = openMenus[currentPath];
    

    if (!hasChildren) {
      if(item.visible){
        return <NavItem key={currentPath} item={item} level={level} />;
      }
      return null;
    }

    return (
      <Box key={currentPath}>
        <StyledNavItem
          onClick={() => handleMenuClick(currentPath, level)}
          disableGutters
          sx={{
            pl: level * 2 ,
            backgroundColor: getItemBgColor(level),
            ...(level > 0 && {
              borderLeft: `3px solid ${level === 1 ? theme.palette.secondary.light :   theme.palette.primary.lighter}`,
              borderRadius: 0
            })
          }}
        >
          <StyledNavItemIcon>{item.icon && item.icon}</StyledNavItemIcon>
          <ListItemText 
            disableTypography 
            primary={item.title} 
            sx={{ 
              fontWeight: level === 0 ? 'normal' : 'normal',
              fontSize: `${16 - level * 0.5}px`
            }}
          />
          <StyledNavItemIcon>
            {isOpen ? <ExpandMore /> : <NavigateNextIcon />}
          </StyledNavItemIcon>
        </StyledNavItem>

        <Collapse 
          in={isOpen} 
          timeout="auto" 
          unmountOnExit 
          sx={{
            backgroundColor: getLevelBgColor(level + 1),
            ml: level > 0 ? 1 : 0
          }}
        >
          <List disablePadding>
            {item.childern.map(child => 
               renderNavItem(child, level + 1, currentPath)
            )}
          </List>
        </Collapse>
      </Box>
    );
  };

  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }} component="nav">
        {data.map(item => renderNavItem(item))}
      </List>
    </Box>
  );
} 