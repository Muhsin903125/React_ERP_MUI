// @mui
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Chip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppQuickStats.propTypes = {
  title: PropTypes.string,
  stats: PropTypes.array.isRequired,
};

export default function AppQuickStats({ title, stats, ...other }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        overflow: 'hidden',
      }}
      {...other}
    >
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{
            p: 2.5,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight="700">
              {title}
            </Typography>
            <IconButton size="small" sx={{ color: 'white' }}>
              <Iconify icon="mdi:trending-up" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack spacing={2}>
            {stats.map((stat, index) => (
              <StatItem key={stat.id || index} stat={stat} />
            ))}
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

StatItem.propTypes = {
  stat: PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    change: PropTypes.string,
    trend: PropTypes.string,
    icon: PropTypes.string,
    color: PropTypes.string,
  }),
};

function StatItem({ stat }) {
  const theme = useTheme();
  const { label, value, change, trend, icon, color = 'primary' } = stat;

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
          transform: 'translateX(4px)',
        },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          bgcolor: alpha(theme.palette[color].main, 0.1),
          color: theme.palette[color].main,
        }}
      >
        <Iconify icon={icon} width={20} />
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h6" fontWeight="700">
          {value}
        </Typography>
      </Box>

      {change && trend && (
        <Box sx={{ textAlign: 'right' }}>
          <Chip
            icon={<Iconify icon={getTrendIcon(trend)} width={14} />}
            label={change}
            size="small"
            sx={{
              height: 24,
              fontSize: '0.7rem',
              fontWeight: 600,
              bgcolor: alpha(getTrendColor(trend), 0.1),
              color: getTrendColor(trend),
              border: `1px solid ${alpha(getTrendColor(trend), 0.2)}`,
              '& .MuiChip-icon': {
                color: 'inherit',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
}
