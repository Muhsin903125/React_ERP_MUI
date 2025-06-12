// @mui
import PropTypes from 'prop-types';
import {
  Card,
  CardHeader,
  CardContent,
  Box,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Chip,
  LinearProgress,
  Grid,
  Button
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppActivitySummary.propTypes = {
  title: PropTypes.string,
  data: PropTypes.object.isRequired,
};

export default function AppActivitySummary({ title, data, ...other }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const {
    todayActivities = 0,
    weekActivities = 0,
    monthActivities = 0,
    pendingTasks = 0,
    completedTasks = 0,
    activeUsers = 0,
    recentTypes = []
  } = data;

  const completionRate = completedTasks + pendingTasks > 0 
    ? Math.round((completedTasks / (completedTasks + pendingTasks)) * 100) 
    : 0;

  const getActivityTypeIcon = (type) => {
    switch (type) {
      case 'sale': return 'mdi:cash-multiple';
      case 'purchase': return 'mdi:cart-arrow-down';
      case 'payment': return 'mdi:credit-card';
      case 'invoice': return 'mdi:file-document';
      case 'user': return 'mdi:account';
      case 'system': return 'mdi:cog';
      default: return 'mdi:information';
    }
  };

  const getActivityTypeColor = (type) => {
    switch (type) {
      case 'sale': return theme.palette.success.main;
      case 'purchase': return theme.palette.info.main;
      case 'payment': return theme.palette.warning.main;
      case 'invoice': return theme.palette.error.main;
      case 'user': return theme.palette.primary.main;
      case 'system': return theme.palette.grey[600];
      default: return theme.palette.grey[500];
    }
  };

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.info.main, 0.02)} 100%)`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
      }}
      {...other}
    >
      <CardHeader
        title={title}
        action={
          <IconButton size="small" onClick={() => navigate('/activity')}>
            <Iconify icon="mdi:open-in-new" />
          </IconButton>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={3}>
          {/* Activity Stats */}
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {todayActivities}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Today
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main" fontWeight="bold">
                  {weekActivities}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This Week
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {monthActivities}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This Month
                </Typography>
              </Box>
            </Grid>
          </Grid>

          {/* Task Completion */}
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">Task Completion</Typography>
              <Typography variant="body2" color="text.secondary">
                {completionRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.grey[500], 0.16),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                },
              }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Completed: {completedTasks}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending: {pendingTasks}
              </Typography>
            </Box>
          </Box>

          {/* Active Users */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <Iconify icon="mdi:account-group" width={18} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2">
                {activeUsers} Active Users
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Currently online
              </Typography>
            </Box>
          </Box>

          {/* Recent Activity Types */}
          {recentTypes.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Recent Activity Types
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {recentTypes.slice(0, 4).map((type, index) => (
                  <Chip
                    key={index}
                    size="small"
                    icon={<Iconify icon={getActivityTypeIcon(type)} width={14} />}
                    label={type.charAt(0).toUpperCase() + type.slice(1)}
                    sx={{
                      height: 24,
                      fontSize: '0.7rem',
                      bgcolor: alpha(getActivityTypeColor(type), 0.1),
                      color: getActivityTypeColor(type),
                      border: `1px solid ${alpha(getActivityTypeColor(type), 0.2)}`,
                      '& .MuiChip-icon': {
                        color: 'inherit',
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* View Details Button */}
          <Button
            variant="contained"
            size="small"
            startIcon={<Iconify icon="mdi:chart-timeline-variant" />}
            onClick={() => navigate('/activity')}
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.2),
              },
            }}
          >
            View Full Activity Log
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
