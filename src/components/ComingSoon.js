import PropTypes from 'prop-types';
import { Box, Typography, Container, Button, Stack, Paper, Grid, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Iconify from './iconify';

// ----------------------------------------------------------------------

export default function ComingSoon({ title, subtitle }) {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 2, md: 4 },
          minHeight: { xs: 'auto', md: '60vh' },
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Main Content */}
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center" sx={{ flex: 1 }}>
          {/* Left Side - Text Content */}
          <Grid item xs={12} md={6}>
            <Stack spacing={{ xs: 3, md: 4 }}>
              <Box>
                <Typography 
                  variant={isMobile ? "h3" : "h2"} 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold',
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  {title || 'Coming Soon'}
                </Typography>
                <Typography 
                  variant={isMobile ? "h6" : "h5"} 
                  color="text.secondary" 
                  paragraph
                  sx={{ display:{xs:'none', md:'block'}, textAlign: { xs: 'center', md: 'left' } }}
                >
                  {subtitle || "This feature is under development, will be available soon"}
                </Typography>
              </Box>

              <Paper 
                elevation={0}
                sx={{ 
                  p: { xs: 2, md: 3 },
                  bgcolor: 'background.neutral',
                  borderRadius: 2,
                }}
              >
                <Stack spacing={{ xs: 2, md: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'primary.lighter',
                      color: 'primary.main'
                    }}>
                      <Iconify icon="eva:code-fill" width={isMobile ? 20 : 24} />
                    </Box>
                    <Box>
                      <Typography 
                        variant={isMobile ? "subtitle2" : "subtitle1"} 
                        fontWeight="bold"
                      >
                        Development in Progress
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        color="text.secondary"
                      >
                        Our team is actively coding and implementing features
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'success.lighter',
                      color: 'success.main'
                    }}>
                      <Iconify icon="eva:checkmark-circle-2-fill" width={isMobile ? 20 : 24} />
                    </Box>
                    <Box>
                      <Typography 
                        variant={isMobile ? "subtitle2" : "subtitle1"} 
                        fontWeight="bold"
                      >
                        Quality Testing
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        color="text.secondary"
                      >
                        Ensuring everything works perfectly
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1, 
                      bgcolor: 'warning.lighter',
                      color: 'warning.main'
                    }}>
                      <Iconify icon="eva:shield-fill" width={isMobile ? 20 : 24} />
                    </Box>
                    <Box>
                      <Typography 
                        variant={isMobile ? "subtitle2" : "subtitle1"} 
                        fontWeight="bold"
                      >
                        Security First
                      </Typography>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        color="text.secondary"
                      >
                        Implementing robust security measures
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              </Paper>

              <Box sx={{ 
                p: { xs: 1.5, md: 2 }, 
                borderRadius: 2,
                bgcolor: 'background.neutral',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}>
                <Iconify icon="eva:clock-outline" width={isMobile ? 20 : 24} />
                <Box>
                  <Typography 
                    variant={isMobile ? "subtitle2" : "subtitle1"} 
                    fontWeight="bold"
                  >
                    Estimated Release
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                  >
                    We'll notify you when it's ready
                  </Typography>
                </Box>
              </Box>

              {/* Navigation Buttons - Moved to bottom */}
              <Stack 
                direction="row" 
                spacing={2} 
                sx={{ 
                  justifyContent: 'center',
                  mt: { xs: 2, md: 3 }
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:arrow-back-fill" />}
                  onClick={() => navigate(-1)}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'background.paper',
                      
                      boxShadow: (theme) => theme.customShadows?.z8,
                    },
                    px: 3,
                    borderRadius: 2,
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Iconify icon="eva:home-fill" />}
                  onClick={() => navigate('/')}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'text.primary',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      color: 'primary.contrastText',
                      boxShadow: (theme) => theme.customShadows?.z8,
                    },
                    px: 3,
                    borderRadius: 2,
                  }}
                >
                  Home
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Right Side - Image */}
          <Grid item xs={12} md={6}>
            <Box
              component="img"
              alt="coming soon"
              src="/assets/illustrations/DEVELOPMENT.png"
              sx={{
                width: '100%',
                maxWidth: { xs: 300, md: 500 },
                height: 'auto',
                mx: 'auto',
                display: 'block',
                mt: { xs: 2, md: 0 }
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

ComingSoon.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
}; 