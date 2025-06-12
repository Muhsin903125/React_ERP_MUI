// @mui
import { styled } from '@mui/material/styles';
import { ListItemIcon, ListItemButton, alpha } from '@mui/material';

// ----------------------------------------------------------------------

export const StyledNavItem = styled((props) => <ListItemButton disableGutters {...props} />)(({ theme }) => ({
  ...theme.typography.body2,
  height: 36,
  position: 'relative',
  textTransform: 'capitalize',
  color: theme.palette.text.secondary,
  borderRadius: theme.shape.borderRadius * 1.5,
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  userSelect: 'none',
  
  // Enhanced active state
  '&.active': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
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
    
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  
  // Enhanced hover state
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.06),
    color: theme.palette.primary.main,
    transform: 'translateX(2px)',
    
    '& .MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
  },
  
  // Focus state for accessibility
  '&:focus': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  },
  
  // Disabled state
  '&.Mui-disabled': {
    opacity: 0.5,
    pointerEvents: 'none',
  },
}));

export const StyledNavItemIcon = styled(ListItemIcon)(({ theme }) => ({
  width: 18,
  height: 18,
  color: 'inherit',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 18,
  marginRight: theme.spacing(1),
  transition: 'all 0.2s ease',
  
  '& > *': {
    width: '100%',
    height: '100%',
  },
}));
