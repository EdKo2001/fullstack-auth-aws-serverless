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
  FormLabel,
} from "@mui/material";
import { CloudUpload } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import { User } from "../types";
import { api } from "../utils"; // Assumes you have an Axios instance configured
import axios from "axios";

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
      if (isSignUp) {
        const fileType = formData.profileImage?.type || "image/jpeg";
        const response = await api.post("/signup", {
          ...formData,
          fileType,
        });
        const { token, user, presignedUrl } = response.data;

        if (formData.profileImage && presignedUrl) {
          await axios
            .put(presignedUrl, formData.profileImage, {
              headers: { "Content-Type": fileType },
            })
            .catch((err) => console.error(err));
        }
        onLogin(token, user);
      } else {
        const response = await api.post("/login", {
          email: formData.email,
          password: formData.password,
        });
        const { token, user } = response.data;
        onLogin(token, user);
      }
      navigate("/profile");
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.message || "Authentication failed");
      } else {
        setError("Authentication failed");
      }
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

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      profileImage: null,
    });
    setPreview(undefined);
    setError("");
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
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
          <Typography
            component="h1"
            variant="h5"
            sx={{ fontWeight: 600, mb: 2 }}
          >
            {isSignUp ? "Sign Up" : "Login"}
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
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
                    <FormLabel
                      component="legend"
                      sx={{ fontSize: 14, fontWeight: 600 }}
                    >
                      Profile Image
                    </FormLabel>
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
                  sx={{ marginBottom: 2 }}
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
              <Alert severity="error" sx={{ mt: 2, borderRadius: 1 }}>
                {error}
              </Alert>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                padding: 1.5,
                borderRadius: 2,
                backgroundColor: "#1976d2",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
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
              onClick={toggleAuthMode}
              sx={{
                mt: 1,
                padding: 1.5,
                borderRadius: 2,
                borderColor: "#1976d2",
                "&:hover": { borderColor: "#1565c0", color: "#1565c0" },
              }}
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

export default AuthPage;
