import { useState } from 'react';
import { Outlet } from 'react-router-dom';
// @mui
import { styled } from '@mui/material/styles';
import { Container } from '@mui/material';
//
import Header from './header';
import Nav from './nav';

// ----------------------------------------------------------------------

const APP_BAR_MOBILE = 64;
const APP_BAR_DESKTOP = 92;

const StyledRoot = styled('div')({
  display: 'flex',
  minHeight: '100%',
  overflow: 'hidden',
});

const Main = styled('div')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  minHeight: '100%',
  maxWidth:"lg", 
  paddingTop: APP_BAR_MOBILE + 24,
  paddingBottom: theme.spacing(10),
  [theme.breakpoints.up('md')]: {
    paddingTop: APP_BAR_DESKTOP  ,
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  backgroundImage: 'url(/assets/illustrations/illustration_docs.svg)',
  backgroundSize: "350px",
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'bottom right',
}));

// ----------------------------------------------------------------------

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);

  return (
    <StyledRoot>
      <Header onOpenNav={() => setOpen(true)} />

      <Nav openNav={open} onCloseNav={() => setOpen(false)} />

      <Main>
        {/* <Container> */}
          <Outlet />
        {/* </Container> */}
      </Main>
    </StyledRoot>
  );
}
