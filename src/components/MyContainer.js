import { Container } from '@mui/material'; 
import {   useTheme } from '@mui/material/styles';

const MyContainer = ({ children }) => {
  const theme = useTheme();
  return (
    <Container
      sx={{
        backgroundColor: theme.palette.background.transparent,
        borderRadius: '10px',
        boxShadow: '3px 4px 12px 0px rgba(0, 0, 0, 0.1)',
        padding: '20px',
      }}
    >
      {children}
    </Container>
  );
};

export default MyContainer;