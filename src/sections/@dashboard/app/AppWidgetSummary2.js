// @mui
import PropTypes from 'prop-types';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Card, Typography, useMediaQuery, Chip, Stack } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme, color }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, ${alpha(theme.palette[color].main, 0.03)} 100%)`,
  backdropFilter: 'blur(20px)',
  border: `2px solid ${alpha(theme.palette[color].main, 0.15)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.15)} 0%, transparent 60%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-12px) scale(1.03)',
    boxShadow: `0 25px 50px ${alpha(theme.palette[color].main, 0.2)}`,
    borderColor: alpha(theme.palette[color].main, 0.3),
    '&::before': {
      opacity: 1,
    },
    '& .floating-icon': {
      transform: 'rotate(-15deg) scale(1.15)',
    },
    '& .pulse-ring': {
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    '& .gradient-text': {
      backgroundSize: '200% auto',
      animation: 'shimmer 2s ease-in-out infinite',
    },
  },
  '@keyframes pulse': {
    '0%, 100%': {
      opacity: 1,
    },
    '50%': {
      opacity: 0.5,
    },
  },
  '@keyframes shimmer': {
    '0%': {
      backgroundPosition: '200% center',
    },
    '100%': {
      backgroundPosition: '-200% center',
    },
  },
}));

const FloatingIcon = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  right: -8,
  top: -8,
  width: 48,
  height: 48,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
  color: 'white',
  boxShadow: `0 8px 20px ${alpha(theme.palette[color].main, 0.4)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  zIndex: 3,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: -4,
    borderRadius: '50%',
    background: `conic-gradient(from 0deg, ${theme.palette[color].main}, ${theme.palette[color].light}, ${theme.palette[color].main})`,
    zIndex: -1,
    opacity: 0.6,
  },
}));

const GradientOverlay = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  height: 4,
  background: `linear-gradient(90deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 50%, ${theme.palette[color].main} 100%)`,
  borderRadius: '0 0 20px 20px',
}));

// ----------------------------------------------------------------------

AppWidgetSummary2.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  trend: PropTypes.string,
  change: PropTypes.string,
  subtitle: PropTypes.string,
  sx: PropTypes.object,
};

export default function AppWidgetSummary2({ 
  title, 
  total, 
  icon, 
  color = 'primary', 
  trend, 
  change, 
  subtitle, 
  sx, 
  ...other 
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return theme.palette.success.main;
      case 'down': return theme.palette.error.main;
      case 'neutral': return theme.palette.warning.main;
      default: return theme.palette.grey[500];
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return 'mdi:trending-up';
      case 'down': return 'mdi:trending-down';
      case 'neutral': return 'mdi:trending-neutral';
      default: return 'mdi:minus';
    }
  };

  return (
    <StyledCard
      color={color}
      sx={{
        height: '100%',
        p: isMobile ? 2.5 : 3,
        position: 'relative',
        zIndex: 1,
        ...sx,
      }}
      {...other}
    >
      {/* Floating Icon */}
      <FloatingIcon className="floating-icon" color={color}>
        <Box className="pulse-ring" sx={{ position: 'absolute', inset: 0, borderRadius: '50%' }} />
        <Iconify 
          icon={icon} 
          width={isMobile ? 20 : 24} 
          height={isMobile ? 20 : 24} 
        />
      </FloatingIcon>

      {/* Main Content */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        zIndex: 2,
        pr: 3, // Make room for floating icon
      }}>
        {/* Value */}
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          className="gradient-text"
          sx={{ 
            fontWeight: 900,
            mb: 1,
            background: `linear-gradient(135deg, ${theme.palette[color].dark} 0%, ${theme.palette[color].main} 50%, ${theme.palette[color].light} 100%)`,
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
          }}
        >
          {fShortenNumber(total)}
        </Typography>

        {/* Title and Change */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: subtitle ? 1 : 0 }}>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              color: theme.palette.text.primary,
              fontSize: isMobile ? '0.875rem' : '1rem',
              fontWeight: 700,
              lineHeight: 1.3,
              flex: 1,
            }}
          >
            {title}
          </Typography>

          {trend && change && (
            <Chip
              size="small"
              icon={<Iconify icon={getTrendIcon(trend)} width={12} />}
              label={change}
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                bgcolor: alpha(getTrendColor(trend), 0.15),
                color: getTrendColor(trend),
                border: `1px solid ${alpha(getTrendColor(trend), 0.3)}`,
                '& .MuiChip-icon': {
                  color: 'inherit',
                  marginLeft: '2px',
                },
                '& .MuiChip-label': {
                  paddingLeft: '4px',
                  paddingRight: '8px',
                },
              }}
            />
          )}
        </Stack>

        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              fontWeight: 500,
              opacity: 0.8,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Decorative Elements */}
      <Box
        sx={{
          position: 'absolute',
          bottom: -20,
          left: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette[color].main, 0.08)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette[color].light, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />

      <GradientOverlay color={color} />
    </StyledCard>
  );
}
