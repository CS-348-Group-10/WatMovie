import { useState } from 'react';
import { Box, Button, TextField, Typography, Tab, Tabs, Paper, Container, Alert } from '@mui/material';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box className="p-3">
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Auth() {
  const [tabValue, setTabValue] = useState(0);
  const router = useRouter();
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!loginForm.email || !loginForm.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams({
        email: loginForm.email.trim(),
        password: loginForm.password,
      });

      const response = await fetch(`/api/users?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message);
        return;
      }

      localStorage.setItem('userId', data.id);
      router.push('/');

    } catch (err) {
      console.error('Login error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!signupForm.firstName || !signupForm.lastName || !signupForm.email || !signupForm.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: signupForm.firstName.trim(),
          last_name: signupForm.lastName.trim(),
          email: signupForm.email.trim(),
          password: signupForm.password
        })
      });
      const data = await response.json();
      console.log(response);

      if (!response.ok) {
        setError(data.message || 'Failed to create account. Please try again.');
        return;
      }

      // If signup is successful, log the user in
      localStorage.setItem('userId', data.id);
      router.push('/');

    } catch (err) {
      console.error('Signup error:', err);
      setError('Unable to connect to server. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="min-h-screen flex flex-col bg-white text-gray-800">
      <Container maxWidth="lg" className="flex-1 flex flex-col justify-center py-4">
        <Box className="flex flex-col items-center mb-4">
          <Image 
            src="/logo.png" 
            alt="WatMovie Logo"
            width={200}
            height={200}
            className="mb-8"
          />
          <Typography variant="h4" component="h1" className="font-bold text-gray-800 mb-2">
            Welcome to WatMovie
          </Typography>
          <Typography variant="subtitle1" className="text-gray-600 mb-4">
            Your personal movie companion
          </Typography>
        </Box>

        <Box className="flex justify-center">
          <Paper 
            elevation={3} 
            className="w-full max-w-[500px] bg-white border border-gray-200"
          >
            <Box className="border-b border-gray-200">
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                aria-label="auth tabs"
                className="[&_.MuiTab-root]:text-gray-600 [&_.Mui-selected]:text-[#FFB800]"
              >
                <Tab label="Login" />
                <Tab label="Sign Up" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {error && (
                <Alert severity="error" className="mb-4">
                  {error}
                </Alert>
              )}
              <form onSubmit={handleLogin}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="[&_.MuiOutlinedInput-root]:border-gray-200 [&_.MuiOutlinedInput-root:hover]:border-gray-300 [&_.MuiInputLabel-root]:text-gray-600"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  margin="normal"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className="[&_.MuiOutlinedInput-root]:border-gray-200 [&_.MuiOutlinedInput-root:hover]:border-gray-300 [&_.MuiInputLabel-root]:text-gray-600"
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  disabled={loading}
                  className="mt-3 bg-[#FFB800] hover:bg-[#FFA500]"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <form onSubmit={handleSignup}>
                <TextField
                  fullWidth
                  label="First Name"
                  margin="normal"
                  value={signupForm.firstName}
                  onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                  required
                  className="[&_.MuiOutlinedInput-root]:border-gray-200 [&_.MuiOutlinedInput-root:hover]:border-gray-300 [&_.MuiInputLabel-root]:text-gray-600"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  margin="normal"
                  value={signupForm.lastName}
                  onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                  required
                  className="[&_.MuiOutlinedInput-root]:border-gray-200 [&_.MuiOutlinedInput-root:hover]:border-gray-300 [&_.MuiInputLabel-root]:text-gray-600"
                />
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  margin="normal"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                  className="[&_.MuiOutlinedInput-root]:border-gray-200 [&_.MuiOutlinedInput-root:hover]:border-gray-300 [&_.MuiInputLabel-root]:text-gray-600"
                />
                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  margin="normal"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                  className="[&_.MuiOutlinedInput-root]:border-gray-200 [&_.MuiOutlinedInput-root:hover]:border-gray-300 [&_.MuiInputLabel-root]:text-gray-600"
                />
                <Button
                  fullWidth
                  variant="contained"
                  type="submit"
                  className="mt-3 bg-[#FFB800] hover:bg-[#FFA500]"
                >
                  Sign Up
                </Button>
              </form>
            </TabPanel>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
} 