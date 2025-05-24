// @mui
import PropTypes from 'prop-types';
import { alpha, styled, useTheme } from '@mui/material/styles';
import { Box, Card, Typography, useMediaQuery } from '@mui/material';
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
  position: 'absolute',
  right: -10,
  top: -10,
  padding: theme.spacing(1),
  '&:hover': {
    transform: 'rotate(15deg)',
  }
}));

// ----------------------------------------------------------------------

AppWidgetSummary2.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  sx: PropTypes.object,
};

export default function AppWidgetSummary2({ title, total, icon, color = 'primary', sx, ...other }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      sx={{
        height: '100%',
        p: isMobile ? 2 : 2.5,
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => alpha(theme.palette[color].lighter, 0.8),
        borderRadius: '16px',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.18)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'visible',
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
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        <Typography 
          variant={isMobile ? "h5" : "h4"} 
          sx={{ 
            fontWeight: 'bold',
            mb: 1,
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
            color: (theme) => theme.palette[color].dark,
          }}
        >
          {title}
        </Typography>
      </Box>

      <StyledIcon
        sx={{
          color: '#fff',
          background: (theme) => `linear-gradient(135deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
          width: isMobile ? theme.spacing(5) : theme.spacing(6),
          height: isMobile ? theme.spacing(5) : theme.spacing(6),
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        }}
      >
        <Iconify 
          icon={icon} 
          width={isMobile ? 20 : 24} 
          height={isMobile ? 20 : 24} 
        />
      </StyledIcon>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: (theme) => `linear-gradient(90deg, ${theme.palette[color].main} 0%, ${theme.palette[color].dark} 100%)`,
          borderRadius: '0 0 16px 16px',
          opacity: 0.8,
        }}
      />
    </Card>
  );
}
