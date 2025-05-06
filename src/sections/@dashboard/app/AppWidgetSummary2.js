// @mui
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Box, Card, Typography } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledIcon = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'flex-end',
  // width: theme.spacing(8),
  // height: theme.spacing(8),
  justifyContent: 'flex-end',
  marginBottom: theme.spacing(2),
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
  return (
    <Card
      sx={{
        p: 3.5,
        boxShadow: 0,
        textAlign: 'center',
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
        ...sx,
        display: 'flex',
        flexDirection: 'row', 
        justifyContent: 'space-between',
      }}
      {...other}
    >
      

      <Typography variant="h6" sx={{ opacity: 0.72 }}>
        {title}
      </Typography>
      <Box>
        <StyledIcon>
          <Iconify icon={icon} width={24} height={24} />
        </StyledIcon>
        <Typography variant="h3">{fShortenNumber(total)}</Typography>
      </Box>
    </Card>
  );
}
