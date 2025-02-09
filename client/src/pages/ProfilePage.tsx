import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import { CloudUpload, Logout } from "@mui/icons-material";
import { styled } from "@mui/material/styles";

import { api } from "../utils";
import { User } from "../types";

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

interface ProfilePageProps {
  user: User;
  token: string;
  onLogout: () => void;
  onProfileUpdate: (updatedUser: User) => void;
}

const ProfilePage = ({
  user,
  token,
  onLogout,
  onProfileUpdate,
}: ProfilePageProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFetchImage = async () => {
    if (!token || !user) return;

    setLoading(true);
    try {
      const response = await api.get("/getProfileImage", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const imageSrc = `data:${response.headers["Content-Type"]};base64,${response.data}`;
      onProfileUpdate({ ...user, profileImage: imageSrc });
    } catch (error) {
      console.error("Failed to fetch image:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !token || !user) return;
    setLoading(true);

    try {
      const response = await api.post("/updateProfileImage", {
        fileType: selectedFile.type,
      });

      const { presignedUrl, profileImage } = response.data;

      await axios.put(presignedUrl, selectedFile, {
        headers: { "Content-Type": selectedFile.type },
      });

      const updatedUser = { ...user, profileImage };
      onProfileUpdate(updatedUser);
      handleFetchImage();
      setPreview(undefined);
      setSelectedFile(null);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4, borderRadius: 2 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
            Profile
          </Typography>

          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={preview || user?.profileImage || "/default-avatar.png"}
                  sx={{ width: 200, height: 200, mb: 2 }}
                />

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                  >
                    Select Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>

                  <Button
                    variant="contained"
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      "Upload Image"
                    )}
                  </Button>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} md={8}>
              <List sx={{ width: "100%" }}>
                <ListItem>
                  <ListItemText
                    primary="Name"
                    secondary={user?.name}
                    secondaryTypographyProps={{ variant: "h6" }}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Email"
                    secondary={user?.email}
                    secondaryTypographyProps={{ variant: "h6" }}
                  />
                </ListItem>
              </List>

              <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Logout />}
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;
