import { useState, useEffect } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import {   useTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import MyContainer from '../components/MyContainer';

const colors = ['red', 'blue', 'green', 'yellow', 'violet', 'orange'];

const Settings = () => {
    const [themeColor, setThemeColor] = useState(localStorage.getItem("ThemeColor"));
    const theme = useTheme();

    const [isDarkMode, setIsDarkMode] = useState(false);
    useEffect(() => {
        const savedColor = localStorage.getItem('ThemeColor');
        if (savedColor) {
            setThemeColor(savedColor);
        }
        const savedMode = localStorage.getItem('ThemeMode');
        if (savedMode === 'dark') {
            setIsDarkMode(true);
        }
    }, []);

    const handleColorClick = (color) => {
        setThemeColor(color);
        localStorage.setItem('ThemeColor', color);
        window.location.reload();
    };
    const handleModeToggle = (mode) => {
        setIsDarkMode(mode);
        localStorage.setItem('ThemeMode', mode ? "dark" : "normal");
        window.location.reload();  // setIsDarkMode((prevMode) => !prevMode);
    };

    return (<>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
            <Typography variant="h4" gutterBottom>
                Settings
            </Typography>
        </Stack>
        <MyContainer style={{ display: 'flex', justifyContent: 'flex-start', alignItems: "center" }}>

            <Box sx={{ display: 'flex', justifyContent: 'left', alignContent: 'flex-center' }}>
                {/* <Typography variant="h6" p={1}>
                    Theme Color
                </Typography> */}
                <Box  >
                    {colors.map((color) => (
                        <Button
                            key={color}
                            sx={{
                                bgcolor: color,
                                width: 30,
                                height: 30,
                                margin: 1,
                                borderRadius: '50',
                                border: themeColor === color ? `4px solid  ${theme.palette.action.active}`: 'none',
                            }}
                            onClick={() => handleColorClick(color)}
                        />
                    ))}</Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'left', alignContent: 'flex-center', marginTop: 2 }}>
                <Button
                    sx={{ color: !isDarkMode ? 'white' : 'black', bgcolor: !isDarkMode ? 'black' : 'white',marginLeft: 1, marginRight: 1 }}
                    onClick={() => handleModeToggle(false)}
                    startIcon={<Brightness7Icon />}
                    variant={isDarkMode ? 'outlined' : 'contained'}
                >
                    Normal
                </Button>
                <Button
                    sx={{ color: isDarkMode ? 'white' : 'black', bgcolor: isDarkMode ? 'black' : 'white' }}
                    onClick={() => handleModeToggle(true)}
                    startIcon={<Brightness4Icon />}
                    variant={isDarkMode ? 'contained' : 'outlined'}
                >
                    Dark
                </Button>
            </Box>
        </MyContainer></>
    );
};

export default Settings;
