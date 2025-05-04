import { styled } from '@mui/material/styles';
import { Card, Box } from '@mui/material';

export const StyledRoot = styled('div')({
  minHeight: '100%',
  paddingBottom: 24,
});

export const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  boxShadow: theme.customShadows.card,
  borderRadius: theme.shape.borderRadius * 2,
}));

export const LogoUploadBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.neutral,
  border: `1px dashed ${theme.palette.grey[500_32]}`,
  '&:hover': {
    opacity: 0.72,
    cursor: 'pointer',
  },
}));

export const StyledAvatar = styled('div')(({ theme }) => ({
  width: 200,
  height: 200,
  marginBottom: theme.spacing(2),
  borderRadius: '10px',
  overflow: 'hidden',
  position: 'relative', 
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  '&:hover .overlay': {
    opacity: 1,
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
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  transition: theme.transitions.create('opacity'),
  color: theme.palette.common.white,
})); 