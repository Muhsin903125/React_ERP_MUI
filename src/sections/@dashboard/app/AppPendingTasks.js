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
  Chip,
  Avatar,
  AvatarGroup
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppPendingTasks.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function AppPendingTasks({ title, list, ...other }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.warning.main, 0.02)} 100%)`,
        backdropFilter: 'blur(8px)',
        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
      }}
      {...other}
    >
      <CardHeader
        title={title}
        action={
          <IconButton size="small">
            <Iconify icon="mdi:plus" />
          </IconButton>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {list.map((task, index) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    priority: PropTypes.string,
    dueDate: PropTypes.string,
    assignees: PropTypes.array,
    progress: PropTypes.number,
    status: PropTypes.string,
  }),
};

function TaskItem({ task }) {
  const theme = useTheme();
  const { title, description, priority, dueDate, assignees, progress, status } = task;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return theme.palette.error.main;
      case 'medium': return theme.palette.warning.main;
      case 'low': return theme.palette.success.main;
      default: return theme.palette.grey[500];
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'info';
      case 'pending': return 'warning';
      case 'overdue': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box
      sx={{
        p: 2.5,
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
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2" sx={{ flex: 1 }}>
          {title}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Chip
            label={priority}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.6rem',
              bgcolor: alpha(getPriorityColor(priority), 0.1),
              color: getPriorityColor(priority),
              border: `1px solid ${alpha(getPriorityColor(priority), 0.2)}`,
            }}
          />
          <Chip
            label={status}
            size="small"
            color={getStatusColor(status)}
            sx={{ height: 20, fontSize: '0.6rem' }}
          />
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {description}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Due: {dueDate}
          </Typography>
          {progress !== undefined && (
            <Chip
              label={`${progress}%`}
              size="small"
              variant="outlined"
              sx={{ height: 18, fontSize: '0.6rem' }}
            />
          )}
        </Box>

        {assignees && assignees.length > 0 && (
          <AvatarGroup max={3} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
            {assignees.map((assignee, index) => (
              <Avatar key={index} alt={assignee.name} src={assignee.avatar}>
                {assignee.name.charAt(0)}
              </Avatar>
            ))}
          </AvatarGroup>
        )}
      </Box>
    </Box>
  );
}
