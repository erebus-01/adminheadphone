import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
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

import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import { red, teal } from '@mui/material/colors';import EditIcon from '@mui/icons-material/Edit';

import DeleteIcon from '@mui/icons-material/Delete';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { URL, baseURL } from '../utils/constant';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', alignRight: false },
  { id: 'company', label: 'Company', alignRight: false },
  { id: 'role', label: 'Role', alignRight: false },
  { id: 'isVerified', label: 'Verified', alignRight: false },
  { id: 'status', label: 'Status', alignRight: false },
  { id: '' },
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

export default function UserPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);

  const [openPopup, setOpenPopup] = useState(false);
  const [severity, setSeverity] = useState('');
  const [message, setMessage] = useState('');


  const [form, setForm] = useState({})

  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const response = await fetch(`${URL}/user/register`, {
      method: 'POST',
      body: JSON.stringify(form),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    console.log(data);
  }

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const handleOpenModalUpdate = (row) => {
    setOpenModalUpdate(true);
    setSelectedProduct(row);
  }
  const handleCloseModalUpdate = () => setOpenModalUpdate(false);

  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const [selectedProduct, setSelectedProduct] = useState({});
  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const [users, setUsers] = useState([]); 

  useEffect(() => {
    const fetchAdmin = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/v1/user')
        setUsers(response.data.json);
      } catch (error) {
        console.error(error);
      }
    }
    fetchAdmin();
  }, [users])

  // #region ui
  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };
  
  const Alert = React.forwardRef((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
  ));
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenPopup(false);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - users.length) : 0;

  const filteredUsers = applySortFilter(users, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;
  // #endregion

  const handleDeleteAdmin = async (e, _id) => {
    e.preventDefault();
    const response = await fetch(`${baseURL}/user/${_id}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    console.log(data)
    
    navigate('/dashboard/user')
    setOpenPopup(true);
    setOpen(false);
    setMessage(data.message);
    if(response.status === 201) {
        setSeverity('success')
    }
    else {
        setSeverity('error')
    }
  }

  const handleUpdateUser = async (event) => {
    event.preventDefault()
    console.log(selectedProduct)

    const response = await fetch(`${baseURL}/user`, {
      method: 'PUT',
      body: JSON.stringify(selectedProduct),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    console.log(data)

    navigate('/dashboard/user')
    setOpenPopup(true);
    setOpenModalUpdate(false);
    setMessage(data.message);
    if (response.status === 201) {
      setSeverity('success')
    }
    else {
      setSeverity('error')
    }
  }

  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            User
          </Typography>
          <Button variant="contained" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            New User
          </Button>
        </Stack>
        {openPopup &&       
          <Snackbar open={openPopup} autoHideDuration={5000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
            <Alert severity={severity} sx={{ width: '100%' }}>
              {message}
            </Alert>
          </Snackbar>}
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={openModal}
          onClose={handleCloseModal}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={openModal}>
            <Box sx={style}>
              <Typography id="transition-modal-title" variant="h3" component="h2">
                Create new user
              </Typography>
              <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </Typography>
              <form onSubmit={handleSubmitForm}>
                <TextField fullWidth name='firstName' label="First Name" id="firstName" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='lastName' label="Last Name" id="lastName" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='email' label="Email" type='email' id="email" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='username' label="Username" id="username" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='password' label="Password" type='password' id="password" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='cfpassword' label="Confirm Password" type='password' id="cfpassword" sx={{ mt: 2 }} onChange={handleForm} />
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      type='submit'
                      endIcon={<SendOutlinedIcon />}
                      style={{ width: "150px", height: "50px" }}
                    >
                      Send
                    </Button>
                  </Grid>
                  <Grid item xs={6} container justify="flex-end">
                    <Button
                      onClick={handleCloseModal}
                      variant="outlined"
                      style={{ width: "150px", height: "50px" }}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Fade>
        </Modal>
        <Modal
          aria-labelledby="transition-modal-title"
          aria-describedby="transition-modal-description"
          open={openModalUpdate}
          onClose={handleCloseModalUpdate}
          closeAfterTransition
          slots={{ backdrop: Backdrop }}
          slotProps={{
            backdrop: {
              timeout: 500,
            },
          }}
        >
          <Fade in={openModalUpdate}>
            <Box sx={style}>
              <Typography id="transition-modal-title" variant="h3" component="h2">
                Update user profile
              </Typography>
              <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </Typography>
              <form onSubmit={handleUpdateUser}>
                <input type="text" name='id' hidden value={selectedProduct?._id || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} />
                <TextField name='firstName' value={selectedProduct?.firstName || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="Name" id="fullWidth" sx={{ mt: 2 }} />
                <TextField name='lastName' value={selectedProduct?.lastName || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="Name" id="fullWidth" sx={{ mt: 2 }} />
                <TextField name='username' value={selectedProduct?.username || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="Name" id="fullWidth" sx={{ mt: 2 }} />
                <TextField name='email' value={selectedProduct?.email || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="Name" id="fullWidth" sx={{ mt: 2 }} />

                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={4}>
                    <Button
                      variant="contained"
                      type='submit'
                      endIcon={<SendOutlinedIcon />}
                      style={{ width: "150px", height: "50px" }}
                    >
                      Send
                    </Button>
                  </Grid>
                  <Grid item xs={6} container justify="flex-end">
                    <Button
                      onClick={handleCloseModalUpdate}
                      variant="outlined"
                      style={{ width: "150px", height: "50px" }}
                    >
                      Cancel
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Fade>
        </Modal>

        <Dialog
          open={openDelete}
          onClose={handleCloseDelete}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            {"Use Google's location service?"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Let Google help apps determine location. This means sending anonymous
              location data to Google, even when no apps are running.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDelete}>Disagree</Button>
            <Button onClick={handleCloseDelete} autoFocus>
              Agree
            </Button>
          </DialogActions>
        </Dialog>

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={users.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, firstName, lastName, username, email, verify } = row;
                    const selectedUser = selected.indexOf(firstName) !== -1;

                    return (
                      <TableRow hover key={_id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, firstName)} />
                        </TableCell>

                        <TableCell align="left">{firstName}</TableCell>
                        <TableCell align="left">{lastName}</TableCell>
                        <TableCell align="left">{username}</TableCell>
                        <TableCell align="left">{email}</TableCell>

                        <TableCell align="left">
                          <Label color={(verify ? 'success' : 'error')}>{(verify ? 'Active' : 'Unactive')}</Label>
                        </TableCell>

                        <TableCell style={{ display:'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <Button 
                            variant="contained"
                            onClick={() => handleOpenModalUpdate(row)}
                            endIcon={<EditIcon />} 
                            style={{ width: "100px", height: "50px", backgroundColor: teal[600], marginRight: '10px' }}
                            >
                              Update
                            </Button>

                            <Button 
                            onClick={(e) => {handleDeleteAdmin(e, _id)}}
                            variant="contained" 
                            endIcon={<DeleteIcon />}
                            style={{ width: "100px", height: "50px", backgroundColor: red[800] }}
                            >
                                Delete
                            </Button>
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
            count={users.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>
    </>
  );
}
