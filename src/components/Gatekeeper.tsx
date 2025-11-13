// components/Gatekeeper.tsx
import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Alert,
  CircularProgress,
  Fade // Add this for smooth transitions
} from '@mui/material';
import { Lock, Security } from '@mui/icons-material';

interface GatekeeperProps {
  children: React.ReactNode;
}

const Gatekeeper: React.FC<GatekeeperProps> = ({ children }) => {
  const [accessCode, setAccessCode] = useState('');
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialCheck, setInitialCheck] = useState(true); // Separate initial check loading

  // Check if already verified on component mount
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        // Simulate a small delay to show loading (optional)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const storedCode = sessionStorage.getItem('gatekeeper_verified');
        if (storedCode === 'true') {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
        setIsVerified(false);
      } finally {
        setInitialCheck(false);
      }
    };

    checkVerificationStatus();
  }, []);

  const verifyCode = async (code: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/gatekeeper/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      // Add timeout handling
      const timeoutPromise = new Promise<Response>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const data = await Promise.race([response.json(), timeoutPromise]) as any;

      if (data.success) {
        sessionStorage.setItem('gatekeeper_verified', 'true');
        setIsVerified(true);
      } else {
        setError(data.error || 'Invalid access code');
        setIsVerified(false);
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError(error.message === 'Request timeout' 
        ? 'Request timed out. Please check your connection and try again.'
        : 'Failed to verify code. Please try again.'
      );
      setIsVerified(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (accessCode.trim()) {
      verifyCode(accessCode.trim());
    }
  };

  // Enhanced loading state with better UX
  if (initialCheck || isVerified === null) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        <Fade in={true} timeout={800}>
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <CircularProgress 
              size={60} 
              thickness={4}
              sx={{ 
                color: 'white',
                mb: 2
              }} 
            />
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Checking access permissions...
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, mt: 1 }}>
              Solomon Medicals & Stores
            </Typography>
          </Box>
        </Fade>
      </Box>
    );
  }

  // Show gatekeeper if not verified
  if (!isVerified) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 2,
        }}
      >
        <Fade in={true} timeout={500}>
          <Container maxWidth="sm">
            <Paper
              elevation={24}
              sx={{
                padding: 4,
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Loading overlay for form submission */}
              {loading && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      Verifying code...
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* Header */}
              <Box sx={{ mb: 4 }}>
                <Security 
                  sx={{ 
                    fontSize: 64, 
                    color: 'primary.main',
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '50%',
                    padding: 2,
                  }} 
                />
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Pharmacy Access
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enter the access code to continue to Solomon Medicals
                </Typography>
              </Box>

              {/* Access Code Form */}
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <TextField
                  fullWidth
                  label="Access Code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  margin="normal"
                  required
                  type="password"
                  disabled={loading} // Disable input during loading
                  InputProps={{
                    startAdornment: <Lock sx={{ color: 'text.secondary', mr: 1 }} />,
                  }}
                  placeholder="Enter the pharmacy access code"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: '1.1rem',
                    }
                  }}
                />

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mt: 2, 
                      borderRadius: 2,
                      animation: 'fadeIn 0.3s ease-in'
                    }}
                  >
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !accessCode.trim()}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                    },
                    position: 'relative',
                    minHeight: '48px', // Fixed height to prevent layout shift
                  }}
                >
                  {loading ? (
                    <CircularProgress 
                      size={24} 
                      sx={{ 
                        color: 'white',
                        position: 'absolute',
                      }} 
                    />
                  ) : (
                    'Enter Pharmacy'
                  )}
                </Button>
              </Box>

              {/* Instructions */}
              <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  💡 <strong>Note:</strong> Contact the pharmacy administrator if you don't have the access code.
                  This code is required to ensure the security of pharmacy operations.
                </Typography>
              </Box>
            </Paper>
          </Container>
        </Fade>
      </Box>
    );
  }

  // Render children if verified
  return <>{children}</>;
};

export default Gatekeeper;