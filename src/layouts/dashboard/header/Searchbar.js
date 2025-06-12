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
  IconButton
} from '@mui/material';
import { 
  Search, 
  Clear, 
  History,
  TrendingUp,
  KeyboardArrowRight
} from '@mui/icons-material';
// config
import navConfig from '../nav/config';

// ----------------------------------------------------------------------

const NAV_WIDTH = 280;

// ----------------------------------------------------------------------

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
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('headerSearchRecent');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Error loading recent searches:', error);
      return [];
    }
  });
  const isDropdownOpen = Boolean(anchorEl) && (searchTerm || recentSearches.length > 0);

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

  const handleSearchIconClick = () => {
    setIsSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  };

  const handleClose = () => {
    setSearchTerm('');
    setSearchResults([]);
    setAnchorEl(null);
    setIsSearchOpen(false);
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
  };  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ 
        position: 'relative', 
        ml: { xs: 2, lg: `${NAV_WIDTH}px` }, // Responsive margin: 2 on mobile, NAV_WIDTH on desktop
        mr: 2, // Add right margin for balance
        display: { xs: 'none', md: 'block' }, // Hide on mobile, show on desktop
      }}>
        {!isSearchOpen ? (
          // Search Icon - Click to open search
          <IconButton
            onClick={handleSearchIconClick}
            sx={{
              p: 1,
              color: 'text.secondary',
              backgroundColor: alpha(theme.palette.background.neutral, 0.4),
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              borderRadius: 2,
              transition: 'all 0.2s ease',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
                borderColor: alpha(theme.palette.primary.main, 0.3),
                transform: 'scale(1.05)',
              },
            }}
          >
            <Search sx={{ fontSize: 20 }} />
          </IconButton>
        ) : (
          // Search Input - When search is opened
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, // Column on mobile, row on tablet+
            alignItems: { xs: 'stretch', sm: 'center' }, 
            gap: 1,
            width: '100%',
          }}>
            {/* Search Icon for mobile (shows above input) */}
            <Box sx={{ 
              display: { xs: 'flex', sm: 'none' }, 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 1,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Search Navigation
                </Typography>
              </Box>
              <IconButton
                onClick={handleClose}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                    backgroundColor: alpha(theme.palette.error.main, 0.08),
                  },
                }}
              >
                <Clear sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>

            <StyledSearchInput
              ref={searchInputRef}
              size="small"
              placeholder="Search navigation..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      sx={{
                        p: 0.5,
                        color: 'text.secondary',
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          color: 'error.main',
                        },
                      }}
                    >
                      <Clear sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                width: { xs: '100%', sm: 300, md: 400 },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.neutral, 0.4),
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  transition: 'all 0.2s ease',
                  
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.neutral, 0.6),
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
              }}
            />
            
            {/* Close Button for desktop (shows next to input) */}
            <IconButton
              onClick={handleClose}
              sx={{
                display: { xs: 'none', sm: 'flex' },
                p: 1,
                color: 'text.secondary',
                backgroundColor: alpha(theme.palette.background.neutral, 0.4),
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                borderRadius: 2,
                transition: 'all 0.2s ease',
                '&:hover': {
                  color: 'error.main',
                  backgroundColor: alpha(theme.palette.error.main, 0.08),
                  borderColor: alpha(theme.palette.error.main, 0.3),
                },
              }}
            >
              <Clear sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        )}        {/* Search Results Dropdown */}
        {isSearchOpen && (
          <Popper
            open={isDropdownOpen}
            anchorEl={anchorEl}
            placement="bottom-start"
            sx={{ 
              zIndex: 1400, 
              width: { xs: '100%', sm: 300, md: 400 },
            }}
          >
            <Paper
              elevation={12}
              sx={{
                mt: 0.5,
                borderRadius: 2,
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                maxHeight: 400,
                overflowY: 'auto',
                background: `linear-gradient(180deg, ${theme.palette.background.paper}, ${alpha(theme.palette.background.neutral, 0.3)})`,
                backdropFilter: 'blur(8px)',
              }}
            >
            {searchTerm ? (
              // Search results
              searchResults.length > 0 ? (
                <List disablePadding>
                  <Box sx={{ p: 1, pb: 0.5 }}>
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
                        mx: 0.5,
                        mb: 0.5,
                        borderRadius: 1.5,
                        transition: 'all 0.2s ease',
                        
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 32 }}>
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
                          fontSize: 16, 
                          color: 'text.secondary',
                          opacity: 0.5,
                        }} 
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <TrendingUp sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
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
                  <Box sx={{ p: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <History sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
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
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {recentSearches.map((item, index) => (
                        <Chip
                          key={`recent-${item.path}-${index}`}
                          label={item.title}
                          size="small"
                          onClick={() => handleItemSelect(item)}
                          sx={{
                            fontSize: 10,
                            height: 22,
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
                </Box>              )
            )}
          </Paper>
        </Popper>
        )}
      </Box>
    </ClickAwayListener>
  );
}
