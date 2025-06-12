// @mui
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Stack,
  IconButton,
  Avatar
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppTopProducts.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function AppTopProducts({ title, list, ...other }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.success.main, 0.02)} 100%)`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
      }}
      {...other}
    >
      <CardHeader
        title={title}
        action={
          <IconButton size="small">
            <Iconify icon="mdi:trending-up" />
          </IconButton>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2.5}>
          {list.map((product, index) => (
            <ProductItem key={product.id} product={product} index={index} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

ProductItem.propTypes = {
  product: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    sales: PropTypes.number,
    revenue: PropTypes.string,
    progress: PropTypes.number,
    image: PropTypes.string,
  }),
  index: PropTypes.number,
};

function ProductItem({ product, index }) {
  const theme = useTheme();
  const { name, sales, revenue, progress, image } = product;

  const getRankColor = (index) => {
    if (index === 0) return theme.palette.warning.main; // Gold
    if (index === 1) return theme.palette.grey[400]; // Silver
    if (index === 2) return '#CD7F32'; // Bronze
    return theme.palette.grey[600];
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        p: 2,
        borderRadius: 2,
        bgcolor: alpha(theme.palette.background.neutral, 0.4),
        border: `1px solid ${alpha(theme.palette.grey[500], 0.1)}`,
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: alpha(theme.palette.background.neutral, 0.6),
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Typography
          variant="h6"
          sx={{
            color: getRankColor(index),
            fontWeight: 'bold',
            minWidth: 20,
            textAlign: 'center',
          }}
        >
          #{index + 1}
        </Typography>
        
        <Avatar
          src={image}
          sx={{
            width: 40,
            height: 40,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Iconify icon="mdi:package-variant" />
        </Avatar>
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap sx={{ mb: 0.5 }}>
          {name}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {sales} units sold
          </Typography>
          <Typography variant="body2" color="success.main" fontWeight="600">
            {revenue}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.grey[500], 0.16),
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ minWidth: 35 }}>
            {progress}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
