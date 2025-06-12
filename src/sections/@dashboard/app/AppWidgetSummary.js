// @mui
import PropTypes from 'prop-types';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Card, Typography, Box, useMediaQuery, IconButton, Chip } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledCard = styled(Card)(({ theme, color }) => ({
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2.5),
  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.08)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
  backdropFilter: 'blur(10px)',
  border: `1px solid ${alpha(theme.palette[color].main, 0.12)}`,
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, transparent 50%)`,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${alpha(theme.palette[color].main, 0.15)}`,
    '&::before': {
      opacity: 1,
    },
    '& .widget-icon': {
      transform: 'rotate(10deg) scale(1.1)',
    },
    '& .widget-value': {
      transform: 'scale(1.05)',
    },
  },
}));

const StyledIcon = styled(Box)(({ theme, color }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.spacing(2),
  background: `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
  color: 'white',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    inset: 0,
    borderRadius: 'inherit',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::after': {
    opacity: 1,
  },
}));

const AnimatedBackground = styled(Box)(({ theme, color }) => ({
  position: 'absolute',
  top: -50,
  right: -50,
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: `radial-gradient(circle, ${alpha(theme.palette[color].main, 0.1)} 0%, transparent 70%)`,
  transition: 'all 0.6s ease',
}));

// ----------------------------------------------------------------------

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  trend: PropTypes.string,
  change: PropTypes.string,
  subtitle: PropTypes.string,
  sx: PropTypes.object,
};

export default function AppWidgetSummary({ 
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
      <AnimatedBackground color={color} />
      
      {/* Header with Icon and Action */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        mb: 2,
        position: 'relative',
        zIndex: 2,
      }}>
        <StyledIcon
          className="widget-icon"
          color={color}
          sx={{
            width: isMobile ? 48 : 56,
            height: isMobile ? 48 : 56,
          }}
        >
          <Iconify 
            icon={icon} 
            width={isMobile ? 24 : 28} 
            height={isMobile ? 24 : 28} 
          />
        </StyledIcon>

        {trend && change && (
          <Chip
            size="small"
            icon={<Iconify icon={getTrendIcon(trend)} width={14} />}
            label={change}
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha(getTrendColor(trend), 0.12),
              color: getTrendColor(trend),
              border: `1px solid ${alpha(getTrendColor(trend), 0.24)}`,
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        )}
      </Box>

      {/* Main Content */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        <Typography 
          variant={isMobile ? "h4" : "h3"} 
          className="widget-value"
          sx={{ 
            fontWeight: 800,
            mb: 0.5,
            background: `linear-gradient(135deg, ${theme.palette[color].dark} 0%, ${theme.palette[color].main} 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
            transition: 'transform 0.3s ease',
          }}
        >
          {fShortenNumber(total)}
        </Typography>

        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: theme.palette.text.primary,
            fontSize: isMobile ? '0.875rem' : '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            mb: subtitle ? 0.5 : 0,
          }}
        >
          {title}
        </Typography>

        {subtitle && (
          <Typography 
            variant="body2" 
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              fontWeight: 500,
              opacity: 0.8,
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
          bottom: -10,
          right: -10,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.1)} 0%, transparent 70%)`,
          zIndex: 0,
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette[color].main} 0%, ${theme.palette[color].light} 50%, ${theme.palette[color].main} 100%)`,
          borderRadius: '20px 20px 0 0',
        }}
      />
    </StyledCard>
  );
}
