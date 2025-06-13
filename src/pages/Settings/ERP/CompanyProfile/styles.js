import { styled } from '@mui/material/styles';
import { Card, Box, alpha } from '@mui/material';

export const StyledRoot = styled('div')(({ theme }) => ({
  minHeight: '100%',
  paddingBottom: theme.spacing(4),
  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.default, 1)} 50%, ${alpha(theme.palette.secondary.light, 0.05)} 100%)`,
}));

export const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: alpha(theme.palette.background.paper, 0.9),
  backdropFilter: 'blur(8px)',
  boxShadow: theme.customShadows.z16,
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
  position: 'relative',
  overflow: 'visible',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
    borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
  },
}));

export const LogoUploadBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius * 1.5,
  backgroundColor: alpha(theme.palette.background.neutral, 0.6),
  border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: 'all 0.3s ease',
  boxShadow: `0 2px 16px ${alpha(theme.palette.grey[500], 0.08)}`,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
    backgroundColor: alpha(theme.palette.background.neutral, 0.8),
  },
}));

export const StyledAvatar = styled('div')(({ theme }) => ({
  width: 200,
  height: 200,
  marginBottom: theme.spacing(2),
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  position: 'relative',
  boxShadow: `0 12px 24px ${alpha(theme.palette.common.black, 0.12)}`,
  border: `4px solid ${alpha(theme.palette.background.paper, 0.9)}`,
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    backgroundColor: '#fff',
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 16px 32px ${alpha(theme.palette.common.black, 0.16)}`,
    '& .overlay': {
      opacity: 1,
    },
  },
}));

export const AvatarOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: alpha(theme.palette.primary.dark, 0.7),
  opacity: 0,
  transition: theme.transitions.create('opacity', {
    duration: theme.transitions.duration.shorter,
  }),
  color: theme.palette.common.white,
  backdropFilter: 'blur(2px)',
}));