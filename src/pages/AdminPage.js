import { Helmet } from 'react-helmet-async';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
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
  DialogTitle,
  InputLabel,
  ListSubheader,
  FormControl,
  Select,
  FormGroup,
} from '@mui/material';

import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
import { baseURL } from '../utils/constant';
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

export default function AdminPage() {
  const [open, setOpen] = useState(null);

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

  const [users, setUsers] = useState([]); 
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedAddress, setSelectedAddress] = useState([]);

  const [form, setForm] = useState({})

  useEffect(() => {
    axios.get(`${baseURL}/admin`).then((res) => {
      console.log(res.data);
      setUsers(res.data); 
    })
  }, [])

  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    const response = await fetch(`${baseURL}/admin`, {
      method: 'POST',
      body: JSON.stringify(form),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    console.log(data);
  }

  console.log(USERLIST);

// #region ui
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
      const newSelecteds = USERLIST.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  useEffect(() => {
    axios.get('https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json')
      .then((response) => {
        setProvinces(response.data);
      });
  }, []);


  const handleProvinceChange = (event) => {
    const selectedValue = event.target.value;
    const selectedOption = event.target.options[event.target.selectedIndex];
    const selectedProvince = provinces.find((province) => province.Id === selectedValue);
    setDistricts(selectedProvince?.Districts || []);
    setWards([]);
    setSelectedProvince(selectedValue);
    setSelectedAddress([selectedProvince.Name, "", ""]);
    setForm({
      ...form,
      [event.target.name]: selectedOption.text
    })
    event.target.options[0].text = selectedProvince.Name;
  };

  const handleDistrictChange = (event) => {
    const districtId = event.target.value;
    const selectedValue = event.target.value;
    const selectedOption = event.target.options[event.target.selectedIndex];
    const selectedDistrict = districts.find((district) => district.Id === districtId);
    setWards(selectedDistrict?.Wards || []);
    setSelectedDistrict(selectedValue);
    setSelectedAddress(prevState => [prevState[0], selectedDistrict.Name, ""]);
    setForm({
      ...form,
      [event.target.name]: selectedOption.text
    })
    event.target.options[0].text = selectedDistrict.Name;
  };

  const handleWardChange = (event) => {
    const selectedValue = event.target.value;
    const selectedOption = event.target.options[event.target.selectedIndex];
    const selectedWard = wards.find((ward) => ward.Id === selectedValue);
    setSelectedWard(selectedValue);
    setSelectedAddress(prevState => [prevState[0], prevState[1], selectedWard.Name]);
    setForm({
      ...form,
      [event.target.name]: selectedOption.text
    })
    event.target.options[0].text = selectedWard.Name;
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - USERLIST.length) : 0;

  const filteredUsers = applySortFilter(USERLIST, getComparator(order, orderBy), filterName);

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
            User
          </Typography>
          <Button variant="contained" onClick={handleOpenModal} startIcon={<Iconify icon="eva:plus-fill" />}>
            New User
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
              <form onSubmit={handleSubmitForm}>
                <TextField fullWidth name='firstName' label="First Name" id="firstName" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='lastName' label="Last Name" id="lastName" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='email' label="Email" id="email" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='password' label="Password" type='password' id="password" sx={{ mt: 2 }} onChange={handleForm} />
                <TextField fullWidth name='cfpassword' label="Confirm Password" type='password' id="cfpassword" sx={{ mt: 2 }} onChange={handleForm} />
                <div >
                  <FormControl sx={{ mt: 2, minWidth: 120 }}>
                      <InputLabel htmlFor="grouped-native-select">Tỉnh Thành</InputLabel>
                      <Select native defaultValue="" name='provinces' id="grouped-provinces-select" label="Tỉnh Thành" onChange={handleProvinceChange}>
                          <option value="" disabled hidden>   </option>
                          {provinces.map((province) => (
                          <option key={province.Id} value={province.Id}>{province.Name}</option>
                          ))}
                      </Select>
                  </FormControl>
                  <FormControl sx={{ mt: 2, ml: 2, minWidth: 200 }}>
                      <InputLabel htmlFor="grouped-select">Quận / Huyện</InputLabel>
                      <Select native defaultValue="" name='districts' id="grouped-districts-select" label="Quận / Huyện" onChange={handleDistrictChange}>
                          <option value="" disabled hidden>   </option>
                          {districts.map((district) => (
                          <option key={district.Id} value={district.Id}>{district.Name}</option>
                          ))}
                      </Select>
                  </FormControl>
                  <FormControl sx={{ mt: 2, ml:2, minWidth: 170 }}>
                      <InputLabel htmlFor="grouped-select">Xã / Phường</InputLabel>
                      <Select native defaultValue="" name='wards' id="grouped-wards-select" label="Xã / Phường" onChange={handleWardChange}>
                          <option value="" disabled hidden>   </option>
                          {wards.map((ward) => (
                          <option key={ward.Id} value={ward.Id}>{ward.Name}</option>
                          ))}
                      </Select>
                  </FormControl>
                </div>
              
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={2} sx={{mr: 6}}>
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

        <Card>
          <UserListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={USERLIST.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, name, role, status, company, avatarUrl, isVerified } = row;
                    const selectedUser = selected.indexOf(name) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, name)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={name} src={avatarUrl} />
                            <Typography variant="subtitle2" noWrap>
                              {name}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell align="left">{company}</TableCell>

                        <TableCell align="left">{role}</TableCell>

                        <TableCell align="left">{isVerified ? 'Yes' : 'No'}</TableCell>

                        <TableCell align="left">
                          <Label color={(status === 'banned' && 'error') || 'success'}>{sentenceCase(status)}</Label>
                        </TableCell>

                        <TableCell align="right">
                          <IconButton size="large" color="inherit" onClick={handleOpenMenu}>
                            <Iconify icon={'eva:more-vertical-fill'} />
                          </IconButton>
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
            count={USERLIST.length}
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
