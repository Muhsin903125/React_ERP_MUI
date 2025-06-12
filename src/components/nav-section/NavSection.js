import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
// @mui
import { 
  Box, 
  List, 
  Collapse, 
  ListItemText, 
  Chip, 
  Badge, 
  Tooltip,
  IconButton,
  alpha,
  useTheme,
  TextField,
  InputAdornment,
  Paper,
  Popper,
  ClickAwayListener,
  Typography,
  ListItem,
  ListItemIcon
} from '@mui/material';
import { 
  ExpandMore, 
  NavigateNext,
  FiberManualRecord,
  StarBorder,
  Star,
  Search,
  Clear,
  History,
  TrendingUp,
  KeyboardArrowRight
} from '@mui/icons-material';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';
import NavItem from './NavItem';

NavSection.propTypes = {
  data: PropTypes.array,
};

export default function NavSection({ data = [], ...other }) {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState({});
  
  // Mobile search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchAnchorEl, setSearchAnchorEl] = useState(null);
  const [recentMobileSearches, setRecentMobileSearches] = useState(() => {
    try {
      const saved = localStorage.getItem('navMobileSearchRecent');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Error loading mobile search recent:', error);
      return [];
    }
  });

  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('navFavorites');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn('Error loading favorites from localStorage:', error);
      return [];
    }
  });

  // Auto-expand active menu paths on load
  useEffect(() => {
    const currentPath = location.pathname;
    const expandedPaths = {};
    
    // Find and expand all parent paths of current active item
    const findAndExpandPath = (items, parentPath = '') => {
      items.forEach(item => {
        const currentMenuPath = parentPath ? `${parentPath}.${item.title}` : item.title;
        
        // If this item or any child matches current path, expand it
        if (item.path === currentPath || 
            (item.childern && item.childern.some(child => child.path === currentPath))) {
          expandedPaths[currentMenuPath] = true;
          // Expand all parent paths
          const pathParts = currentMenuPath.split('.');
          pathParts.forEach((_, index) => {
            if (index > 0) {
              const parentPathToExpand = pathParts.slice(0, index).join('.');
              expandedPaths[parentPathToExpand] = true;
            }
          });
        }
        
        // Recursively check children
        if (item.childern) {
          findAndExpandPath(item.childern, currentMenuPath);
        }
      });
    };
    
    findAndExpandPath(data);
    setOpenMenus(expandedPaths);
  }, [location.pathname, data]);
  // Save favorites to localStorage with error handling
  useEffect(() => {
    try {
      localStorage.setItem('navFavorites', JSON.stringify(favorites));
    } catch (error) {
      console.warn('Error saving favorites to localStorage:', error);
    }  }, [favorites]);

  // Mobile search functionality
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

  const flatMobileData = flattenNavData(data);

  // Mobile search effect
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const filtered = flatMobileData.filter(item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.fullPath.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setSearchResults(filtered.slice(0, 6)); // Limit results for mobile
  }, [searchTerm, flatMobileData]);

  // Mobile search handlers
  const handleMobileSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    
    if (value && !searchAnchorEl) {
      setSearchAnchorEl(event.currentTarget);
    }
  };

  const handleMobileSearchFocus = (event) => {
    setSearchAnchorEl(event.currentTarget);
  };

  const handleMobileSearchSelect = (item) => {
    navigate(item.path);
    setSearchTerm('');
    setSearchAnchorEl(null);
    
    // Add to recent searches
    const newRecentSearches = [
      item,
      ...recentMobileSearches.filter(recent => recent.path !== item.path)
    ].slice(0, 4);
    
    setRecentMobileSearches(newRecentSearches);
    localStorage.setItem('navMobileSearchRecent', JSON.stringify(newRecentSearches));
  };

  const handleMobileSearchClear = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleMobileSearchClickAway = () => {
    setSearchAnchorEl(null);
  };

  const isMobileSearchOpen = Boolean(searchAnchorEl) && (searchTerm || recentMobileSearches.length > 0);

  // Enhanced menu click handler
  const handleMenuClick = (menuPath, level) => {
    if (level === 0) {
      const newOpenMenus = {};
      newOpenMenus[menuPath] = !openMenus[menuPath];
      
      Object.keys(openMenus).forEach(key => {
        if (key.startsWith(`${menuPath}.`) && openMenus[key]) {
          newOpenMenus[key] = true;
        }
      });
      
      setOpenMenus(newOpenMenus);
    } else {
      setOpenMenus(prev => ({
        ...prev,
        [menuPath]: !prev[menuPath]
      }));
    }
  };  // Toggle favorite items with validation - using level 1 parent names
  const toggleFavorite = (item) => {
    if (!item || !item.title || !item.path) {
      console.warn('Invalid item for favorites:', item);
      return;
    }
    
    // Find the level 1 parent menu name for this item
    const findLevel1Parent = (items, targetItem, parentTitle = null, level = 0) => {
      return items.reduce((found, menuItem) => {
        if (found) return found;
        
        if (menuItem.path === targetItem.path) {
          return level === 0 ? menuItem.title : parentTitle;
        }
        
        if (menuItem.childern && Array.isArray(menuItem.childern)) {
          return findLevel1Parent(
            menuItem.childern, 
            targetItem, 
            level === 0 ? menuItem.title : parentTitle, 
            level + 1
          );
        }
        
        return null;
      }, null);
    };
    
    const level1Parent = findLevel1Parent(data, item);
    const favoriteId = `${level1Parent || item.title}-${item.path}`;
    
    setFavorites(prev => {
      const isCurrentlyFavorite = prev.includes(favoriteId);
      if (isCurrentlyFavorite) {
        return prev.filter(id => id !== favoriteId);
      }
      return [...prev, favoriteId];
    });
  };

  // Check if item is favorite - using level 1 parent names
  const isFavorite = (item) => {
    if (!item || !item.path) return false;
    
    const findLevel1Parent = (items, targetItem, parentTitle = null, level = 0) => {
      return items.reduce((found, menuItem) => {
        if (found) return found;
        
        if (menuItem.path === targetItem.path) {
          return level === 0 ? menuItem.title : parentTitle;
        }
        
        if (menuItem.childern && Array.isArray(menuItem.childern)) {
          return findLevel1Parent(
            menuItem.childern, 
            targetItem, 
            level === 0 ? menuItem.title : parentTitle, 
            level + 1
          );
        }
        
        return null;
      }, null);
    };
    
    const level1Parent = findLevel1Parent(data, item);
    const favoriteId = `${level1Parent || item.title}-${item.path}`;
    return favorites.includes(favoriteId);
  };

  // Check if current path matches item path or any child path
  const isActiveItem = (item) => {
    const currentPath = location.pathname;
    
    // Direct match
    if (item.path === currentPath) return true;
    
    // For parent items, check if any child is active
    if (item.childern) {
      return item.childern.some(child => isActiveItem(child));
    }
    
    return false;
  };
  const renderNavItem = (item, level = 0, parentPath = '') => {
    const currentPath = parentPath ? `${parentPath}.${item.title}` : item.title;
    const hasChildren = item.childern && item.childern.length > 0;
    const isOpen = openMenus[currentPath];
    const isActive = isActiveItem(item);

    // Skip items that are not visible
    if (item.visible === false) {
      return null;
    }

    if (!hasChildren) {
      return (
        <NavItem 
          key={currentPath} 
          item={item} 
          level={level} 
          isActive={isActive}
          isFavorite={isFavorite(item)}
          onToggleFavorite={() => toggleFavorite(item)}
        />
      );
    }

    return (
      <Box key={currentPath}>
        <StyledNavItem
          onClick={() => handleMenuClick(currentPath, level)}
          disableGutters
          sx={{
            pl: level * 1.5 + 0.5,
            pr: 0.5,
            mx: 0.5,
            my: 0.1,
            minHeight: 36,
            borderRadius: 1.5,
            backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
            transition: 'all 0.2s ease',
            
            '&:hover': {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: 'translateX(2px)',
            },
          }}
        >
          <StyledNavItemIcon 
            sx={{ 
              color: isActive ? theme.palette.primary.main : 'inherit',
              minWidth: 20,
              marginRight: 1,
            }}
          >
            {item.icon}
          </StyledNavItemIcon>
          
          <ListItemText 
            disableTypography 
            primary={item.title} 
            sx={{ 
              fontWeight: isActive ? 600 : 400,
              fontSize: `${14 - level * 0.5}px`,
              color: isActive ? theme.palette.primary.main : 'inherit',
            }}
          />
          
          {/* Child count badge */}
          {hasChildren && (
            <Chip
              size="small"
              label={item.childern.filter(child => child.visible !== false).length}
              sx={{
                height: 16,
                fontSize: 9,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                mx: 0.5,
              }}
            />
          )}
          
          <StyledNavItemIcon
            sx={{
              transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              minWidth: 16,
            }}
          >
            <NavigateNext fontSize="small" />
          </StyledNavItemIcon>
        </StyledNavItem>

        <Collapse in={isOpen} timeout={300}>
          <List disablePadding sx={{ py: 0.25 }}>
            {item.childern
              .filter(child => child.visible !== false)
              .map(child => renderNavItem(child, level + 1, currentPath))
            }
          </List>
        </Collapse>
      </Box>
    );
  };  return (
    <Box {...other}>
      {/* Mobile Search Section - Only visible on mobile */}
      <Box sx={{ 
        display: { xs: 'block', md: 'none' }, 
        px: 1, 
        pb: 1,
        position: 'relative',
      }}>
        <ClickAwayListener onClickAway={handleMobileSearchClickAway}>
          <Box>
            <TextField
              fullWidth
              size="small"
              placeholder="Search navigation..."
              value={searchTerm}
              onChange={handleMobileSearchChange}
              onFocus={handleMobileSearchFocus}
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
                      onClick={handleMobileSearchClear}
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

            {/* Mobile Search Results Dropdown */}
            <Popper
              open={isMobileSearchOpen}
              anchorEl={searchAnchorEl}
              placement="bottom-start"
              sx={{ 
                zIndex: 1300, 
                width: '100%',
              }}
            >
              <Paper
                elevation={8}
                sx={{
                  mt: 0.5,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
                  maxHeight: 300,
                  overflowY: 'auto',
                  background: theme.palette.background.paper,
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
                          Results ({searchResults.length})
                        </Typography>
                      </Box>
                      {searchResults.map((item, index) => (
                        <ListItem
                          key={`mobile-${item.path}-${index}`}
                          button
                          onClick={() => handleMobileSearchSelect(item)}
                          sx={{
                            py: 1,
                            mx: 0.5,
                            mb: 0.5,
                            borderRadius: 1.5,
                            transition: 'all 0.2s ease',
                            
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.08),
                              transform: 'translateX(2px)',
                            },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 28 }}>
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
                              fontWeight: 500,
                            }}
                            secondaryTypographyProps={{
                              variant: 'caption',
                              color: 'text.secondary',
                              sx: { opacity: 0.8 },
                            }}
                          />
                          <KeyboardArrowRight 
                            sx={{ 
                              fontSize: 14, 
                              color: 'text.secondary',
                              opacity: 0.5,
                            }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 24, color: 'text.disabled', mb: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        No results found
                      </Typography>
                    </Box>
                  )
                ) : (
                  // Recent searches
                  recentMobileSearches.length > 0 && (
                    <Box sx={{ p: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, px: 0.5 }}>
                        <History sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                          }}
                        >
                          Recent
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {recentMobileSearches.map((item, index) => (
                          <Chip
                            key={`mobile-recent-${item.path}-${index}`}
                            label={item.title}
                            size="small"
                            onClick={() => handleMobileSearchSelect(item)}
                            sx={{
                              fontSize: 9,
                              height: 20,
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
                  )
                )}
              </Paper>
            </Popper>
          </Box>
        </ClickAwayListener>
      </Box>

      <List 
        disablePadding 
        sx={{ p: 0.5 }} 
        component="nav"
        aria-label="Navigation menu"
      >
        {data
          .filter(item => item.visible !== false)
          .map(item => renderNavItem(item))
        }
      </List>
      
      {/* Compact Favorites Section */}
      {favorites.length > 0 && (
        <Box sx={{ px: 1.5, py: 0.5, mt: 1 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 0.5,
              color: theme.palette.text.secondary,
            }}
          >            <Star sx={{ fontSize: 14, mr: 0.5 }} />
            <Box sx={{ fontSize: 11, fontWeight: 600 }}>
              Favorites ({favorites.length})
            </Box>
            <Tooltip title="Clear all favorites">
              <IconButton
                size="small"
                onClick={() => setFavorites([])}
                sx={{
                  ml: 'auto',
                  p: 0.25,
                  fontSize: 10,
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    color: theme.palette.error.main,
                    backgroundColor: alpha(theme.palette.error.main, 0.1),
                  },
                }}
              >
                ×
              </IconButton>
            </Tooltip>
          </Box>          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>            {favorites.slice(0, 4).map((favoriteId, index) => {
              // Parse the favoriteId format: "level1Parent-actualPath"
              const parts = favoriteId.split('-');
              if (parts.length < 2) {
                // Remove invalid favorites
                setFavorites(prev => prev.filter(id => id !== favoriteId));
                return null;
              }
              
              const level1Parent = parts[0];
              const actualPath = parts.slice(1).join('-'); // Handle paths with dashes
                // Find the actual menu item by path
              const findItemByPath = (items, targetPath) => {
                return items.reduce((found, item) => {
                  if (found) return found;
                  
                  if (item.path === targetPath) {
                    return item;
                  }
                  
                  if (item.childern && Array.isArray(item.childern)) {
                    return findItemByPath(item.childern, targetPath);
                  }
                  
                  return null;
                }, null);
              };

              const favoriteItem = findItemByPath(data, actualPath);
              if (!favoriteItem) {
                // Remove invalid favorites
                setFavorites(prev => prev.filter(id => id !== favoriteId));
                return null;
              }
              
              return (
                <Tooltip 
                  key={favoriteId} 
                  title={`${level1Parent} → ${favoriteItem.title}`} 
                  arrow
                >
                  <Chip
                    size="small"
                    label={level1Parent.substring(0, 8)}
                    onClick={() => {
                      try {
                        navigate(favoriteItem.path);
                      } catch (error) {
                        console.error('Navigation error:', error);
                      }
                    }}
                    sx={{
                      fontSize: 9,
                      height: 20,
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: theme.palette.primary.main,
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.2),
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  />
                </Tooltip>);
            })}
            {favorites.length > 4 && (
              <Tooltip title={`${favorites.length - 4} more favorites`}>
                <Chip
                  size="small"
                  label={`+${favorites.length - 4}`}
                  sx={{
                    fontSize: 9,
                    height: 20,
                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                    color: theme.palette.text.secondary,
                  }}
                />
              </Tooltip>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}