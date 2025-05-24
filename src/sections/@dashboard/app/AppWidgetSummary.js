// @mui
import PropTypes from 'prop-types';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Card, Typography, Box, useMediaQuery } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledIcon = styled('div')(({ theme }) => ({
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

// ----------------------------------------------------------------------

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  sx: PropTypes.object,
};

export default function AppWidgetSummary({ title, total, icon, color = 'primary', sx, ...other }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        height: '100%',
        py: isMobile ? 2 : 3,
        px: isMobile ? 2 : 2.5,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => alpha(theme.palette[color].lighter, 0.8),
        borderRadius: '12px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.18)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        },
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: 2,
        height: '100%',
      }}>
        <StyledIcon
          sx={{
            color: (theme) => theme.palette[color].dark,
            backgroundImage: (theme) =>
              `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(
                theme.palette[color].dark,
                0.24
              )} 100%)`,
            width: isMobile ? theme.spacing(5) : theme.spacing(6),
            height: isMobile ? theme.spacing(5) : theme.spacing(6),
            minWidth: isMobile ? theme.spacing(5) : theme.spacing(6),
          }}
        >
          <Iconify 
            icon={icon} 
            width={isMobile ? 20 : 24} 
            height={isMobile ? 20 : 24} 
          />
        </StyledIcon>

        <Box sx={{ flex: 1 }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 700,
              mb: 0.5,
              background: (theme) => `linear-gradient(45deg, ${theme.palette[color].dark} 30%, ${theme.palette[color].main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            {fShortenNumber(total)}
          </Typography>

          <Typography 
            variant="subtitle2" 
            sx={{ 
              opacity: 0.72,
              fontSize: isMobile ? '0.75rem' : '0.875rem',
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
