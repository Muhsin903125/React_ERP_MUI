import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
import { ListItemText } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { StyledNavItem, StyledNavItemIcon } from './styles';

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
};

export default function NavItem({ item, level = 0 }) {
  const { title, path, icon, info } = item;
  const theme = useTheme();

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

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={{
        pl: level * 2,
        backgroundColor: getLevelBgColor(level),
        ...(level > 0 && {
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          borderRadius: 0,
        }),
        '&.active': {
          color: 'text.primary',
          bgcolor: 'action.selected',
          fontWeight: 'fontWeightBold',
        },
      }}
    >
      <StyledNavItemIcon>{icon && icon}</StyledNavItemIcon>

      <ListItemText 
        disableTypography 
        primary={title}
        sx={{ 
        //   fontWeight: level === 0 || level === 1 ? 'normal' : 'bold',
          fontSize: `${16 - level * 0.5}px`
        }}
      />

      {info && info}
    </StyledNavItem>
  );
} 