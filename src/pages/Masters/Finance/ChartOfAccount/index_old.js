import { Helmet } from 'react-helmet-async';
import React, { useContext, useEffect, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom';

// @mui
import {
    Stack,
    Button,
    Typography,
    IconButton,
    Tooltip,
    Box,
    Container,
    Card,
    CircularProgress,
    InputLabel,
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
    Slide
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
import Iconify from '../../../../components/iconify/Iconify';
import { deleteRole, GetRoleList, GetSingleListResult, GetSingleResult,  saveRole } from '../../../../hooks/Api';
import { useToast } from '../../../../hooks/Common';
import DataTable from '../../../../components/DataTable';
import Confirm from '../../../../components/Confirm';
import ModalForm from './ModalForm';
import TreeView from './TreeView';

export default function ChartOfAccount2() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { showToast } = useToast();
    
    const [data, setData] = useState([]);
    const [treeData, setTreeData] = useState([]);
    const [expandedNodes, setExpandedNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [editData, setEditData] = useState(null);
    const [accDetails, setAccDetails] = useState(null);
    const [isDelete, setIsDelete] = useState(false);
    const [accName, setAccName] = useState(null);
    const [loader, setLoader] = useState(true);
    const [showModal, SetShowModal] = useState(false);
    const [accId, setAccId] = useState(null);
    const [accCredit, setAccCredit] = useState(0.00);
    const [showLedger, setShowLedger] = useState(false);
    const [ledgerData, setLedgerData] = useState([]);
    const [ledgerLoading, setLedgerLoading] = useState(false);

    useEffect(() => {

        fetchList();

    }, [])  
      async function fetchList() {
        setLoader(true);
        try {
            const { Success, Data, Message } = await GetSingleListResult({
                "key": "COA_CRUD",
                "TYPE": "GET_TREE",
            })
            if (Success) {
                setData(Data);
                setTreeData(buildTreeStructure(Data));
            } else {
                showToast(Message, "error");
            }
        } finally {
            setLoader(false);
        }
    }

    // Build hierarchical tree structure
    const buildTreeStructure = (data) => {
        const nodeMap = {};
        const rootNodes = [];

        // Create node map
        data.forEach(item => {
            nodeMap[item.ACMAIN_CODE] = {
                id: item.ACMAIN_CODE,
                name: item.ACMAIN_DESC,
                code: item.ACMAIN_CODE,
                parent: item.ACMAIN_PARENT,
                isGroup: item.ACMAIN_ACTYPE_DOCNO === "GH",
                accountNo: item.ACMAIN_ACCNO,
                balance: item.ACMAIN_DEFAULT_BALANCE_SIGN,
                credit: item.Credit || 0,
                tax: item.ACMAIN_ACCOUNT_TAX,
                remarks: item.ACMAIN_ACCOUNT_REMARK,
                isDeletable: item.isDeletable,
                IsAllowToCreateGH: item.IsAllowToCreateGH,
                IsAllowToCreateGL: item.IsAllowToCreateGL,
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

        return rootNodes;
    };

    const handleNodeToggle = (nodeId) => {
        setExpandedNodes(prev => 
            prev.includes(nodeId) 
                ? prev.filter(id => id !== nodeId)
                : [...prev, nodeId]
        );
    };

    const handleNodeSelect = (node) => {
        setSelectedNode(node.id);
        setAccDetails(node);
        setAccName(node.name);
        setAccId(node.id);
        setAccCredit(node.credit);
        setIsDelete(node.isDeletable === 1);
    };

    const handleDelete = async (id) => {
        Confirm('Are you sure to Delete?').then(async () => {
            try {
                setLoader(true);
                const { Success, Data, Message } = await GetSingleResult({
                    "key": "COA_CRUD",
                    "TYPE": "DELETE",
                    "ACMAIN_CODE": id
                })
                // const { Success, Data, Message } = await deleteRole(id)
                if (Success) {
                    fetchList();
                    showToast("Account deleted !", 'success');
                }
                else {
                    showToast(Message, "error");
                }
            }
            finally {
                setLoader(false);
            }
        });
    }
    function closeModal() {
        SetShowModal(false);
        setEditData(null);
        fetchList();
    }
    function handleEdit(users) {
        SetShowModal(true);
        setEditData(accDetails)
    }

    function handleNew(id) {
        SetShowModal(true);
        setEditData(null)
    }
    const getAccountDetails = async (id) => {
        const { Success, Data, Message } = await GetSingleResult({
            "key": "COA_CRUD",
            "TYPE": "GET_DETAILS",
            "ACMAIN_CODE": id
        })
        if (Success) {
            setIsDelete(Data?.isDeletable)
            setAccDetails(Data)
            setAccCredit(Data?.Credit)
        }
        else {
            showToast(Message, "error");
        }
    }
    const handleItemClick = (item) => {
        console.log('Item clicked:', item);
        setAccName(item.label)
        setAccId(item.id)
        getAccountDetails(item.id)

        // Do something with the clicked item
    };

    const handleViewLedger = async (accountId) => {
        setShowLedger(true);
        setLedgerLoading(true);
        try {
            const { Success, Data, Message } = await GetSingleResult({
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
    };

    return <>
        <Helmet>
            <title> Chart of Account </title>
        </Helmet>
        <Card >
            <Stack m={5} >
                <Grid container spacing={4} sx={{ 
                    height: 'calc(100vh - 200px)',
                    position: 'relative'
                }}>
                    <Grid item md={12}>
                        <Typography variant="h4" gutterBottom>
                            Chart Of Account {showLedger && accName && `- ${accName} Ledger`}
                        </Typography>
                    </Grid>
                    {!showLedger ? (
                        <>
                            <Grid item sm={12} md={5}
                                sx={{
                                    backgroundColor: 'white',
                                    borderRadius: '10px', 
                                    padding: '10px',
                                    height: 'calc(100vh - 300px)',
                                    overflowY: 'auto',
                                    '&::-webkit-scrollbar': {
                                        display: 'none'
                                    },
                                    '-ms-overflow-style': 'none',
                                    'scrollbarWidth': 'none',
                                    '& .MuiTreeView-root': {
                                        width: '100%'
                                    }
                                }}
                            >
                                {data && <TreeView callbackFunction={handleItemClick} data={data} />}
                            </Grid>
                            <Grid item sm={12} md={7} sx={{
                                background: 'linear-gradient(to right,rgba(255, 255, 255, 0.51),rgba(247, 247, 247, 0.38))',
                                borderRadius: '10px', 
                                padding: '20px',
                                height: 'fit-content'
                            }}>
                                {accName && <Box display="flex" flexDirection="column" alignItems="flex-end" gap={2}>
                                    <Typography variant="h4" gutterBottom>
                                        {accName}
                                    </Typography>
                                    <Box display="flex" gap={2} justifyContent="flex-end" flexDirection="row">
                                        {accDetails?.ACMAIN_ACTYPE_DOCNO === 'GH' && accDetails?.IsAllowToCreateGH ? <Button variant="outlined"
                                            size="small"
                                            onClick={() => handleNew(accId)}
                                            startIcon={<Iconify icon="eva:plus-fill" />}>
                                            Add Child
                                        </Button> : <Button variant="outlined"
                                            size="small"
                                            onClick={() => handleNew(accId)}
                                            startIcon={<Iconify icon="eva:plus-fill" />}>
                                            Add Account
                                        </Button>
                                        }
                                        <Button variant="outlined"
                                            size="small"
                                            onClick={() => handleEdit(accDetails)}
                                            startIcon={<Iconify icon="eva:edit-fill" />}>
                                            Edit
                                        </Button>
                                        {accDetails?.ACMAIN_ACTYPE_DOCNO !== 'GH' && <Button variant="outlined"
                                            size="small"
                                            onClick={() => handleViewLedger(accId)}
                                            startIcon={<Iconify icon="eva:eye-fill" />}>
                                            View Ledger
                                        </Button>
                                        }
                                        {isDelete === 1 && <Button variant="outlined" color="error"
                                            size="small"
                                            startIcon={<Iconify icon="eva:trash-2-outline" />}
                                            onClick={() => handleDelete(accId)}>
                                            Delete
                                        </Button>
                                        }
                                    </Box>
                                    <Box display="flex" gap={2}>
                                        <Typography variant="body1" gutterBottom>
                                            Credit Limit
                                        </Typography>
                                        <Typography variant="body1" gutterBottom>
                                            {accCredit}
                                        </Typography>
                                    </Box>
                                </Box>}
                            </Grid>
                        </>
                    ) : (
                        <Grid item xs={12}>
                            <Box sx={{ mb: 2 }}>
                                <Button 
                                    variant="outlined"
                                    size="small"
                                    onClick={() => setShowLedger(false)}
                                    startIcon={<Iconify icon="eva:arrow-back-fill" />}
                                >
                                    Back to Account
                                </Button>
                            </Box>
                            <TableContainer component={Paper}>
                                <Table sx={{ minWidth: 650 }} aria-label="ledger table">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Description</TableCell>
                                            <TableCell align="right">Debit</TableCell>
                                            <TableCell align="right">Credit</TableCell>
                                            <TableCell align="right">Balance</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ledgerLoading ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    <CircularProgress />
                                                </TableCell>
                                            </TableRow>
                                        ) : ledgerData.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No ledger entries found
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            ledgerData.map((row, index) => (
                                                <TableRow key={index}>
                                                    <TableCell>{row.date}</TableCell>
                                                    <TableCell>{row.description}</TableCell>
                                                    <TableCell align="right">{row.debit}</TableCell>
                                                    <TableCell align="right">{row.credit}</TableCell>
                                                    <TableCell align="right">{row.balance}</TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>
                    )}
                </Grid>
                {/* {
                    (!loader && data) ? <DataTable
                        columns={columns}
                        data={data}
                        // enableRowSelection 
                        // enableGrouping
                        enableExport={false}

                    /> : <CircularProgress color="inherit" />
                } */}
                <ModalForm 
                open={showModal} 
                initialValues={editData} 
                parentId={accDetails?.ACMAIN_ACTYPE_DOCNO === "GL" ? accDetails?.ACMAIN_PARENT : accId} onClose={() => closeModal()} 
                IsAllowToCreateGH= {accDetails?.IsAllowToCreateGH}
                IsAllowToCreateGL= {accDetails?.IsAllowToCreateGL}
                grpCode={!accDetails?.IsAllowToCreateGH? "GL" : accDetails?.ACMAIN_ACTYPE_DOCNO} 
                />
            </Stack>
        </Card>
    </>

}
