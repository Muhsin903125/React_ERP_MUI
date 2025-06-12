// @mui
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
// components
import Iconify from '../../../components/iconify';
import { fDateTime } from '../../../utils/formatTime';

// ----------------------------------------------------------------------

AppRecentActivity.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array.isRequired,
  showViewAll: PropTypes.bool,
};

export default function AppRecentActivity({ title, list, showViewAll = true, ...other }) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
      }}
      {...other}
    >
      <CardHeader
        title={title}
        action={
          <IconButton size="small">
            <Iconify icon="mdi:dots-horizontal" />
          </IconButton>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {list.slice(0, 4).map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </Stack>

        {showViewAll && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Iconify icon="mdi:history" />}
              onClick={() => navigate('/activity')}
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.3),
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              View All Activities
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

ActivityItem.propTypes = {
  activity: PropTypes.shape({
    id: PropTypes.string,
    type: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    time: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string,
  }),
};

function ActivityItem({ activity }) {
  const theme = useTheme();
  const { type, title, description, time, avatar, status } = activity;

  const getTypeColor = (type) => {
    switch (type) {
      case 'sale': return theme.palette.success.main;
      case 'purchase': return theme.palette.info.main;
      case 'payment': return theme.palette.warning.main;
      case 'invoice': return theme.palette.error.main;
      default: return theme.palette.grey[500];
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'sale': return 'mdi:cash-multiple';
      case 'purchase': return 'mdi:cart-arrow-down';
      case 'payment': return 'mdi:credit-card';
      case 'invoice': return 'mdi:file-document';
      default: return 'mdi:information';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
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
          bgcolor: alpha(getTypeColor(type), 0.1),
          color: getTypeColor(type),
        }}
      >
        <Iconify icon={getTypeIcon(type)} width={20} />
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
          {description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {time}
          </Typography>
          {status && (
            <Chip
              label={status}
              size="small"
              color={status === 'completed' ? 'success' : status === 'pending' ? 'warning' : 'default'}
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
