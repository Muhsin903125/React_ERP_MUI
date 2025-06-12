import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Breadcrumbs, 
  Link, 
  Typography, 
  Box, 
  Chip,
  useTheme,
  alpha 
} from '@mui/material';
import { NavigateNext, Home } from '@mui/icons-material';
import navConfig from '../../layouts/dashboard/nav/config';

export default function NavBreadcrumb() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  // Function to find navigation item by path
  const findNavItem = (items, path) => {
    for (const item of items) {
      if (item.path === path) {
        return item;
      }
      if (item.childern) {
        const found = findNavItem(item.childern, path);
        if (found) return found;
      }
    }
    return null;
  };

  // Function to build breadcrumb path
  const buildBreadcrumbs = (items, targetPath, breadcrumbs = []) => {
    for (const item of items) {
      const currentBreadcrumbs = [...breadcrumbs, item];
      
      if (item.path === targetPath) {
        return currentBreadcrumbs;
      }
      
      if (item.childern) {
        const result = buildBreadcrumbs(item.childern, targetPath, currentBreadcrumbs);
        if (result) return result;
      }
    }
    return null;
  };

  const currentPath = location.pathname;
  const breadcrumbs = buildBreadcrumbs(navConfig, currentPath) || [];

  // Don't show breadcrumbs for root paths
  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
      }}
    >
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="navigation breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            color: theme.palette.primary.main,
            opacity: 0.6,
          },
        }}
      >
        {/* Home link */}
        <Link
          component="button"
          onClick={() => navigate('/app')}
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: currentPath === '/app' ? theme.palette.primary.main : theme.palette.text.secondary,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: currentPath === '/app' ? 600 : 400,
            '&:hover': {
              color: theme.palette.primary.main,
            },
          }}
        >
          <Home sx={{ mr: 0.5, fontSize: 16 }} />
          Dashboard
        </Link>

        {/* Breadcrumb items */}
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isClickable = item.path && !isLast;

          if (isLast) {
            return (
              <Chip
                key={item.title}
                label={item.title}
                size="small"
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                  fontWeight: 600,
                  fontSize: 12,
                  height: 24,
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            );
          }

          if (isClickable) {
            return (
              <Link
                key={item.title}
                component="button"
                onClick={() => navigate(item.path)}
                sx={{
                  color: theme.palette.text.secondary,
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 400,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  },
                }}
              >
                {item.title}
              </Link>
            );
          }

          return (
            <Typography
              key={item.title}
              color="text.secondary"
              sx={{ fontSize: 14 }}
            >
              {item.title}
            </Typography>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
