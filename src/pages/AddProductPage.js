import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import axios from "axios";
// @mui
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { red, teal } from '@mui/material/colors';
import {
  Card,
  Stack,
  Button,
  Popover,
  TableRow,
  MenuItem,
  TableCell,
  Container,
  Typography,
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
  DialogTitle,
  IconButton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert, { AlertProps } from '@mui/material/Alert';
import EditIcon from '@mui/icons-material/Edit';
import ColorLensIcon from '@mui/icons-material/ColorLens';

import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
// components
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { URL, baseURL } from '../utils/constant';
// sections
import { UserListHead, UserListToolbar } from '../sections/@dashboard/user';

// ----------------------------------------------------------------------


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);

  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [openModal, setOpenModal] = useState(false);

  const [products, setProducts] = useState([]);

  const [openPopup, setOpenPopup] = useState(false);
  const [severity, setSeverity] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({})
  const [formColor, setFormColor] = useState({})

  const [expanded, setExpanded] = useState(false);


  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const response = await fetch(`${baseURL}/product`, {
      method: 'POST',
      body: JSON.stringify(form),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    if (response.status === 201) {
      navigate('/dashboard/products')
      setOpenModal(false);
      setOpenPopup(true);
      setMessage(data.message);
      setSeverity('success')
    }
    else {
      setOpenModal(false);
      setMessage(data.message);
      setSeverity('error')
    }
  }

  const handleColorForm = (e) => {
    setFormColor({
      ...formColor,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmitFormColor = async (e, product) => {
    e.preventDefault();
    const response = await fetch(`${baseURL}/product/color/${product}`, {
      method: 'POST',
      body: JSON.stringify(formColor),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json();
    if (response.status === 201) {
      navigate('/dashboard/products')
      setOpenColor(false);
      setOpenPopup(true);
      setMessage(data.message);
      setSeverity('success')
    }
    else {
      setOpenColor(false);
      setMessage(data.message);
      setSeverity('error')
    }
  }

  const handleDeleteProduct = async (e, product) => {
    e.preventDefault();
    const response = await fetch(`${baseURL}/product/${product}`, {
      method: 'DELETE',
    })
    const data = await response.json()
    if (response.status === 201) {
      navigate('/dashboard/products')
      setOpenPopup(true);
      setMessage(data.message);
      setSeverity('success')
    }
    else {
      setOpenPopup(true);
      setMessage(data.message);
      setSeverity('error')
    }
  }

  const handleUpdateProduct = async (event) => {
    event.preventDefault()
    const filteredBenefit = selectedProduct.benefit.filter(Boolean);
    const filteredDescription = selectedProduct.description.filter(Boolean);
    const nameFixed = selectedProduct.name.replace(/\n/g, '');
    const subtitlesFixed = selectedProduct.subtitles.replace(/\n/g, '');
    const imageFixed = selectedProduct.image.replace(/[ \t\n]+/g, '');

    const updatedProduct = {
      ...selectedProduct,
      name: nameFixed,
      subtitles: subtitlesFixed,
      image: imageFixed,
      benefit: filteredBenefit,
      description: filteredDescription,
    };

    const response = await fetch(`${baseURL}/product`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()

    navigate('/dashboard/products')
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

  // #region ui
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
  
      const colorsPromises = productID.map(async (id) => {
        const response = await axios.get(`${baseURL}/products/colors/${id}`);
        return response.data;
      });
  
      const colors = await Promise.all(colorsPromises);
    } catch (error) {
      console.error(error);
    }
  };
  


  const [selectedProduct, setSelectedProduct] = useState({});

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const [openColor, setOpenColor] = useState(false);
  const handleOpenColorModal = () => setOpenColor(true);
  const handleCloseColorModal = () => setOpenColor(false);

  const [openModalUpdate, setOpenModalUpdate] = useState(false);
  const handleOpenModalUpdate = (row) => {
    setOpenModalUpdate(true);
    setSelectedProduct(row);
  }
  const handleCloseModalUpdate = () => setOpenModalUpdate(false);

  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 5));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleChange = (panelId) => (event, isExpanded) => {
    setExpanded(isExpanded ? panelId : '');
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
                Create new product
              </Typography>
              <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
              </Typography>
              <form onSubmit={handleSubmitForm}>
                <TextField fullWidth name='name' label="Name" id="name" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='subtitles' label="Subtitles" id="subtitles" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='image' label="ImageURL" id="image" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='benefit' label="Benefit" id="benefit" sx={{ mt: 2 }} onChange={handleForm} multiline rows={5} required />
                <TextField fullWidth name='price' label="Price" type='number' id="price" sx={{ mt: 2 }} onChange={handleForm} required />
                <TextField fullWidth name='description' label="DescriptionURL" id="description" sx={{ mt: 2 }} onChange={handleForm} multiline rows={5} required />
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={2}>
                    <Button
                      variant="contained"
                      type='submit'
                      endIcon={<SendOutlinedIcon />}
                      style={{ width: "150px", height: "50px" }}
                    >
                      Send
                    </Button>
                  </Grid>
                  <Grid item xs={2} container justify="flex-end">
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
              <form onSubmit={handleUpdateProduct}>
                <input type="text" name='id' hidden value={selectedProduct?._id || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} />
                <TextField name='name' value={selectedProduct?.name || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="Name" id="fullWidth" sx={{ mt: 2 }} />
                <TextField name='subtitles' value={selectedProduct?.subtitles || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="Subtitles" id="fullWidth" sx={{ mt: 2 }} />
                <TextField name='price' value={selectedProduct?.price || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="Price" type='number' id="fullWidth" sx={{ mt: 2 }} />
                <TextField name='image' value={selectedProduct?.image || ''} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value })} fullWidth label="ImageURL" id="fullWidth" sx={{ mt: 2 }} />
                <TextField name='benefit' value={selectedProduct?.benefit ? selectedProduct.benefit.join("\n") : ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value.split("\n") })} fullWidth label="Benefit" id="fullWidth" multiline minRows={6} maxRows={14} sx={{ mt: 2 }} />
                <TextField name='description' value={selectedProduct?.description ? selectedProduct.description.join("\n") : ""} onChange={(e) => setSelectedProduct({ ...selectedProduct, [e.target.name]: e.target.value.split("\n") })} fullWidth label="DescriptionURL" id="fullWidth" multiline minRows={6} maxRows={14} sx={{ mt: 2 }} />

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
            {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
              const { _id, name, subtitles, image, description, benefit, price, colors } = row;
              const selectedUser = selected.indexOf(name) !== -1;

              return (
                <Accordion fullwidth="true" key={_id} expanded={expanded === _id} onChange={handleChange(_id)} sx={{ padding: 3 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1bh-content"
                    id="panel1bh-header"
                  >
                    <img src={image} alt={name} loading="lazy" style={{ width: '7%', flexShrink: 0, borderRadius: 10, marginRight: 10 }} />
                    <div style={{ width: '80%', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: '20px', fontWeight: '700' }}>
                        {name}
                      </Typography>
                      <Typography sx={{ mt: 1, color: 'text.secondary' }}>{subtitles}</Typography>
                    </div>
                    <Typography>{price.toLocaleString()}{"\u0111"}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <div>
                      <ul style={{ marginLeft: 30 }}>
                        {benefit.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <Grid container sx={{ mt: 1 }}>
                      <Grid item>
                        <Button
                          variant="contained"
                          type='submit'
                          onClick={handleOpenColorModal}
                          endIcon={<ColorLensIcon />}
                          style={{ width: "150px", height: "50px" }}
                        >
                          Add Color
                        </Button>
                      </Grid>
                    </Grid>
                    <Modal
                      aria-labelledby="transition-modal-title"
                      aria-describedby="transition-modal-description"
                      open={openColor}
                      onClose={handleCloseColorModal}
                      closeAfterTransition
                      slots={{ backdrop: Backdrop }}
                      slotProps={{
                        backdrop: {
                          timeout: 500,
                        },
                      }}
                    >
                      <Fade in={openColor}>
                        <Box sx={style}>
                          <Typography id="transition-modal-title" variant="h3" component="h2">
                            Create new color for product
                          </Typography>
                          <Typography id="transition-modal-description" sx={{ mt: 2 }}>
                            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                          </Typography>
                          <form onSubmit={(e) => handleSubmitFormColor(e, _id)}>
                            <TextField fullWidth name='name' label="Name" id="name" sx={{ mt: 2 }} required onChange={handleColorForm} />
                            <TextField fullWidth name='color' label="Color" id="color" type='color' required sx={{ mt: 2, width: '150px' }} onChange={handleColorForm} />
                            <TextField fullWidth name='images' label="Images" id="images" sx={{ mt: 2 }} required multiline rows={6} onChange={handleColorForm} />

                            <Grid container spacing={2} sx={{ mt: 2 }}>
                              <Grid item xs={2} sx={{ mr: 6 }}>
                                <Button
                                  variant="contained"
                                  type='submit'
                                  endIcon={<SendOutlinedIcon />}
                                  style={{ width: "150px", height: "50px" }}
                                >
                                  Insert
                                </Button>
                              </Grid>
                              <Grid item xs={2} container justify="flex-end">
                                <Button
                                  onClick={handleCloseColorModal}
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
                    <ColorComponent
                      key={_id}
                      colorID={_id}
                      onLoadProductColors={loadProductColors}
                    />
                    {description.map((item, index) => (
                      <img src={item} key={index} alt={name} loading="lazy" style={{ width: '100%', marginTop: '30px', flexShrink: 0, borderRadius: 10, marginRight: 10 }} />
                    ))}

                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      <Grid item xs={2} sx={{ mr: 1 }}>
                        <Button
                          variant="contained"
                          onClick={() => { handleOpenModalUpdate(row) }}
                          endIcon={<EditIcon />}
                          style={{ width: "150px", height: "50px", backgroundColor: teal[600] }}
                        >
                          Update
                        </Button>
                      </Grid>
                      <Grid item xs={6} container justify="flex-end">
                        <Button
                          onClick={(e) => { handleDeleteProduct(e, _id) }}
                          variant="contained"
                          endIcon={<DeleteIcon />}
                          style={{ width: "150px", height: "50px", backgroundColor: red[800] }}
                        >
                          Delete
                        </Button>
                      </Grid>
                    </Grid>

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
    </>
  );
}

function rgbStringToHex(rgbString) {
  const rgbValues = rgbString.substring(4, rgbString.length - 1);
  const [r, g, b] = rgbValues.split(',').map((value) => parseInt(value.trim(), 10));
  const hexR = r.toString(16).padStart(2, '0');
  const hexG = g.toString(16).padStart(2, '0');
  const hexB = b.toString(16).padStart(2, '0');
  return `#${hexR}${hexG}${hexB}`;
}

const ColorComponent = ({ colorID, onLoadProductColors }) => {
  const navigate = useNavigate();
  const [colors, setColors] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);

  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        const response = await axios.get(`${baseURL}/products/colors/${colorID}`);
        const colorData = response.data;
        setColors(colorData);
      } catch (error) {
        console.error(`Get error ${error}`);
      }
    };

    fetchColors();
  }, [colorID]);

  useEffect(() => {
    if (colors && colors.length > 0) {
      onLoadProductColors(colors.map((color) => color.product));
    }
  }, [colors, onLoadProductColors]);

  const handleDeleteColor = async (productId, _id) => {
    const response = await fetch(`${baseURL}/product/color/${productId}/${_id}`, {
      method: 'DELETE',
    });
    const data = await response.json();

    if (response.status === 201) {
      navigate('/dashboard/products');
      setColors((prevColors) => prevColors.filter((color) => color._id !== _id));
      handleCloseDelete();
    }
  };
  if (colors.length === 0) {
    return <p>Product has no colors.</p>;
  }

  return (
    <div>
      {colors.map((color) => (
        <div key={color._id} style={{ marginTop: '30px' }}>
          <div style={{ flexGrow: 1, position: 'relative' }}>
            <p style={{ fontWeight: '700' }}>{color.name}</p>
            <TextField
              fullwidth="true"
              label="Color"
              type="color"
              disabled
              value={color.color.toString()}
              sx={{ mb: 1, width: '100px' }}
            />
            <Grid container columns={16} display="flex" justifyContent="center">
              {color.images.map((item, index) => (
                <img
                  src={item}
                  key={index}
                  style={{ width: '10%', marginRight: '50px', border: '1px solid #b5b5b5', borderRadius: '10px' }}
                  alt={color.name}
                />
              ))}
            </Grid>
            <IconButton onClick={handleOpenDelete} aria-label="delete" size="large" sx={{ position: 'absolute', top: 10, right: 0 }}>
              <DeleteIcon fontSize="inherit" />
            </IconButton>
            <Dialog open={openDelete} onClose={handleCloseDelete} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
              <DialogTitle id="alert-dialog-title">{"Use Google's location service?"}</DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDelete}>Disagree</Button>
                <Button onClick={() => { handleDeleteColor(colorID, color._id) }} autoFocus>
                  Agree
                </Button>
              </DialogActions>
            </Dialog>
          </div>
        </div>
      ))}
    </div>
  );
};

