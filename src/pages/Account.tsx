// pages/Account.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert, 
  Tabs, 
  Tab,
  Card,
  CardContent,
  Divider,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  Key, 
  Person, 
  VpnKey, 
  Visibility, 
  VisibilityOff,
  Close,
  Warning,
  CheckCircle
} from '@mui/icons-material';

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
      {value === index && <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>}
    </div>
  );
}

interface User {
  id: number;
  username: string;
}

const Account: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [tabValue, setTabValue] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [modalMessage, setModalMessage] = useState<{ type: 'success' | 'error'; title: string; content: string } | null>(null);

  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showCreateConfirmPassword, setShowCreateConfirmPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);

  // Login state
  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  // Create account state
  const [createAccountData, setCreateAccountData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    securityQuestion1: 'What is your pharmacy name?',
    securityAnswer1: '',
    securityQuestion2: 'What city is your pharmacy located?',
    securityAnswer2: ''
  });

  // Reset password state
  const [resetPasswordData, setResetPasswordData] = useState({
    username: '',
    securityAnswer1: '',
    securityAnswer2: '',
    recoveryCode: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  // Change password state
  const [changePasswordData, setChangePasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [securityQuestions, setSecurityQuestions] = useState<{
    question1: string;
    question2: string;
  } | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await fetch('https://inventory-system-server-wx3t.onrender.com/api/auth/verify-token', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.data.user);
        } else {
          localStorage.removeItem('authToken');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      }
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
  };

  const showModalMessage = (type: 'success' | 'error', title: string, content: string) => {
    setModalMessage({ type, title, content });
  };

  // Password visibility toggle handlers
  const handleClickShowPassword = (field: string) => {
    switch (field) {
      case 'login': setShowLoginPassword(!showLoginPassword); break;
      case 'create': setShowCreatePassword(!showCreatePassword); break;
      case 'createConfirm': setShowCreateConfirmPassword(!showCreateConfirmPassword); break;
      case 'reset': setShowResetPassword(!showResetPassword); break;
      case 'resetConfirm': setShowResetConfirmPassword(!showResetConfirmPassword); break;
      case 'current': setShowCurrentPassword(!showCurrentPassword); break;
      case 'new': setShowNewPassword(!showNewPassword); break;
      case 'newConfirm': setShowNewConfirmPassword(!showNewConfirmPassword); break;
    }
  };

  // Login function
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginData.username || !loginData.password) {
      showMessage('error', 'Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('https://inventory-system-server-wx3t.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('authToken', data.data.token);
        setUser(data.data.user);
        showMessage('success', 'Login successful!');
        setLoginData({ username: '', password: '' });
      } else {
        showMessage('error', data.error || 'Login failed');
      }
    } catch (error) {
      showMessage('error', 'Login failed. Please try again.');
    }
  };

  // Create account function
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (createAccountData.password !== createAccountData.confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    if (createAccountData.password.length < 6) {
      showMessage('error', 'Password must be at least 6 characters long');
      return;
    }

    try {
      const response = await fetch('https://inventory-system-server-wx3t.onrender.com/api/auth/create-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: createAccountData.username,
          password: createAccountData.password,
          securityQuestion1: createAccountData.securityQuestion1,
          securityAnswer1: createAccountData.securityAnswer1,
          securityQuestion2: createAccountData.securityQuestion2,
          securityAnswer2: createAccountData.securityAnswer2
        })
      });

      const data = await response.json();

      if (data.success) {
        showModalMessage(
          'success', 
          'Account Created Successfully!',
          `Your recovery code is: ${data.data.recoveryCode}\n\n⚠️ IMPORTANT: Save this recovery code in a safe place! You will need it to reset your password if you forget it.`
        );
        setCreateAccountData({
          username: '',
          password: '',
          confirmPassword: '',
          securityQuestion1: 'What is your pharmacy name?',
          securityAnswer1: '',
          securityQuestion2: 'What city is your pharmacy located?',
          securityAnswer2: ''
        });
        setTabValue(0); // Switch to login tab
      } else {
        showMessage('error', data.error || 'Account creation failed');
      }
    } catch (error) {
      showMessage('error', 'Account creation failed. Please try again.');
    }
  };

  // Get security questions for password reset
  const handleGetSecurityQuestions = async (username: string) => {
    if (!username) return;

    try {
      const response = await fetch(`https://inventory-system-server-wx3t.onrender.com/api/auth/security-questions/${username}`);
      const data = await response.json();

      if (data.success) {
        setSecurityQuestions(data.data);
      } else {
        showMessage('error', 'User not found');
      }
    } catch (error) {
      showMessage('error', 'Failed to get security questions');
    }
  };

  // Reset password function
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (resetPasswordData.newPassword !== resetPasswordData.confirmNewPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    try {
      const response = await fetch('https://inventory-system-server-wx3t.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: resetPasswordData.username,
          securityAnswer1: resetPasswordData.securityAnswer1,
          securityAnswer2: resetPasswordData.securityAnswer2,
          recoveryCode: resetPasswordData.recoveryCode,
          newPassword: resetPasswordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        showModalMessage(
          'success',
          'Password Reset Successfully!',
          `Your new recovery code is: ${data.data.recoveryCode}\n\n⚠️ IMPORTANT: Save this new recovery code in a safe place! Your old recovery code will no longer work.`
        );
        setResetPasswordData({
          username: '',
          securityAnswer1: '',
          securityAnswer2: '',
          recoveryCode: '',
          newPassword: '',
          confirmNewPassword: ''
        });
        setSecurityQuestions(null);
        setTabValue(0); // Switch to login tab
      } else {
        showMessage('error', data.error || 'Password reset failed');
      }
    } catch (error) {
      showMessage('error', 'Password reset failed. Please try again.');
    }
  };

  // Change password function (when logged in)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (changePasswordData.newPassword !== changePasswordData.confirmNewPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    const token = localStorage.getItem('authToken');
    if (!token) {
      showMessage('error', 'Not authenticated');
      return;
    }

    try {
      const response = await fetch('https://inventory-system-server-wx3t.onrender.com/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: changePasswordData.currentPassword,
          newPassword: changePasswordData.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Password changed successfully!');
        setChangePasswordData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      } else {
        showMessage('error', data.error || 'Password change failed');
      }
    } catch (error) {
      showMessage('error', 'Password change failed. Please try again.');
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    showMessage('success', 'Logged out successfully');
  };

  if (user) {
    return (
      <Container maxWidth="sm" sx={{ mt: { xs: 2, sm: 4 }, p: { xs: 1, sm: 2 } }}>
        <Card>
          <CardContent>
            <Box textAlign="center" mb={3}>
              <Person sx={{ fontSize: { xs: 48, sm: 64 }, color: 'primary.main', mb: 2 }} />
              <Typography variant={isMobile ? "h5" : "h4"} gutterBottom>
                Welcome, {user.username}!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You are successfully logged in as the pharmacy owner.
              </Typography>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Change Password
            </Typography>
            <form onSubmit={handleChangePassword}>
              <TextField
                fullWidth
                type={showCurrentPassword ? "text" : "password"}
                label="Current Password"
                value={changePasswordData.currentPassword}
                onChange={(e) => setChangePasswordData({
                  ...changePasswordData,
                  currentPassword: e.target.value
                })}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleClickShowPassword('current')}
                        edge="end"
                      >
                        {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showNewPassword ? "text" : "password"}
                label="New Password"
                value={changePasswordData.newPassword}
                onChange={(e) => setChangePasswordData({
                  ...changePasswordData,
                  newPassword: e.target.value
                })}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleClickShowPassword('new')}
                        edge="end"
                      >
                        {showNewPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                type={showNewConfirmPassword ? "text" : "password"}
                label="Confirm New Password"
                value={changePasswordData.confirmNewPassword}
                onChange={(e) => setChangePasswordData({
                  ...changePasswordData,
                  confirmNewPassword: e.target.value
                })}
                margin="normal"
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => handleClickShowPassword('newConfirm')}
                        edge="end"
                      >
                        {showNewConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
              >
                Change Password
              </Button>
            </form>

            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 2 }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Snackbar */}
        <Snackbar
          open={!!message}
          autoHideDuration={5000}
          onClose={() => setMessage(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{ 
            mt: 7,
            '& .MuiAlert-root': {
              fontSize: '1rem',
              minWidth: isMobile ? '90vw' : '400px'
            }
          }}
        >
          <Alert 
            severity={message?.type} 
            onClose={() => setMessage(null)}
            icon={message?.type === 'success' ? <CheckCircle /> : <Warning />}
          >
            {message?.text}
          </Alert>
        </Snackbar>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: { xs: 1, sm: 4 }, p: { xs: 1, sm: 2 } }}>
      <Paper elevation={3} sx={{ maxWidth: '100%', overflow: 'hidden' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={(_, newValue) => setTabValue(newValue)}
            variant={isMobile ? "scrollable" : "fullWidth"}
            scrollButtons={isMobile ? "auto" : false}
            allowScrollButtonsMobile
          >
            <Tab icon={<Key />} label="Login" />
            <Tab icon={<Person />} label="Create Account" />
            <Tab icon={<VpnKey />} label="Reset Password" />
          </Tabs>
        </Box>

        {/* Login Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box component="form" onSubmit={handleLogin}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom align="center">
              Pharmacy Owner Login
            </Typography>
            <TextField
              fullWidth
              label="Username"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              type={showLoginPassword ? "text" : "password"}
              label="Password"
              value={loginData.password}
              onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword('login')}
                      edge="end"
                    >
                      {showLoginPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size={isMobile ? "medium" : "large"}
              sx={{ mt: 3 }}
            >
              Login
            </Button>
          </Box>
        </TabPanel>

        {/* Create Account Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box component="form" onSubmit={handleCreateAccount}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom align="center">
              Create Owner Account
            </Typography>
            <TextField
              fullWidth
              label="Username"
              value={createAccountData.username}
              onChange={(e) => setCreateAccountData({ ...createAccountData, username: e.target.value })}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              type={showCreatePassword ? "text" : "password"}
              label="Password"
              value={createAccountData.password}
              onChange={(e) => setCreateAccountData({ ...createAccountData, password: e.target.value })}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword('create')}
                      edge="end"
                    >
                      {showCreatePassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              type={showCreateConfirmPassword ? "text" : "password"}
              label="Confirm Password"
              value={createAccountData.confirmPassword}
              onChange={(e) => setCreateAccountData({ ...createAccountData, confirmPassword: e.target.value })}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => handleClickShowPassword('createConfirm')}
                      edge="end"
                    >
                      {showCreateConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            
            <Typography variant={isMobile ? "subtitle1" : "h6"} sx={{ mt: 3, mb: 2 }}>
              Security Questions
            </Typography>
            
            <TextField
              fullWidth
              label="Security Question 1"
              value={createAccountData.securityQuestion1}
              margin="normal"
              disabled
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              label="Answer 1"
              value={createAccountData.securityAnswer1}
              onChange={(e) => setCreateAccountData({ ...createAccountData, securityAnswer1: e.target.value })}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
            />
            
            <TextField
              fullWidth
              label="Security Question 2"
              value={createAccountData.securityQuestion2}
              margin="normal"
              disabled
              size={isMobile ? "small" : "medium"}
            />
            <TextField
              fullWidth
              label="Answer 2"
              value={createAccountData.securityAnswer2}
              onChange={(e) => setCreateAccountData({ ...createAccountData, securityAnswer2: e.target.value })}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              size={isMobile ? "medium" : "large"}
              sx={{ mt: 3 }}
            >
              Create Account
            </Button>
          </Box>
        </TabPanel>

        {/* Reset Password Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box component="form" onSubmit={handleResetPassword}>
            <Typography variant={isMobile ? "h6" : "h5"} gutterBottom align="center">
              Reset Password
            </Typography>
            
            <TextField
              fullWidth
              label="Username"
              value={resetPasswordData.username}
              onChange={(e) => {
                setResetPasswordData({ ...resetPasswordData, username: e.target.value });
                if (e.target.value) {
                  handleGetSecurityQuestions(e.target.value);
                }
              }}
              margin="normal"
              required
              size={isMobile ? "small" : "medium"}
            />

            {securityQuestions && (
              <>
                <TextField
                  fullWidth
                  label={securityQuestions.question1}
                  value={resetPasswordData.securityAnswer1}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, securityAnswer1: e.target.value })}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  label={securityQuestions.question2}
                  value={resetPasswordData.securityAnswer2}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, securityAnswer2: e.target.value })}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  label="Recovery Code"
                  value={resetPasswordData.recoveryCode}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, recoveryCode: e.target.value })}
                  margin="normal"
                  required
                  helperText="Enter the recovery code you received when creating your account"
                  size={isMobile ? "small" : "medium"}
                />
                <TextField
                  fullWidth
                  type={showResetPassword ? "text" : "password"}
                  label="New Password"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('reset')}
                          edge="end"
                        >
                          {showResetPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  type={showResetConfirmPassword ? "text" : "password"}
                  label="Confirm New Password"
                  value={resetPasswordData.confirmNewPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmNewPassword: e.target.value })}
                  margin="normal"
                  required
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => handleClickShowPassword('resetConfirm')}
                          edge="end"
                        >
                          {showResetConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size={isMobile ? "medium" : "large"}
                  sx={{ mt: 3 }}
                >
                  Reset Password
                </Button>
              </>
            )}
          </Box>
        </TabPanel>
      </Paper>

      {/* Enhanced Snackbar */}
      <Snackbar
        open={!!message}
        autoHideDuration={5000}
        onClose={() => setMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ 
          mt: 7,
          '& .MuiAlert-root': {
            fontSize: '1rem',
            minWidth: isMobile ? '90vw' : '400px'
          }
        }}
      >
        <Alert 
          severity={message?.type} 
          onClose={() => setMessage(null)}
          icon={message?.type === 'success' ? <CheckCircle /> : <Warning />}
        >
          {message?.text}
        </Alert>
      </Snackbar>

      {/* Modal for important messages (recovery codes) */}
      <Dialog
        open={!!modalMessage}
        onClose={() => setModalMessage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          backgroundColor: modalMessage?.type === 'success' ? '#4caf50' : '#f44336',
          color: 'white'
        }}>
          {modalMessage?.type === 'success' ? <CheckCircle /> : <Warning />}
          {modalMessage?.title}
          <IconButton
            onClick={() => setModalMessage(null)}
            sx={{ color: 'white', ml: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
            {modalMessage?.content}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setModalMessage(null)} 
            variant="contained" 
            color="primary"
            fullWidth
            size="large"
          >
            I Understand
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Account;