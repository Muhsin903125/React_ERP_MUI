import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Stack,
    Paper,
    useTheme,
    useMediaQuery,
    alpha,
    Fade,
} from '@mui/material';
import Iconify from './iconify';
import PageHeader from './PageHeader';

const ReportHeader = ({
    title,
    onReset,
    onSearch,
    searchDisabled,
    searchLabel,
    resetLabel,
    children
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));    const buttonStyles = {
        borderRadius: '8px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 70%)',
            transform: 'translateX(-100%)',
            transition: 'transform 0.5s',
        },
        '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: (theme) => `0 12px 24px ${alpha(theme.palette.grey[500], 0.24)}`,
            '&::after': {
                transform: 'translateX(100%)',
            },
        }
    };    return (
        <Fade in timeout={600}>
            <Box>
                <PageHeader title={title} sx={{ mb: 1 }} />

                <Paper
                    elevation={1}
                    sx={{
                        p: { xs: 2, md: 3 },
                        mb: 1,
                        borderRadius: 3,
                        // background: (theme) => `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
                        backdropFilter: 'blur(8px)',
                        border: (theme) => `1px solid ${alpha(theme.palette.grey[500], 0.08)}`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: '4px',
                            background: (theme) => `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
                        },
                    }}
                >
                    {children}                    <Stack
                        direction={isMobile ? 'column' : 'row'}
                        spacing={2}
                        justifyContent="flex-end"
                        sx={{
                            mt: 1,
                            p: 1,
                            // bgcolor: theme.palette.background.neutral,
                            // borderRadius: 2,
                        }}
                    >
                        <Button
                            variant="outlined" 
                            startIcon={<Iconify icon="eva:refresh-outline" width={20} height={20} />}
                            onClick={onReset}
                            sx={{
                                ...buttonStyles,
                                width: isMobile ? '100%' : 'auto',
                                minWidth: !isMobile && 140,
                                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                color: 'primary.main',
                                '&:hover': {
                                    ...buttonStyles['&:hover'],
                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                                },
                            }}
                        >
                            {resetLabel}
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Iconify icon="eva:search-fill" width={20} height={20} />}
                            onClick={onSearch}
                            disabled={searchDisabled}
                            sx={{
                                ...buttonStyles,
                                width: isMobile ? '100%' : 'auto',
                                minWidth: !isMobile && 140,
                                background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                                '&:hover': {
                                    ...buttonStyles['&:hover'],
                                    background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                                },
                                '&:disabled': {
                                    background: (theme) => alpha(theme.palette.grey[500], 0.24),
                                    color: 'white',
                                }
                            }}
                        >
                            {searchLabel}
                        </Button>
                    </Stack>
                </Paper>
            </Box>
        </Fade>
    );
};

ReportHeader.propTypes = {
    title: PropTypes.string,
    onReset: PropTypes.func,
    onSearch: PropTypes.func,
    searchDisabled: PropTypes.bool,
    searchLabel: PropTypes.string,
    resetLabel: PropTypes.string,
    children: PropTypes.node,
};

ReportHeader.defaultProps = {
    searchDisabled: false,
    searchLabel: 'Search',
    resetLabel: 'Reset',
};

export default ReportHeader;
