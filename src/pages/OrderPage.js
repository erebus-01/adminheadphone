import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Button,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Backdrop,
  Box,
  Modal,
  Fade,
  TextField,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

import { red, teal } from '@mui/material/colors';
import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// mock
import USERLIST from '../_mock/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Telephone', alignRight: false },
  { id: 'role', label: 'Total Price', alignRight: false },
  { id: 'isVerified', label: 'Payment', alignRight: false },
  { id: 'Payment', label: 'Status Payment', alignRight: false },
  { id: 'Order', label: 'Status Order', alignRight: false },
  { id: 'status', label: 'Address', alignRight: false },
  { id: 'Products', label: 'Products', alignRight: false },
  { id: 'status', label: 'Time', alignRight: false },
  { id: 'ChangeStatus', label: 'Change Status', alignRight: false },
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function OrderPage() {
  const [open, setOpen] = useState(null);

  const [selectedRow, setSelectedRow] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = (id) => {
    setSelectedRow(id);
    setOpenModal(true);
  }
  const handleCloseModal = () => setOpenModal(false);

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const handleOpenModalUpdate = () => setOpenModalUpdate(true);
  const handleCloseModalUpdate = () => setOpenModalUpdate(false);

  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);


  const [orders, setOrders] = useState([])

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/v1/order')
        setOrders(response.data.json);
      } catch (error) {
        console.error(error);
      }
    };
    fetchPosts();
  }, [])

  console.log(orders)
  console.log(selectedRow);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const updateOrderStatus = async (userId, orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/auth/v1/order/${userId}/${orderId}`, { status });

      window.location.reload();
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = orders.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const formatCreatedAt = (createdAt) => {
    const date = new Date(createdAt);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');

    return `${day}-${month}-${year} ${hour}:${minute}:${second}`;
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - orders.length) : 0;

  const filteredUsers = applySortFilter(orders, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;

  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container sx={{ display: 'grid', placeContent: 'center', width: '100%' }} maxWidth={false} disableGutters>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Order
          </Typography>
        </Stack>

        <Card sx={{ width: '1600px' }}>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={orders.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, name, totalPrice, phone, address, wards, districts, provinces, payment, statusPayment, products, status, user, createdAt } = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={_id} tabIndex={-1} role="checkbox" selected={selectedUser}>

                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)} />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Typography variant="subtitle2" noWrap>
                            {name}
                          </Typography>
                        </TableCell>

                        <TableCell align="left">{phone}</TableCell>

                        <TableCell align="left">{totalPrice.toLocaleString()}</TableCell>

                        <TableCell align="left">{payment}</TableCell>

                        <TableCell align="left">{statusPayment}</TableCell>

                        <TableCell align="left">
                          <Label
                            sx={{
                              backgroundColor:
                                (status === 'Failed' && 'error.main') ||
                                (status === 'Cancelled' && 'error.main') ||
                                (status === 'Pending' && 'success.main') ||
                                (status === 'Delivered' && teal[600]) ||
                                (status === 'Processing' && '#f6d69c') ||
                                (status === 'Shipped' && '#e2e0e2') ||
                                'default',
                              color:
                                (status === 'Failed' && 'error.contrastText') ||
                                (status === 'Cancelled' && 'error.contrastText') || 
                                (status === 'Pending' && 'success.contrastText') ||
                                (status === 'Delivered' && '#ffffff') ||
                                (status === 'Processing' && '#c3a161') ||
                                (status === 'Shipped' && '#3a3a3a') ||
                                'default',
                              padding: '6px 12px',
                              borderRadius: '4px',
                            }}
                          >{sentenceCase(status)}</Label>
                        </TableCell>

                        <TableCell align="left">{address}-{wards}-{districts}-{provinces}</TableCell>

                        <TableCell align="left" sx={{ width: '20%' }}>
                          {products.map(({ name, color, quantity }) => (
                            <div>
                              {name} - {color} - {quantity}
                            </div>
                          ))}
                        </TableCell>

                        <TableCell align="left">{formatCreatedAt(createdAt)}</TableCell>



                        <TableCell style={{ display: 'block' }}>
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              style={{ width: "80px", height: "40px", backgroundColor: teal[600], fontSize: '12px', marginRight: '5px' }}
                              onClick={() => updateOrderStatus(user, _id, 'Delivered')}
                            >
                              Delivered
                            </Button>

                            <Button
                              variant="contained"
                              style={{ width: "80px", height: "40px", backgroundColor: '#f6d69c', fontSize: '12px', color: '#c3a161' }}
                              onClick={() => updateOrderStatus(user, _id, 'Processing')}
                            >
                              Processing
                            </Button>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5px' }}>
                            <Button
                              variant="contained"
                              style={{ width: "80px", height: "40px", backgroundColor: '#e2e0e2', fontSize: '12px', color: '#3a3a3a', marginRight: '5px' }}
                              onClick={() => updateOrderStatus(user, _id, 'Shipped')}
                            >
                              Shipped
                            </Button>

                            <Button
                              variant="contained"
                              style={{ width: "80px", height: "40px", backgroundColor: '#e99998', fontSize: '12px', color: '#7d2c2b' }}
                              onClick={() => updateOrderStatus(user, _id, 'Cancelled')}
                            >
                              Cancelled
                            </Button>
                          </div>
                        </TableCell>

                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={orders.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <MenuItem onClick={handleOpenModalUpdate}>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={handleOpenDelete} sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}
