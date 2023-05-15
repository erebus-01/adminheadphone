import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import axios from "axios";
// @mui
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

export default function AddProductPage() {
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [openModal, setOpenModal] = useState(false);

  const [products, setProducts] = useState([]); 
  const [productId, setProductId] = useState([]); 
  const [colors, setColors] = useState([]); 
  const [users, setUsers] = useState([]); 

  const [expanded, setExpanded] = useState(false);
  const handleChange = (panelId) => (event, isExpanded) => {
      setExpanded(isExpanded ? panelId : '');
      console.log(panelId)
    };

  const [form, setForm] = useState({})

  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  useEffect(() => {
    // axios.get(`${baseURL}/products`).then((res) => {
    //   setProducts(res.data); 
    // })
    // axios
    // .all([
    //   axios.get(`${baseURL}/products`),
    //   axios.get(`${baseURL}/products/colors/${productId}`)
    // ])
    // .then(axios.spread((productsRes, colorsRes) => {
    //   setProducts(productsRes.data);
    //   setColors(colorsRes.data);
    // }))
    // .catch(error => {
    //   console.error(error);
    // });
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${baseURL}/products`);
        setProducts(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchProducts();
  }, []);

  const loadProductColors = async (productID) => {
    try {
      const response = await axios.get(`${baseURL}/product/colors/${productID}`);
      const colors = response.data;
    } catch (error) {
      console.error(error);
    }
  };

  // #region ui
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
      const newSelecteds = products.map((n) => n.name);
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;

  const filteredUsers = applySortFilter(products, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;
  // #endregion

  return (
    <>
      <Helmet>
        <title> User | Minimal UI </title>
      </Helmet>

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Product
          </Typography>
          <Button variant="contained" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Product
          </Button>
        </Stack>
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
              <form>
                <TextField fullwidth="true" name='firstName' label="First Name" id="firstName" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullwidth="true" name='lastName' label="Last Name" id="lastName" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullwidth="true" name='email' label="Email" type='email' id="email" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullwidth="true" name='username' label="Username" id="username" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullwidth="true" name='password' label="Password" type='password' id="password" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullwidth="true" name='cfpassword' label="Confirm Password" type='password' id="cfpassword" sx={{ mt: 2 }} onChange={handleForm} />
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
              <TextField fullwidth="true" label="First Name" sx={{ mt: 2 }} />
              <TextField fullwidth="true" label="Last Name"sx={{ mt: 2 }} />
              <TextField fullwidth="true" label="Email" sx={{ mt: 2 }} />
              <TextField fullwidth="true" label="Username" sx={{ mt: 2 }} />
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

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              const { _id, name, subtitles, image, description, benefit, price, colors } = row;
              const selectedUser = selected.indexOf(name) !== -1;

              return (
                <Accordion fullwidth="true" key={_id} expanded={expanded === _id} onChange={handleChange(_id)} sx={{padding: 3}}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                    {productId === _id}
                    <img src={image} alt={name} loading="lazy" style={{ width: '7%', flexShrink: 0, borderRadius: 10, marginRight: 10 }} />
                    <div style={{width: '80%', flexShrink: 0}}>
                      <Typography sx={{  }}>
                        {name}
                      </Typography>
                      <Typography sx={{ color: 'text.secondary' }}>{subtitles}</Typography>
                    </div>
                    <Typography>${price}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div>
                      <ul style={{marginLeft: 30}}>
                        {benefit.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    {colors}
                    {colors.map((colorID, index) => {
                      return (
                        <ColorComponent
                          key={index}
                          colorID={_id}
                          onLoadProductColors={loadProductColors}
                        />
                      );
                    })}
                  </AccordionDetails>
                </Accordion>
              );
            })}
            {emptyRows > 0 && (
              <TableRow style={{ height: 53 * emptyRows }}>
                <TableCell colSpan={6} />
              </TableRow>
            )}
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={products.length}
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

const ColorComponent = ({ colorID, onLoadProductColors }) => {
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get(`${baseURL}/products/colors/${colorID}`);
        const colorData = response.data.json;
        setColors(colorData);
        console.log(`${baseURL}/products/colors/${colorID}`)
      } catch (error) {
        console.error(error);
      }
    };

    fetchColors();
  }, [colorID]);

  useEffect(() => {
    if (colors.length > 0) {
      onLoadProductColors(colors.map(color => color.product));
    }
  }, [colors, onLoadProductColors]);

  return (
    <div>
      {colors.map((color) => (
        <div key={color._id}>
          <img src={color.images[0]} style={{width: '5%'}} alt={color.name} />
        </div>
      ))}
    </div>
  );
};
