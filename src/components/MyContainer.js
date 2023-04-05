import { Container } from '@mui/material';

const MyContainer = ({ children }) => {
  return (
    <Container
      sx={{
        backgroundColor: '#ffffffe0',
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