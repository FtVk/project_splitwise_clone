import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import api from "../services/api";

const PaymentsPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [balances, setBalances] = useState([]);
  const [members, setMembers] = useState([]);
  const [fromUser, setFromUser] = useState("");
  const [toUser, setToUser] = useState("");
  const [category, setCategory] = useState("Payment");
  const [explanation, setExplanation] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [foundUser, setFoundUser] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    api.fetchGroups().then(setGroups).catch(console.error);
  }, []);

  const loadBalanceGraph = (groupName) => {
    api
      .simplifyDebts(groupName)
      .then(() => api.fetchBalanceData(groupName))
      .then((data) => {
        setSelectedGroup(groupName);
        setBalances(data.edges || []);
      })
      .catch(console.error);
  };

  const handlePayment = (from, to, amount) => {
    const confirm = window.confirm(
      `Are you sure the payment of $${amount} from ${from} to ${to} is completed?`
    );
    if (confirm) {
      api
        .addTransaction(selectedGroup, {
          from_user: to,
          to_user: from,
          amount,
          category: "payment",
          timestamp: new Date().toISOString(),
        })
        .then(() => {
          setSnackbar({
            open: true,
            message: `Payment of $${amount} from ${from} to ${to} recorded successfully!`,
            severity: "success"
          });
          loadBalanceGraph(selectedGroup);
        })
        .catch(() =>
          setSnackbar({open: true, message: "Failed to record payment. Please try again.", severity: "error"})
        );
    }
  };
  

  const handleGroupClick = (groupName) => {
    loadBalanceGraph(groupName);
    api.fetchGroupMembers(groupName).then(setMembers).catch(console.error);
  };

  const handleAddPayment = async () => {
    if (!selectedGroup || !fromUser || !toUser || !amount) {
      alert("Please fill out all fields.");
      return;
    }

    const transactionData = {
      from_user: fromUser,
      to_user: toUser,
      amount: parseFloat(amount),
      category,
      explanation,
    };

    try {
      await api.addTransaction(selectedGroup, transactionData);
      alert("Payment added successfully!");
      loadBalanceGraph(selectedGroup);
      setFromUser("");
      setToUser("");
      setExplanation("");
      setAmount("");
      setCurrency("USD");
      setFoundUser("");
    } catch (error) {
      alert("Failed to add payment. Please try again.");
    }
  };

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCameraClick = async (setSelectedFile) => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  
        // Create a container for the video and image preview
        const container = document.createElement("div");
        container.style.position = "fixed";
        container.style.top = "0";
        container.style.left = "0";
        container.style.width = "100%";
        container.style.height = "100%";
        container.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        container.style.zIndex = "1000";
        container.style.overflowY = "auto";
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.padding = "20px";
        document.body.appendChild(container);
  
        // Create and add the video element
        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.setAttribute("playsinline", true);
        videoElement.autoplay = true;
        videoElement.style.maxWidth = "100%";
        videoElement.style.borderRadius = "10px";
        container.appendChild(videoElement);
  
        // Wait for the video to load
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = () => resolve();
        });
  
        // Create and add the "Capture Photo" button
        const captureButton = document.createElement("button");
        captureButton.textContent = "Capture Photo";
        captureButton.style.marginTop = "10px";
        captureButton.style.padding = "10px 20px";
        captureButton.style.backgroundColor = "#00796b";
        captureButton.style.color = "#ffffff";
        captureButton.style.border = "none";
        captureButton.style.borderRadius = "5px";
        captureButton.style.cursor = "pointer";
        container.appendChild(captureButton);
  
        // Create an element to display the captured photo
        const imgElement = document.createElement("img");
        imgElement.style.marginTop = "10px";
        imgElement.style.display = "none"; // Initially hidden
        imgElement.style.maxWidth = "90%";
        imgElement.style.borderRadius = "10px";
        container.appendChild(imgElement);
  
        // Create the "Submit Photo" button
        const submitButton = document.createElement("button");
        submitButton.textContent = "Submit Photo";
        submitButton.style.marginTop = "10px";
        submitButton.style.padding = "10px 20px";
        submitButton.style.backgroundColor = "#4caf50";
        submitButton.style.color = "#ffffff";
        submitButton.style.border = "none";
        submitButton.style.borderRadius = "5px";
        submitButton.style.cursor = "pointer";
        submitButton.style.display = "none"; // Initially hidden
        container.appendChild(submitButton);
  
        // Handle photo capture
        let capturedFile = null;
        captureButton.addEventListener("click", () => {
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
  
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
          canvas.toBlob((blob) => {
            if (blob) {
              capturedFile = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
  
              // Display the captured photo
              imgElement.src = URL.createObjectURL(blob);
              imgElement.style.display = "block"; // Make the image visible
  
              // Show the "Submit Photo" button
              submitButton.style.display = "inline-block";
            }
          });
        });
  
        // Handle photo submission
        submitButton.addEventListener("click", () => {
          if (capturedFile) {
            setSelectedFile(capturedFile);
            alert("Photo submitted successfully!");
            closeContainer();
          }
        });
  
        // Create and add the "Close" button
        const closeButton = document.createElement("button");
        closeButton.textContent = "Close";
        closeButton.style.marginTop = "10px";
        closeButton.style.padding = "10px 20px";
        closeButton.style.backgroundColor = "#ff5252";
        closeButton.style.color = "#ffffff";
        closeButton.style.border = "none";
        closeButton.style.borderRadius = "5px";
        closeButton.style.cursor = "pointer";
        container.appendChild(closeButton);
  
        closeButton.addEventListener("click", () => {
          closeContainer();
        });
  
        const closeContainer = () => {
          // Stop the video stream
          stream.getTracks().forEach((track) => track.stop());
          // Remove the container
          document.body.removeChild(container);
        };
      } catch (error) {
        console.error("Error accessing the camera:", error);
        alert("Unable to access the camera. Please check permissions.");
      }
    } else {
      alert("Camera not supported in this browser");
    }
  };  
  

  const handleScan = async () => {
    if (!selectedFile) {
      alert("Please provide a photo.");
      return;
    }
  
    if (!toUser ) {
      alert("Please select To User.");
      return;
    }
  
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("name", toUser );
  
    try {
      const receiptData = await api.scanPayment(formData);
      
      setAmount(receiptData.amount);
      setFoundUser (receiptData.name_found);
  
    } catch (error) {
      // Check if the error response has a specific message
      if (error.response && error.response.data && error.response.data.error) {
        setSnackbar({
          open: true,
          message: error.response.data.error,
          severity: "error",
        });
      } else {
        console.error("Error processing the photo:", error);
        setSnackbar({
          open: true,
          message: "An unexpected error occurred. Please try again.",
          severity: "error",
        });
      }
    }
  };

  const handleAmountChange = (value) => {
    // Convert the value to a number
    const numericValue = Number(value);
  
    // Check if the value is a valid number and greater than or equal to 0
    if (!isNaN(numericValue) && numericValue >= 0) {
      // Update the state or perform the necessary action
      setAmount(numericValue);
    } else {
      // Optionally, you can handle invalid input here (e.g., show an error message)
      console.log("Invalid input. Please enter a positive number.");
    }
  };
  
  
  return (
    <Box sx={{ padding: 4 }}>
      <Typography
        variant="h4"
        sx={{ fontWeight: "bold", color: "#1e3a8a", textAlign: "center", marginBottom: 4 }}
      >
        Payments Page
      </Typography>
  
      {/* Group Cards */}
      <Box sx={{ marginBottom: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
          Select a Group
        </Typography>
        <Grid container spacing={2}>
          {groups.map((group) => (
            <Grid item xs={12} sm={6} md={4} key={group}>
              <Card
                sx={{
                  backgroundColor: "#f1f5f9",
                  borderRadius: 4,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  "&:hover": { boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)" },
                }}
                onClick={() => handleGroupClick(group)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1e40af" }}>
                    {group}
                  </Typography>
                  <Typography sx={{ color: "#64748b" }}>Click to view balances</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
  
      {/* Balances Section */}
      {selectedGroup && (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            Balances for Group: {selectedGroup}
          </Typography>
          {balances.length === 0 ? (
            <Typography variant="h6" sx={{ color: "#4caf50", textAlign: "center", marginTop: 4 }}>
              All debts in this group are settled!
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {balances.map(({ from, to, amount }, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card
                    sx={{
                      backgroundColor: "#e0f7fa",
                      borderRadius: 4,
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <CardContent>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: "#00796b" }}>
                        {from} owes {to}
                      </Typography>
                      <Typography variant="h6" sx={{ color: "#004d40", fontWeight: "bold" }}>
                        ${amount.toFixed(2)}
                      </Typography>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          backgroundColor: "#00796b",
                          color: "#ffffff",
                          marginTop: 1,
                          "&:hover": { backgroundColor: "#004d40" },
                        }}
                        onClick={() => handlePayment(from, to, amount)}
                      >
                        Record Payment
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
  
          {/* Custom Payment Form */}
          <Box mt={4}>
            <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              Custom Payment
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel>Select From User</InputLabel>
              <Select value={fromUser} onChange={(e) => setFromUser(e.target.value)}>
                {members.map((member) => (
                  <MenuItem key={member} value={member}>
                    {member}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <FormControl fullWidth margin="normal">
              <InputLabel>Select To User</InputLabel>
              <Select value={toUser} onChange={(e) => setToUser(e.target.value)}>
                {members.map((member) => (
                  <MenuItem key={member} value={member}>
                    {member}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
  
            <TextField
              label="Category"
              value={category}
              fullWidth
              margin="normal"
              disabled
            />
            <TextField
              label="Explanation"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              inputProps={{ min: 0 }} // Prevent negative numbers
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>Currency</InputLabel>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <MenuItem value="USD">USD</MenuItem>
                <MenuItem value="EUR">EUR</MenuItem>
                <MenuItem value="IRR">IRR</MenuItem>
              </Select>
            </FormControl>
            {/* Conditional message display */}
            {foundUser !== "" && (
              <Typography
                variant="h6"
                sx={{
                  color: foundUser ? "#61bb82 " : "#e86448",
                  fontWeight: "bold",
                  marginTop: 2,
                }}
              >
                {foundUser
                  ? `The name ${toUser} has been found in the receipt!`
                  : `The name ${toUser} has not been found in the receipt.`}
              </Typography>
            )}

            <Button variant="contained" color="primary" onClick={handleAddPayment}>
              Add Payment
            </Button>
          </Box>
  
          {/* Receipt Scanning Section */}
          <Box mt={4} id="camera-root">
            <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
              Scan Receipt
            </Typography>
            <input
              accept="image/*"
              type="file"
              onChange={handleFileUpload}
              style={{ display: "none" }}
              id="upload-button"
            />
            <label htmlFor="upload-button">
              <Button variant="contained" component="span" color="secondary" sx={{ marginRight: 2 }}>
                Upload Receipt
              </Button>
            </label>
            <Button variant="contained" color="success" onClick={() => handleCameraClick(setSelectedFile)}>
              Use Camera
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleScan}
              sx={{ marginLeft: 2 }}
            >
              Scan 
            </Button>
          </Box>
        </Box>
      )}
  
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};  


export default PaymentsPage;
