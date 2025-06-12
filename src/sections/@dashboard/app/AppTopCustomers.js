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
  Chip
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppTopCustomers.propTypes = {
  title: PropTypes.string,
  list: PropTypes.array.isRequired,
};

export default function AppTopCustomers({ title, list, ...other }) {
  const theme = useTheme();

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
          <IconButton size="small">
            <Iconify icon="mdi:account-group" />
          </IconButton>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2}>
          {list.map((customer, index) => (
            <CustomerItem key={customer.id} customer={customer} index={index} />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

CustomerItem.propTypes = {
  customer: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    totalPurchases: PropTypes.string,
    lastOrder: PropTypes.string,
    status: PropTypes.string,
    avatar: PropTypes.string,
  }),
  index: PropTypes.number,
};

function CustomerItem({ customer, index }) {
  const theme = useTheme();
  const { name, email, totalPurchases, lastOrder, status, avatar } = customer;

  const getRankBadge = (index) => {
    if (index < 3) {
      const colors = [theme.palette.warning.main, theme.palette.grey[400], '#CD7F32'];
      const icons = ['mdi:crown', 'mdi:medal', 'mdi:medal'];
      return {
        color: colors[index],
        icon: icons[index],
      };
    }
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const rankBadge = getRankBadge(index);

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
        position: 'relative',
        '&:hover': {
          bgcolor: alpha(theme.palette.background.neutral, 0.6),
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[4],
        },
      }}
    >
      {rankBadge && (
        <Box
          sx={{
            position: 'absolute',
            top: -8,
            left: -8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            bgcolor: rankBadge.color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            boxShadow: theme.shadows[2],
          }}
        >
          <Iconify icon={rankBadge.icon} width={14} color="white" />
        </Box>
      )}

      <Avatar
        src={avatar}
        sx={{
          width: 44,
          height: 44,
          bgcolor: alpha(theme.palette.info.main, 0.1),
          color: theme.palette.info.main,
          fontWeight: 600,
        }}
      >
        {name.charAt(0)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
          <Chip
            label={status}
            size="small"
            color={getStatusColor(status)}
            sx={{ height: 18, fontSize: '0.6rem' }}
          />
        </Box>
        
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 0.5 }}>
          {email}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="success.main" fontWeight="600">
            {totalPurchases}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Last: {lastOrder}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
