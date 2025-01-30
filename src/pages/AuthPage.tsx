import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { User } from "../types";

interface AuthPageProps {
  onLogin: (token: string, user: User) => void;
}

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const AuthPage = ({ onLogin }: AuthPageProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    profileImage: null as File | null,
  });
  const [preview, setPreview] = useState<string>();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (formData.profileImage) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(formData.profileImage);
    } else {
      setPreview(undefined);
    }
  }, [formData.profileImage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await mockAuthApi(isSignUp, formData);
      if (response.success) {
        onLogin(response.token, response.user);
        navigate("/profile");
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, profileImage: e.target.files[0] });
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h5">
            {isSignUp ? "Sign Up" : "Login"}
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ mt: 3, width: "100%" }}
          >
            <Grid container spacing={2}>
              {isSignUp && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <IconButton component="label">
                        <CloudUpload />
                        <VisuallyHiddenInput
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </IconButton>
                      {preview && (
                        <Avatar
                          src={preview}
                          sx={{ width: 56, height: 56 }}
                          alt="Profile preview"
                        />
                      )}
                    </Box>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </Grid>
            </Grid>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : isSignUp ? (
                "Sign Up"
              ) : (
                "Login"
              )}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Already have an account? Login"
                : "Need an account? Sign Up"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

type AuthFormData = {
  email: string;
  password: string;
  name: string;
  profileImage: File | null;
};

const mockAuthApi = async (isSignUp: boolean, data: AuthFormData) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (isSignUp) {
    return {
      success: true,
      token: "mock-jwt-token",
      message: "Account created successfully.",
      user: {
        email: data.email,
        name: data.name,
        profileImage: data.profileImage
          ? URL.createObjectURL(data.profileImage)
          : undefined,
      },
    };
  }
  return {
    success: true,
    token: "mock-jwt-token",
    message: "Logged in successfully.",
    user: { email: data.email, name: "Test User" },
  };
};

export default AuthPage;
