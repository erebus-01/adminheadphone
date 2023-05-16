import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useNavigate } from 'react-router-dom';
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

import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';
// mock
import USERLIST from '../_mock/user';
import { baseURL } from '../utils/constant';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'image', label: 'Image', alignRight: false },
  { id: 'title', label: 'Title', alignRight: false },
  { id: 'author', label: 'Author', alignRight: false },
  { id: 'topic', label: 'Topic', alignRight: false },
  { id: 'content', label: 'Content', alignRight: false },
  { id: '' },
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
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

export default function AddBlogPage() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(null);
    const [form, setForm] = useState({});
    const [blogs, setBlogs] = useState([])
    

    const [openPopup, setOpenPopup] = useState(false);
    const [severity, setSeverity] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios.get(`${baseURL}/posts`).then((res) => {
        console.log(res.data.json);
        setBlogs(res.data.json); 
        })
    }, [blogs])

  //  #region ui
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openModal, setOpenModal] = useState(false);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const handleOpenModalUpdate = () => setOpenModalUpdate(true);
  const handleCloseModalUpdate = () => setOpenModalUpdate(false);

  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

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
      const newSelecteds = blogs.map((n) => n.name);
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

  const Alert = React.forwardRef((props, ref) => (
    <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
  ));
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenPopup(false);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - blogs.length) : 0;

  const filteredUsers = applySortFilter(blogs, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;
  // #endregion

  const handleForm = (e) => {
    setForm({
        ...form,
        [e.target.name]: e.target.value
    })
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const response = await fetch(`${baseURL}/post`, {
      method: 'POST',
      body: JSON.stringify(form),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    
    navigate('/dashboard/blog')
    setOpenPopup(true);
    setMessage(data.message);
    if(response.status === 201) {
        setSeverity('success')
    }
    else {
        setSeverity('error')
    }
  }

    const handleDeleteBlog = async (_id) => {
        const response = await fetch(`${baseURL}/post/${_id}`, {
            method: 'DELETE',
        })
        const data = await response.json()
        console.log(data)
        
        navigate('/dashboard/blog')
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

  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container sx={{display: 'grid', placeContent: 'center' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Blog
          </Typography>
          <Button variant="contained" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Blog
          </Button>
        </Stack>

        {openPopup &&       
          <Snackbar open={openPopup} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
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
                Create new blog
              </Typography>
              <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </Typography>
              <form onSubmit={handleSubmitForm}>
                <TextField fullWidth name='title' label="Title" id="fullWidth" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='author' label="Author" id="fullWidth" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='topic' label="Topic" id="fullWidth" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='image' label="Image" id="fullWidth" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='content' label="Content" id="fullWidth" sx={{ mt: 2 }} multiline minRows={4} maxRows={14} onChange={handleForm} required />
                <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={4}>
                        <Button 
                            variant="contained" 
                            type="submit"
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
              <TextField fullWidth label="First Name" id="fullWidth" sx={{ mt: 2 }} />
              <TextField fullWidth label="Last Name" id="fullWidth" sx={{ mt: 2 }} />
              <TextField fullWidth label="Email" id="fullWidth" sx={{ mt: 2 }} />
              <TextField fullWidth label="Username" id="fullWidth" sx={{ mt: 2 }} />
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={4}>
                  <Button 
                    variant="contained" 
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

        <Card sx={{width: '1400px'}}>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 600 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={blogs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { _id, title, author, topic, image, content } = row;
                    const selectedUser = selected.indexOf(title) !== -1;

                    return (
                      <TableRow hover key={_id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, title)} />
                        </TableCell>

                        <TableCell align="left">
                            <img src={image} alt={title} loading="lazy" style={{ width: '80%', flexShrink: 0, borderRadius: 10, marginRight: 10 }} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2">
                              {title}
                            </Typography>
                          </Stack>
                        </TableCell>


                        <TableCell align="left">{author}</TableCell>
                        <TableCell align="left">
                            <img src={topic} alt={author} loading="lazy" style={{ width: '50%', flexShrink: 0, borderRadius: 10, marginRight: 10 }} />
                        </TableCell>
                        <TableCell align="left">{content}</TableCell>

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
                        </TableCell>
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

                            <MenuItem onClick={() => {handleDeleteBlog(_id)}} sx={{ color: 'error.main' }}>
                                <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
                                    Delete
                            </MenuItem>
                        </Popover>
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
            count={blogs.length}
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
