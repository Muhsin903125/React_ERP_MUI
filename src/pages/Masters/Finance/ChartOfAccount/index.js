import { Helmet } from 'react-helmet-async';
import React, { useEffect, useState, useMemo } from 'react';

// @mui
import {
    Stack,
    Button,
    Typography,
    IconButton,
    Tooltip,
    Box,
    Container,
    CircularProgress,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    useTheme,
    alpha,
    Chip,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    useMediaQuery,
    Fade,
    Slide,
    Avatar,
    LinearProgress,
    TextField,
    InputAdornment,
    Card,
    CardContent,
    Badge
} from '@mui/material';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BusinessIcon from '@mui/icons-material/Business';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ClearIcon from '@mui/icons-material/Clear';
import FilterListIcon from '@mui/icons-material/FilterList';

import { GetSingleListResult, GetSingleResult } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import Confirm from '../../../../components/Confirm';
import ModalForm from './ModalForm';
import { formatDateCustom } from '../../../../utils/formatDate';

const formatBalanceValue = (value) => { 
    if (value === 0 || value === null || value === undefined) return '';

    const absValue = Math.abs(value)?.toFixed(2);
    return value < 0 ? `${absValue} CR` : `${absValue} DR`;
  };

export default function ChartOfAccount() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showToast } = useToast();
    
    const [data, setData] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [filteredTreeData, setFilteredTreeData] = useState([]);    const [expandedNodes, setExpandedNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [editData, setEditData] = useState(null);
    const [rawAccountData, setRawAccountData] = useState(null);
    const [accDetails, setAccDetails] = useState(null);
    const [isDelete, setIsDelete] = useState(false);
    const [accName, setAccName] = useState(null);
    const [loader, setLoader] = useState(true);
    const [showModal, SetShowModal] = useState(false);
    const [accId, setAccId] = useState(null);
    const [accCredit, setAccCredit] = useState(0.00);
    const [showLedger, setShowLedger] = useState(false);
    const [ledgerData, setLedgerData] = useState([]);
    const [ledgerLoading, setLedgerLoading] = useState(false);    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // 'all', 'groups', 'accounts'

    useEffect(() => {
        fetchList();
    }, []);

    // Filter and search functionality
    useEffect(() => {
        if (!searchTerm && filterType === 'all') {
            setFilteredTreeData(treeData);
            return;
        }

        const filterNodes = (nodes) => {
            return nodes.filter(node => {
                // Filter by type
                const typeMatch = filterType === 'all' || 
                    (filterType === 'groups' && node.isGroup) ||
                    (filterType === 'accounts' && !node.isGroup);

                // Filter by search term
                const searchMatch = !searchTerm || 
                    node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    node.code.toLowerCase().includes(searchTerm.toLowerCase());

                // Check if any children match (recursive)
                const hasMatchingChildren = node.children && node.children.length > 0 && 
                    filterNodes(node.children).length > 0;

                return (typeMatch && searchMatch) || hasMatchingChildren;
            }).map(node => ({
                ...node,
                children: node.children ? filterNodes(node.children) : []
            }));
        };

        setFilteredTreeData(filterNodes(treeData));
    }, [searchTerm, filterType, treeData]);

    // Auto-expand nodes when searching
    useEffect(() => {
        if (searchTerm) {
            const expandAllNodes = (nodes) => {
                const nodeIds = [];
                nodes.forEach(node => {
                    if (node.children && node.children.length > 0) {
                        nodeIds.push(node.id);
                        nodeIds.push(...expandAllNodes(node.children));
                    }
                });
                return nodeIds;
            };
            setExpandedNodes(expandAllNodes(filteredTreeData));
        }
    }, [searchTerm, filteredTreeData]);async function fetchList() {
        setLoader(true);
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "COA_CRUD",
                "TYPE": "GET_TREE",
            });
            if (Success) {
                setData(Data);
                setTreeData(buildTreeStructure(Data));
            } else {
                showToast(Message, "error");
            }
        } finally {
            setLoader(false);
        }
    }    // Build hierarchical tree structure
    const buildTreeStructure = (data) => {
        const nodeMap = {};
        const rootNodes = [];

        // Create node map with the new API response structure
        data.forEach(item => {
            nodeMap[item.id] = {
                id: item.id,
                name: item.label,
                code: item.id,
                parent: item.ACMAIN_PARENT === "0" ? null : item.ACMAIN_PARENT,
                isGroup: item.ACMAIN_ACTYPE_DOCNO === "GH",
                accountNo: item.id, // Using id as account number for now
                balance: item.ACMAIN_DEFAULT_BALANCE_SIGN,
                credit: 0, // Default value as not provided in API
                tax: null, // Default value as not provided in API
                remarks: null, // Default value as not provided in API
                isDeletable: 1, // Default value as not provided in API
                IsAllowToCreateGH: item.isAllowToCreateGH || false,
                IsAllowToCreateGL: true, // Default value
                balanceSheetAccount: item.ACMAIN_BALANCE_SHEET_ACCOUNT,
                srno: item.ACMAIN_SRNO,
                children: []
            };
        });

        // Build tree structure
        Object.values(nodeMap).forEach(node => {
            if (node.parent && nodeMap[node.parent]) {
                nodeMap[node.parent].children.push(node);
            } else {
                rootNodes.push(node);
            }
        });

        // Sort root nodes by serial number if available
        rootNodes.sort((a, b) => {
            if (a.srno && b.srno) {
                return a.srno - b.srno;
            }
            return a.name.localeCompare(b.name);
        });

        // Sort children recursively
        const sortChildren = (nodes) => {
            nodes.forEach(node => {
                if (node.children.length > 0) {
                    node.children.sort((a, b) => {
                        if (a.srno && b.srno) {
                            return a.srno - b.srno;
                        }
                        return a.name.localeCompare(b.name);
                    });
                    sortChildren(node.children);
                }
            });
        };

        sortChildren(rootNodes);
        return rootNodes;
    };

    const handleNodeToggle = (nodeId) => {
        setExpandedNodes(prev => 
            prev.includes(nodeId) 
                ? prev.filter(id => id !== nodeId)
                : [...prev, nodeId]
        );
    };    const getAccountDetails = async (id) => {
        try {
            const { Success, Data, Message } = await GetSingleResult({
                "key": "COA_CRUD",
                "TYPE": "GET_DETAILS",
                "ACMAIN_CODE": id
            });
            
            if (Success && Data) {
                // Store raw API data for editing
                setRawAccountData(Data);
                
                // Map API response to expected structure for display
                const mappedDetails = {
                    id: Data.ACMAIN_CODE,
                    name: Data.ACMAIN_DESC,
                    code: Data.ACMAIN_CODE,
                    parent: Data.ACMAIN_PARENT === "0" ? null : Data.ACMAIN_PARENT,
                    isGroup: Data.ACMAIN_ACTYPE_DOCNO === "GH",
                    balance: Data.ACMAIN_DEFAULT_BALANCE_SIGN,
                    balanceSheetAccount: Data.ACMAIN_BALANCE_SHEET_ACCOUNT,
                    isDeletable: Data.isDeletable,
                    credit: Data.Credit || 0,
                    tax: Data.ACMST_TAX_TREATMENT_CODE,
                    remarks: Data.ACMST_REMARKS,
                    accountNo: Data.ACMST_ACCNO || Data.ACMAIN_ACCNO,
                    IsAllowToCreateGH: Data.IsAllowToCreateGH || false,
                    IsAllowToCreateGL: Data.IsAllowToCreateGL || false,
                    srno: Data.ACMAIN_SRNO,
                    createdBy: Data.ACMAIN_CREATED_BY,
                    createdDate: Data.ACMAIN_CREATED_TS
                };
                  
                setAccDetails(mappedDetails);
                setIsDelete(Data.isDeletable === 1 || Data.isDeletable === true);
                setAccCredit(Data.Credit || 0);
            } else {
                showToast(Message || "Failed to fetch account details", "error");
            }
        } catch (error) {
            console.error("Error fetching account details:", error);
            showToast("Error fetching account details", "error");
        }
    };    const handleNodeSelect = async (node) => {
        setSelectedNode(node.id);
        setAccName(node.name);
        setAccId(node.id);
        
        // Reset raw account data when selecting a new node
        setRawAccountData(null);
        
        // Get detailed account information from API
        await getAccountDetails(node.id);
    };

    const handleDelete = async (id) => {
        Confirm('Are you sure to Delete?').then(async () => {
            try {
                setLoader(true);
                const { Success, Message } = await GetSingleResult({
                    "key": "COA_CRUD",
                    "TYPE": "DELETE",
                    "ACMAIN_CODE": id
                });                if (Success) {
                    fetchList();
                    setSelectedNode(null);
                    setAccDetails(null);
                    setRawAccountData(null);
                    setAccName(null);
                    showToast("Account deleted !", 'success');
                } else {
                    showToast(Message, "error");
                }
            } finally {
                setLoader(false);
            }
        });
    };    function closeModal() {
        SetShowModal(false);
        setEditData(null);
        setRawAccountData(null);
        fetchList();
    }

    function handleEdit() {
        SetShowModal(true);
        setEditData(rawAccountData); // Use raw API data for editing
    }

    function handleNew() {
        SetShowModal(true);
        setEditData(null);
    }

    const handleViewLedger = async (accountId) => {
        setShowLedger(true);
        setLedgerLoading(true);
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "COA_CRUD",
                "TYPE": "GET_LEDGER",
                "ACMAIN_CODE": accountId
            });
            if (Success) {
                setLedgerData(Data || []);
            } else {
                showToast(Message, "error");
            }
        } catch (error) {
            showToast("Error fetching ledger data", "error");
        } finally {
            setLedgerLoading(false);
        }
    };    const renderTreeNode = (node, level = 0) => {
        const isExpanded = expandedNodes.includes(node.id);
        const isSelected = selectedNode === node.id;
        const hasChildren = node.children && node.children.length > 0;
        
        return (
            <Box key={node.id}>                <ListItem
                    button
                    onClick={() => handleNodeSelect(node)}
                    sx={{
                        pl: 0.5 + (level * 1.5),
                        py: 0.25,
                        borderRadius: 1,
                        mb: 0.0625,
                        backgroundColor: isSelected ? alpha(theme.palette.primary.main, 0.12) : 'transparent',
                        '&:hover': {
                            backgroundColor: isSelected 
                                ? alpha(theme.palette.primary.main, 0.16)
                                : alpha(theme.palette.primary.main, 0.04),
                            transform: 'translateX(2px)',
                            transition: 'all 0.2s ease-in-out',
                        },
                        border: isSelected ? `1px solid ${theme.palette.primary.main}` : '1px solid transparent',
                        transition: 'all 0.2s ease-in-out',
                        position: 'relative',
                        minHeight: 28,
                        '&::before': isSelected ? {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: 2,
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: '0 1px 1px 0'
                        } : {}
                    }}
                >                    <ListItemIcon sx={{ minWidth: 20, mr: 0.75 }}>                        {hasChildren && (
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleNodeToggle(node.id);
                                }}
                                sx={{ 
                                    mr: 1, 
                                    p: 0.0625,
                                    width: 12,
                                    height: 12,
                                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.12),
                                        transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                {isExpanded ? (
                                    <ExpandMoreIcon sx={{ color: theme.palette.primary.main, fontSize: '1.4rem', m:1}} />
                                ) : (
                                    <ChevronRightIcon sx={{ color: theme.palette.primary.main, fontSize: '1.4rem', m:1}} />
                                )}
                            </IconButton>
                        )}                        {node.isGroup ? (
                            <Avatar
                                sx={{
                                    width: 23,
                                    height: 23,
                                    background: `linear-gradient(135deg, ${
                                        isExpanded ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.8)
                                    } 0%, ${
                                        isExpanded ? theme.palette.primary.dark : theme.palette.primary.main
                                    } 100%)`,
                                    boxShadow: theme.shadows[1],
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {isExpanded ? <FolderOpenIcon sx={{ fontSize: '1rem' }} /> : <FolderIcon sx={{ fontSize: '1rem' }} />}
                            </Avatar>
                        ) : (
                            <Avatar
                                sx={{
                                    width: 23,
                                    height: 23,
                                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                    boxShadow: theme.shadows[1],
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <AccountCircleIcon sx={{ fontSize: '1rem' }} />
                            </Avatar>
                        )}
                    </ListItemIcon><ListItemText
                        primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flex: 1 }}>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: node.isGroup ? 600 : 500,
                                        fontSize: node.isGroup ? '0.7rem' : '0.65rem',
                                        flex: 1,
                                        color: isSelected ? theme.palette.primary.main : 'inherit',
                                        lineHeight: 1.2
                                    }}
                                >
                                    {node.name}
                                </Typography>
                                <Chip
                                    label={node.isGroup ? "Group" : "Account"}
                                    size="small"
                                    color={node.isGroup ? "primary" : "success"}
                                    variant={isSelected ? "filled" : "outlined"}
                                    sx={{ 
                                        fontSize: '0.55rem', 
                                        height: 14,
                                        fontWeight: 600,
                                        transition: 'all 0.2s ease',
                                        '& .MuiChip-label': { px: 0.5 }
                                    }}
                                />
                            </Box>
                        }                        secondary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.0625 }}>
                                <Box component="span" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                    Code: {node.code}
                                </Box>
                                {node.isGroup && (
                                    <>
                                        <Box component="span" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>•</Box>
                                        <Box component="span" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>
                                            {node.children?.length || 0} item(s)
                                        </Box>
                                    </>
                                )}
                                {node.balanceSheetAccount === 1 && (
                                    <>
                                        <Box component="span" sx={{ fontSize: '0.6rem', color: 'text.secondary' }}>•</Box>
                                        <Chip
                                            label="Balance Sheet"
                                            size="small"
                                            variant="outlined"
                                            sx={{ 
                                                fontSize: '0.5rem', 
                                                height: 12,
                                                color: theme.palette.info.main,
                                                borderColor: theme.palette.info.main,
                                                '& .MuiChip-label': { px: 0.375 }
                                            }}
                                        />
                                    </>
                                )}
                            </Box>
                        }
                    /></ListItem>

                {/* Child nodes */}
                {hasChildren && (
                    <Collapse in={isExpanded}>
                        <Box>
                            {node.children.map(child => renderTreeNode(child, level + 1))}
                        </Box>
                    </Collapse>
                )}
            </Box>
        );
    };

    if (showLedger) {
        return (
            <>
                <Helmet>
                    <title>Chart of Account - Ledger</title>
                </Helmet>
                  <Container maxWidth="xl">
                    <Box sx={{ py: 1.5 }}>
                        {/* Compact Ledger Header */}
                        <Paper
                            elevation={2}
                            sx={{
                                background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                                color: 'white',
                                p: 1.5,
                                mb: 1.5,
                                borderRadius: 2
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            backgroundColor: alpha('#fff', 0.2),
                                        }}
                                    >
                                        <TrendingUpIcon fontSize="medium" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25, fontSize: '1.1rem' }}>
                                            Account Ledger
                                        </Typography>
                                        <Typography variant="body2" sx={{ opacity: 0.9, fontSize: '0.875rem' }}>
                                            {accName} - Transaction History
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<ArrowBackIcon />}
                                    onClick={() => setShowLedger(false)}
                                    sx={{
                                        backgroundColor: alpha('#fff', 0.2),
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: alpha('#fff', 0.3),
                                        },
                                        borderRadius: 1.5,
                                        px: 2,
                                        py: 0.5,
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    Back to Accounts
                                </Button>
                            </Box>
                        </Paper>

                        {/* Compact Ledger Table */}
                        <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                            <TableContainer sx={{ maxHeight: 'calc(100vh - 220px)' }}>
                                <Table sx={{ minWidth: 650 }} size="small">
                                    <TableHead>
                                        <TableRow sx={{ 
                                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                            height: 40
                                        }}>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>Date</TableCell>
                                            <TableCell sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>Description</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>Debit</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>Credit</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 600, fontSize: '0.875rem', py: 1 }}>Balance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ledgerLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                                    <CircularProgress size={32} />
                                                    <Typography variant="body2" sx={{ mt: 1.5, fontSize: '0.875rem' }}>
                                                        Loading ledger data...
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        ) : ledgerData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                                    <Box>
                                                        <AccountBalanceIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1.5 }} />
                                                        <Typography variant="subtitle1" color="text.secondary" sx={{ fontSize: '1rem' }}>
                                                            No ledger entries found
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                                            This account has no transaction history yet
                                                        </Typography>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            ledgerData.map((row, index) => (
                                                <TableRow 
                                                    key={index}
                                                    sx={{
                                                        height: 36,
                                                        '&:hover': {
                                                            backgroundColor: alpha(theme.palette.primary.main, 0.02)
                                                        }
                                                    }}
                                                >
                                                    <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                                        {formatDateCustom(row.date,"DD-MMM-YYYY")}
                                                    </TableCell>
                                                    <TableCell sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                                        {row.description}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                                        {row.debit===0 ? "" :  (row.debit)}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ py: 0.5, fontSize: '0.8rem' }}>
                                                        {row.credit===0 ? "" :  (Math.abs(row.credit))}
                                                    </TableCell>
                                                    <TableCell align="right" sx={{ fontWeight: 600, py: 0.5, fontSize: '0.8rem' }}>
                                                        {formatBalanceValue(row.balance)}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Paper>
                    </Box>
                </Container>
            </>
        );
    }

    return (
        <>
            <Helmet>
                <title>Chart of Accounts</title>
            </Helmet>
            
            <Container maxWidth="xl">
                <Box sx={{ py: 1 }}>                    {/* Compact Header */}
                    <Paper
                        elevation={1}
                        sx={{
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            color: 'white',
                            p: 1.5,
                            mb: 1.5,
                            borderRadius: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        backgroundColor: alpha('#fff', 0.2),
                                    }}
                                >
                                    <AccountTreeIcon fontSize="small" />
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0, fontSize: '1rem' }}>
                                        Chart of Accounts
                                    </Typography>
                                    <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                                        Manage your organization's account structure
                                    </Typography>
                                </Box>
                            </Box>                            
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<RefreshIcon sx={{ fontSize: '0.875rem' }} />}
                                    onClick={() => fetchList()}
                                    disabled={loader}
                                    sx={{
                                        backgroundColor: alpha('#fff', 0.1),
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: alpha('#fff', 0.2),
                                        },
                                        borderRadius: 1.5,
                                        fontSize: '0.75rem',
                                        px: 1.5,
                                        py: 0.5,
                                        minHeight: 28
                                    }}
                                >
                                    Refresh
                                </Button>
                                <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
                                    onClick={() => handleNew()}
                                    sx={{
                                        backgroundColor: alpha('#fff', 0.2),
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: alpha('#fff', 0.3),
                                        },
                                        borderRadius: 1.5,
                                        px: 1.5,
                                        py: 0.5,
                                        fontSize: '0.75rem',
                                        minHeight: 28
                                    }}
                                >
                                    Add Account
                                </Button>
                            </Box>
                        </Box>
                        {loader && <LinearProgress sx={{ mt: 1.5, borderRadius: 1 }} />}
                    </Paper>

                    {/* Main Content */}
                    <Grid container spacing={3}>
                        {/* Enhanced Tree View */}
                        <Grid item xs={12} lg={8}>                            <Paper
                                elevation={3}
                                sx={{
                                    height: 'calc(100vh - 280px)',
                                    borderRadius: 2.5,
                                    overflow: 'hidden',
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                {/* Tree Header with Search and Filters */}
                                <Box
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 600, fontSize: '0.875rem' }}>
                                            <FolderIcon color="primary" sx={{ fontSize: '1rem' }} />
                                            Account Hierarchy
                                        </Typography>
                                        <Chip 
                                            label={`${filteredTreeData.length} Root Account(s)`}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 20, '& .MuiChip-label': { px: 1 } }}
                                        />
                                    </Box>                                    {/* Search and Filter Controls */}
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        <TextField
                                            size="small"
                                            placeholder="Search accounts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <SearchIcon sx={{ fontSize: '0.875rem' }} />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: searchTerm && (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => setSearchTerm('')}
                                                            sx={{ p: 0.25 }}
                                                        >
                                                            <ClearIcon sx={{ fontSize: '0.875rem' }} />
                                                        </IconButton>
                                                    </InputAdornment>
                                                )
                                            }}
                                            sx={{ 
                                                flex: 1, 
                                                minWidth: 160,
                                                backgroundColor: 'background.paper',
                                                borderRadius: 1.5,
                                                '& .MuiOutlinedInput-root': {
                                                    fontSize: '0.8rem',
                                                    height: 32
                                                },
                                                '& .MuiOutlinedInput-input': {
                                                    py: 0.75
                                                }
                                            }}
                                        />                                        <Button
                                            variant={filterType === 'all' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setFilterType('all')}
                                            sx={{ 
                                                minWidth: 48, 
                                                fontSize: '0.7rem', 
                                                px: 1, 
                                                py: 0.5,
                                                height: 28,
                                                borderRadius: 1.5
                                            }}
                                        >
                                            All
                                        </Button>
                                        <Button
                                            variant={filterType === 'groups' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setFilterType('groups')}
                                            sx={{ 
                                                minWidth: 56, 
                                                fontSize: '0.7rem', 
                                                px: 1, 
                                                py: 0.5,
                                                height: 28,
                                                borderRadius: 1.5
                                            }}
                                        >
                                            Groups
                                        </Button>
                                        <Button
                                            variant={filterType === 'accounts' ? 'contained' : 'outlined'}
                                            size="small"
                                            onClick={() => setFilterType('accounts')}
                                            sx={{ 
                                                minWidth: 64, 
                                                fontSize: '0.7rem', 
                                                px: 1, 
                                                py: 0.5,
                                                height: 28,
                                                borderRadius: 1.5
                                            }}
                                        >
                                            Accounts
                                        </Button>
                                    </Box>
                                </Box>                                {/* Tree Content */}
                                <Box sx={{ height: 'calc(100% - 100px)', overflowY: 'auto', p: 0.75 }}>
                                    {loader ? (
                                        <Box sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            justifyContent: 'center', 
                                            alignItems: 'center', 
                                            height: '50%',
                                            gap: 2
                                        }}>
                                            <CircularProgress size={40} />
                                            <Typography variant="body2" color="text.secondary">
                                                Loading account structure...
                                            </Typography>
                                        </Box>
                                    ) : filteredTreeData.length > 0 ? (                                        <List sx={{ p: 0.5, py: 0.25 }}>
                                            {filteredTreeData.map(node => renderTreeNode(node, 0))}
                                        </List>
                                    ) : searchTerm || filterType !== 'all' ? (                                        <Box sx={{ 
                                            textAlign: 'center', 
                                            color: 'text.secondary',
                                            mt: 6
                                        }}>
                                            <SearchIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.3 }} />
                                            <Typography variant="subtitle1" sx={{ mb: 0.75, fontSize: '1rem' }}>
                                                No Results Found
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                                Try adjusting your search terms or filters
                                            </Typography>
                                        </Box>
                                    ) : (                                        <Box sx={{ 
                                            textAlign: 'center', 
                                            color: 'text.secondary',
                                            mt: 6
                                        }}>
                                            <AccountTreeIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.3 }} />
                                            <Typography variant="subtitle1" sx={{ mb: 0.75, fontSize: '1rem' }}>
                                                No Accounts Found
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                                Click "Add Account" to create your first chart of account
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>

                        {/* Enhanced Account Details Panel */}
                        <Grid item xs={12} lg={4}>                            <Paper
                                elevation={3}
                                sx={{
                                    height: 'calc(100vh - 280px)',
                                    borderRadius: 2.5,
                                    overflow: 'hidden',
                                    border: `1px solid ${theme.palette.divider}`
                                }}
                            >
                                {/* Details Header */}
                                <Box
                                    sx={{
                                        p: 1.5,
                                        backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                                        borderBottom: `1px solid ${theme.palette.divider}`
                                    }}
                                >
                                    <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 0.75, fontWeight: 600, fontSize: '0.875rem' }}>
                                        <BusinessIcon color="secondary" sx={{ fontSize: '1rem' }} />
                                        Account Details
                                    </Typography>
                                </Box>

                                {/* Details Content */}
                                <Box sx={{ p: 1.5, height: 'calc(100% - 52px)', overflowY: 'auto' }}>                                    {selectedNode && accDetails ? (
                                        <Fade in timeout={300}>
                                            <div>
                                                <Stack spacing={1.5}>
                                                {/* Account Info Card */}
                                                <Card elevation={1} sx={{ borderRadius: 2 }}>
                                                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                                            <Avatar
                                                                sx={{
                                                                    width: 28,
                                                                    height: 28,
                                                                    background: accDetails.isGroup 
                                                                        ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                                                                        : `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                                                }}
                                                            >
                                                                {accDetails.isGroup ? <FolderIcon sx={{ fontSize: '0.875rem' }} /> : <AccountCircleIcon sx={{ fontSize: '0.875rem' }} />}
                                                            </Avatar>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.125, fontSize: '0.875rem' }}>
                                                                    {accDetails.name}
                                                                </Typography>
                                                                <Chip
                                                                    label={accDetails.isGroup ? "Account Group" : "Account"}
                                                                    color={accDetails.isGroup ? "primary" : "success"}
                                                                    size="small"
                                                                    variant="filled"
                                                                    sx={{ fontSize: '0.65rem', height: 18, '& .MuiChip-label': { px: 0.75 } }}
                                                                />
                                                            </Box>
                                                        </Box>                                        
                                                        <Grid container spacing={1}>                                                            <Grid item xs={12}>
                                                                <Paper
                                                                    sx={{ 
                                                                        p: 1, 
                                                                        backgroundColor: alpha(theme.palette.primary.main, 0.04),
                                                                        borderRadius: 1,
                                                                        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                            Account Code
                                                                        </Typography>
                                                                        <Typography variant="body2" color="primary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                                            {accDetails.code}
                                                                        </Typography>
                                                                    </Box>
                                                                </Paper>
                                                            </Grid>                                                            {/* Balance Type */}
                                                            <Grid item xs={12}>
                                                                <Paper
                                                                    sx={{ 
                                                                        p: 1, 
                                                                        backgroundColor: alpha(theme.palette.info.main, 0.04),
                                                                        borderRadius: 1,
                                                                        border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`
                                                                    }}
                                                                >
                                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                                            <AccountBalanceIcon sx={{ fontSize: '0.875rem', color: 'info.main' }} />
                                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                                Default Balance
                                                                            </Typography>
                                                                        </Box>
                                                                        <Typography variant="body2" color="info.main" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                                            {accDetails.balance === 1 ? 'Debit' : 'Credit'}
                                                                        </Typography>
                                                                    </Box>
                                                                </Paper>
                                                            </Grid>                                                            {/* Account Type */}
                                                            {accDetails.balanceSheetAccount !== undefined && (
                                                                <Grid item xs={12}>
                                                                    <Paper
                                                                        sx={{ 
                                                                            p: 1, 
                                                                            backgroundColor: alpha(theme.palette.secondary.main, 0.04),
                                                                            borderRadius: 1,
                                                                            border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                                                <BusinessIcon sx={{ fontSize: '0.875rem', color: 'secondary.main' }} />
                                                                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                                    Account Type
                                                                                </Typography>
                                                                            </Box>
                                                                            <Typography variant="body2" color="secondary.main" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                                                {accDetails.balanceSheetAccount === 1 ? 'Balance Sheet' : 'Income Statement'}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Paper>                                                                </Grid>
                                                            )}                                                            {/* Account Number */}
                                                            {accDetails.accountNo && (
                                                                <Grid item xs={12}>
                                                                    <Paper
                                                                        sx={{ 
                                                                            p: 1, 
                                                                            backgroundColor: alpha(theme.palette.warning.main, 0.04),
                                                                            borderRadius: 1,
                                                                            border: `1px solid ${alpha(theme.palette.warning.main, 0.12)}`
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                                                                Account Number
                                                                            </Typography>
                                                                            <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                                                                {accDetails.accountNo}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Paper>
                                                                </Grid>
                                                            )}                                                            {/* Remarks */}
                                                            {accDetails.remarks && (
                                                                <Grid item xs={12}>
                                                                    <Paper
                                                                        sx={{ 
                                                                            p: 1, 
                                                                            backgroundColor: alpha(theme.palette.grey[500], 0.04),
                                                                            borderRadius: 1,
                                                                            border: `1px solid ${alpha(theme.palette.grey[500], 0.12)}`
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}>
                                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', flexShrink: 0 }}>
                                                                                Remarks
                                                                            </Typography>
                                                                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.75rem', textAlign: 'right' }}>
                                                                                {accDetails.remarks}
                                                                            </Typography>
                                                                        </Box>
                                                                    </Paper>
                                                                </Grid>
                                                            )}
                                                        </Grid>
                                                    </CardContent>
                                                </Card>                                                {/* Action Buttons */}
                                                <Card elevation={1} sx={{ borderRadius: 2 }}>
                                                    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                                                        <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 600, fontSize: '0.75rem' }}>
                                                            Actions
                                                        </Typography>                                                        <Stack spacing={0.5}>
                                                            {/* Edit Button - Most Common Action */}
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                startIcon={<EditIcon sx={{ fontSize: '0.875rem' }} />}
                                                                onClick={() => handleEdit()}
                                                                sx={{ 
                                                                    borderRadius: 1.5,
                                                                    py: 0.5,
                                                                    px: 2,
                                                                    fontSize: '0.75rem',
                                                                    minHeight: 24,
                                                                    width: 'auto',
                                                                    '&:hover': {
                                                                        transform: 'translateY(-1px)',
                                                                        boxShadow: theme.shadows[3]
                                                                    },
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                            >
                                                                Edit
                                                            </Button>

                                                            {/* Add Child Group */}
                                                            {accDetails.isGroup && accDetails.IsAllowToCreateGH && (
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
                                                                    onClick={() => handleNew()}
                                                                    sx={{ 
                                                                        borderRadius: 1.5,
                                                                        py: 0.5,
                                                                        px: 2,
                                                                        fontSize: '0.75rem',
                                                                        minHeight: 24,
                                                                        width: 'auto',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-1px)',
                                                                            boxShadow: theme.shadows[1]
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    Add Child
                                                                </Button>
                                                            )}
                                                            
                                                            {/* Add Account */}
                                                            {accDetails.IsAllowToCreateGL && (
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<AddIcon sx={{ fontSize: '0.875rem' }} />}
                                                                    onClick={() => handleNew()}
                                                                    sx={{ 
                                                                        borderRadius: 1.5,
                                                                        py: 0.5,
                                                                        px: 2,
                                                                        fontSize: '0.75rem',
                                                                        minHeight: 24,
                                                                        width: 'auto',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-1px)',
                                                                            boxShadow: theme.shadows[1]
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    Add Account
                                                                </Button>
                                                            )}

                                                            {/* View Ledger - Only for accounts */}
                                                            {!accDetails.isGroup && (
                                                                <Button
                                                                    variant="outlined"
                                                                    color="info"
                                                                    size="small"
                                                                    startIcon={<VisibilityIcon sx={{ fontSize: '0.875rem' }} />}
                                                                    onClick={() => handleViewLedger(accId)}
                                                                    sx={{ 
                                                                        borderRadius: 1.5,
                                                                        py: 0.5,
                                                                        px: 2,
                                                                        fontSize: '0.75rem',
                                                                        minHeight: 24,
                                                                        width: 'auto',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-1px)',
                                                                            boxShadow: theme.shadows[1]
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    View Ledger
                                                                </Button>
                                                            )}
                                                            
                                                            {/* Delete Button - Last */}
                                                            {isDelete && (
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    size="small"
                                                                    startIcon={<DeleteIcon sx={{ fontSize: '0.875rem' }} />}
                                                                    onClick={() => handleDelete(accId)}
                                                                    sx={{ 
                                                                        borderRadius: 1.5,
                                                                        py: 0.5,
                                                                        px: 2,
                                                                        fontSize: '0.75rem',
                                                                        minHeight: 24,
                                                                        width: 'auto',
                                                                        '&:hover': {
                                                                            transform: 'translateY(-1px)',
                                                                            boxShadow: theme.shadows[1]
                                                                        },
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button>
                                                            )}
                                                        </Stack>
                                                    </CardContent>
                                                </Card>
                                            </Stack>
                                            </div>
                                        </Fade>
                                    ) : (                                        <Box sx={{ 
                                            textAlign: 'center', 
                                            color: 'text.secondary',
                                            mt: 6
                                        }}>
                                            <AccountTreeIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.3 }} />
                                            <Typography variant="subtitle1" sx={{ mb: 0.75, fontSize: '1rem' }}>
                                                Select an Account
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                                                Click on any account in the tree to view details and available actions
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>

                    {/* Modal Form */}
                    <ModalForm 
                        open={showModal} 
                        initialValues={editData} 
                        parentId={accDetails?.isGroup === false ? accDetails?.parent : accId}
                        onClose={() => closeModal()}
                        IsAllowToCreateGH={accDetails?.IsAllowToCreateGH}
                        IsAllowToCreateGL={accDetails?.IsAllowToCreateGL}
                        grpCode={!accDetails?.IsAllowToCreateGH ? "GL" : (accDetails?.isGroup ? "GH" : "GL")}
                    />
                </Box>
            </Container>
        </>
    );
}
