import PropTypes from 'prop-types';
import { NavLink as RouterLink, useLocation } from 'react-router-dom';
import { ListItemText, IconButton, Tooltip, alpha, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Star, StarBorder } from '@mui/icons-material';
import { StyledNavItem, StyledNavItemIcon } from './styles';

NavItem.propTypes = {
  item: PropTypes.object,
  level: PropTypes.number,
  isActive: PropTypes.bool,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
};

export default function NavItem({ 
  item, 
  level = 0, 
  isActive = false, 
  isFavorite = false, 
  onToggleFavorite 
}) {
  const { title, path, icon, info, badge } = item;
  const theme = useTheme();
  const location = useLocation();

  // Check if this item is currently active
  const isCurrentlyActive = location.pathname === path || isActive;

  // Get compact styling based on level and active state
  const getCompactStyling = () => {
    const baseStyles = {
      pl: level * 1.5 + 0.5,
      pr: 0.5,
      mx: 0.5,
      my: 0.1,
      minHeight: 32,
      borderRadius: 1.5,
      position: 'relative',
      transition: 'all 0.2s ease',
      overflow: 'hidden',
    };

    if (isCurrentlyActive) {
      return {
        ...baseStyles,
        backgroundColor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.main,
        fontWeight: 600,
        
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          backgroundColor: theme.palette.primary.main,
          borderRadius: '0 2px 2px 0',
        },
        
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.16),
          transform: 'translateX(2px)',
        },
      };
    }

    return {
      ...baseStyles,
      backgroundColor: 'transparent',
      color: theme.palette.text.secondary,
      
      '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.06),
        color: theme.palette.primary.main,
        transform: 'translateX(2px)',
        
        '& .nav-icon': {
          color: theme.palette.primary.main,
        },
        
        '& .favorite-btn': {
          opacity: 1,
        },
      },
    };
  };

  return (
    <StyledNavItem
      component={RouterLink}
      to={path}
      sx={getCompactStyling()}
      aria-label={`Navigate to ${title}`}
    >
      <StyledNavItemIcon 
        className="nav-icon"
        sx={{ 
          color: isCurrentlyActive ? theme.palette.primary.main : 'inherit',
          minWidth: 18,
          marginRight: 1,
          transition: 'all 0.2s ease',
        }}
      >
        {icon && icon}
      </StyledNavItemIcon>

      <ListItemText 
        disableTypography 
        primary={title}
        sx={{ 
          fontWeight: isCurrentlyActive ? 600 : 400,
          fontSize: `${13 - level * 0.5}px`,
          color: 'inherit',
          transition: 'all 0.2s ease',
          pr: 0.5,
        }}
      />

      {/* Badge for notifications or counts */}
      {badge && (
        <Box
          sx={{
            minWidth: 16,
            height: 16,
            backgroundColor: theme.palette.error.main,
            color: 'white',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 600,
            mr: 0.5,
          }}
        >
          {badge}
        </Box>
      )}      {/* Compact favorite toggle button */}
      {onToggleFavorite && (
        <Tooltip title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
          <IconButton
            className="favorite-btn"
            size="small"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite();
            }}
            sx={{
              opacity: 0.7,
              transition: 'all 0.2s ease',
              p: 0.25,
              color: isFavorite ? theme.palette.warning.main : theme.palette.text.secondary,
              
              '&:hover': {
                opacity: 1,
                backgroundColor: alpha(theme.palette.warning.main, 0.1),
                color: theme.palette.warning.main,
              },
            }}
          >
            {isFavorite ? <Star sx={{ fontSize: 14 }} /> : <StarBorder sx={{ fontSize: 14 }} />}
          </IconButton>
        </Tooltip>
      )}

      {info && info}
    </StyledNavItem>
  );
}