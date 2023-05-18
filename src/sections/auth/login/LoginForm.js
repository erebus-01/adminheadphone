import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({})

  const handleClick = () => {
    navigate('/dashboard', { replace: true });
  };

  const handleForm = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmitLogin = async (e) => {
    e.preventDefault()
    const response = await fetch('http://localhost:5000/auth/v1/admin/controller/login', {
      method: 'POST',
      body: JSON.stringify(form),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    localStorage.setItem('token', data.accessToken)
    if(data.accessToken !== undefined){
      const responseToken = await fetch('http://localhost:5000/auth/v1/admin/controller/currentToken', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${data.accessToken}`
        }
      })
      const dataToken = await responseToken.json();
      navigate('/')
    }
  }

  return (
    <>
      <form onSubmit={handleSubmitLogin}>
        <Stack spacing={3}>
          <TextField name="email" label="Email address" form={form || ''} onChange={handleForm} />

          <TextField
            name="password"
            label="Password"
            form={form || ''} onChange={handleForm}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
          <Checkbox name="remember" label="Remember me" />
          <Link variant="subtitle2" underline="hover">
            Forgot password?
          </Link>
        </Stack>

        <LoadingButton fullWidth size="large" type="submit" variant="contained">
          Login
        </LoadingButton>

      </form>
    </>
  );
}
