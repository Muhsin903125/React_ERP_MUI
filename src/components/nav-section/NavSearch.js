import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
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
  alpha,
  useTheme,
  Divider,
  IconButton,
} from '@mui/material';
import { 
  Search, 
  Clear, 
  Whatshot, 
  History,
  TrendingUp,
  KeyboardArrowRight
} from '@mui/icons-material';

NavSearch.propTypes = {
  data: PropTypes.array,
  onItemSelect: PropTypes.func,
};

export default function NavSearch({ data = [], onItemSelect }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('navRecentSearches');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Error loading recent searches:', error);
      return [];
    }
  });

  const isOpen = Boolean(anchorEl) && (searchTerm || recentSearches.length > 0);

  // Flatten navigation data for searching
  const flattenNavData = (items, parentPath = '') => {
    let flattened = [];
    
    items.forEach(item => {
      if (item.path && item.visible) {
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

  const flatData = flattenNavData(data);

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
  }, [searchTerm, flatData]);

  // Handle search input
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (value && !anchorEl) {
      setAnchorEl(event.currentTarget);
    }
  };

  // Handle search focus
  const handleSearchFocus = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle item selection
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
    localStorage.setItem('navRecentSearches', JSON.stringify(newRecentSearches));
    
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  // Close search dropdown
  const handleClickAway = () => {
    setAnchorEl(null);
  };
  return (
    <ClickAwayListener onClickAway={handleClickAway}>
      <Box sx={{ position: 'relative' }}>
        <TextField
          ref={searchInputRef}
          fullWidth
          size="small"
          placeholder="Search navigation..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
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
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
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

        <Popper
          open={isOpen}
          anchorEl={anchorEl}
          placement="bottom-start"
          sx={{ 
            zIndex: 1300, 
            width: anchorEl?.offsetWidth,
          }}
        >
          <Paper
            elevation={12}
            sx={{
              mt: 0.5,
              borderRadius: 3,
              overflow: 'hidden',
              border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              maxHeight: 360,
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
                        borderRadius: 2,
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
                  <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5 }}>
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
                </Box>
              )
            )}
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
  );
}
