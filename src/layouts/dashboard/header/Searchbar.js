import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { styled, alpha } from '@mui/material/styles';
import { 
  Box,
  TextField,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Popper,
  ClickAwayListener,
  InputAdornment,
  Typography,
  Chip,
  useTheme,
  IconButton,
  Slide
} from '@mui/material';
import { 
  Search, 
  Clear, 
  History,
  TrendingUp,
  KeyboardArrowRight,
  Close
} from '@mui/icons-material';
// utils
import { bgBlur } from '../../../utils/cssStyles';
// components
import Iconify from '../../../components/iconify';
// config
import navConfig from '../nav/config';

// ----------------------------------------------------------------------

const HEADER_MOBILE = 64;
const HEADER_DESKTOP = 92;

const StyledSearchbar = styled('div')(({ theme }) => ({
  ...bgBlur({ color: theme.palette.background.default }),
  top: 0,
  left: 0,
  zIndex: 99,
  width: '100%',
  display: 'flex',
  position: 'absolute',
  alignItems: 'center',
  height: HEADER_MOBILE,
  padding: theme.spacing(0, 3),
  boxShadow: theme.customShadows.z8,
  [theme.breakpoints.up('md')]: {
    height: HEADER_DESKTOP,
    padding: theme.spacing(0, 5),
  },
}));

const StyledSearchInput = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    backgroundColor: alpha(theme.palette.background.neutral, 0.3),
    border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: alpha(theme.palette.background.neutral, 0.5),
      borderColor: alpha(theme.palette.primary.main, 0.3),
    },
    
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.1)}`,
    },
    
    '& fieldset': {
      border: 'none',
    },
  },
}));

// ----------------------------------------------------------------------

export default function Searchbar() {
  const theme = useTheme();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('headerSearchRecent');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Error loading recent searches:', error);
      return [];
    }
  });

  const isSearchOpen = Boolean(anchorEl) && (searchTerm || recentSearches.length > 0);

  // Flatten navigation data for searching
  const flattenNavData = (items, parentPath = '') => {
    let flattened = [];
    
    items.forEach(item => {
      if (item.path && item.visible !== false) {
        flattened.push({
          ...item,
          fullPath: parentPath ? `${parentPath} > ${item.title}` : item.title,
          level: parentPath.split(' > ').length - 1,
        });
      }
      
      if (item.childern) {
        const childPath = parentPath ? `${parentPath} > ${item.title}` : item.title;
        flattened = [...flattened, ...flattenNavData(item.childern, childPath)];
      }
    });
    
    return flattened;
  };

  const flatData = flattenNavData(navConfig);

  // Search functionality
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = flatData.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullPath.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filtered.slice(0, 8)); // Limit results
  }, [searchTerm]);

  const handleOpen = () => {
    setOpen(true);
    // Focus the search input after the slide animation
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 300);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchTerm('');
    setSearchResults([]);
    setAnchorEl(null);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (value && !anchorEl) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleSearchFocus = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleItemSelect = (item) => {
    navigate(item.path);
    setSearchTerm('');
    setAnchorEl(null);
    setOpen(false);
    
    // Add to recent searches
    const newRecentSearches = [
      item,
      ...recentSearches.filter(recent => recent.path !== item.path)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('headerSearchRecent', JSON.stringify(newRecentSearches));
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleClickAway = () => {
    setAnchorEl(null);
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <div>
        {!open && (
          <IconButton 
            onClick={handleOpen}
            sx={{
              color: 'text.primary',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                color: 'primary.main',
              },
            }}
          >
            <Iconify icon="eva:search-fill" />
          </IconButton>
        )}

        <Slide direction="down" in={open} mountOnEnter unmountOnExit>
          <StyledSearchbar>
            <ClickAwayListener onClickAway={handleClickAway}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 600 }}>
                <StyledSearchInput
                  ref={searchInputRef}
                  fullWidth
                  size="medium"
                  placeholder="Search navigation menu..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              color: 'error.main',
                            },
                          }}
                        >
                          <Clear sx={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Popper
                  open={isSearchOpen}
                  anchorEl={anchorEl}
                  placement="bottom-start"
                  sx={{ 
                    zIndex: 1400, 
                    width: anchorEl?.offsetWidth || 600,
                  }}
                >
                  <Paper
                    elevation={16}
                    sx={{
                      mt: 1,
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                      maxHeight: 400,
                      overflowY: 'auto',
                      background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.neutral, 0.3)})`,
                      backdropFilter: 'blur(12px)',
                    }}
                  >
                    {searchTerm ? (
                      // Search results
                      searchResults.length > 0 ? (
                        <List disablePadding>
                          <Box sx={{ p: 1.5, pb: 0.5 }}>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: 'text.secondary',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              Search Results ({searchResults.length})
                            </Typography>
                          </Box>
                          {searchResults.map((item, index) => (
                            <ListItem
                              key={`${item.path}-${index}`}
                              button
                              onClick={() => handleItemSelect(item)}
                              sx={{
                                py: 1.5,
                                mx: 1,
                                mb: 0.5,
                                borderRadius: 2,
                                transition: 'all 0.2s ease',
                                
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                                  transform: 'translateX(4px)',
                                },
                              }}
                            >
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Box sx={{ 
                                  color: theme.palette.primary.main,
                                  display: 'flex',
                                  alignItems: 'center',
                                }}>
                                  {item.icon}
                                </Box>
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                secondary={item.fullPath}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  fontWeight: 600,
                                }}
                                secondaryTypographyProps={{
                                  variant: 'caption',
                                  color: 'text.secondary',
                                  sx: { opacity: 0.8 },
                                }}
                              />
                              <KeyboardArrowRight 
                                sx={{ 
                                  fontSize: 18, 
                                  color: 'text.secondary',
                                  opacity: 0.5,
                                }} 
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <TrendingUp sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                          <Typography variant="body2" color="text.secondary">
                            No results found for "{searchTerm}"
                          </Typography>
                          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: 'block' }}>
                            Try a different search term
                          </Typography>
                        </Box>
                      )
                    ) : (
                      // Recent searches
                      recentSearches.length > 0 && (
                        <Box>
                          <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                              <History sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontWeight: 600,
                                  textTransform: 'uppercase',
                                  letterSpacing: 0.5,
                                }}
                              >
                                Recent Searches
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
                              {recentSearches.map((item, index) => (
                                <Chip
                                  key={`recent-${item.path}-${index}`}
                                  label={item.title}
                                  size="small"
                                  onClick={() => handleItemSelect(item)}
                                  sx={{
                                    fontSize: 11,
                                    height: 24,
                                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                                    color: theme.palette.primary.main,
                                    border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                    transition: 'all 0.2s ease',
                                    
                                    '&:hover': {
                                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                                      transform: 'scale(1.05)',
                                    },
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        </Box>
                      )
                    )}
                  </Paper>
                </Popper>
              </Box>
            </ClickAwayListener>
            
            <IconButton 
              onClick={handleClose}
              sx={{
                ml: 2,
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                  color: 'error.main',
                },
              }}
            >
              <Close />
            </IconButton>
          </StyledSearchbar>
        </Slide>
      </div>
    </ClickAwayListener>
  );
}
