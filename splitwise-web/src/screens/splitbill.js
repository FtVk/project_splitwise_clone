import React, { useState, useEffect } from "react";
import api from "../services/api";
import { convertCurrency } from "../services/currency_conversion";
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
  Checkbox,
  Box,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from "@mui/material";

const SplitBill = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [members, setMembers] = useState([]);
  const [payer, setPayer] = useState("");
  const [whoAte, setWhoAte] = useState({});
  const [splitMethod, setSplitMethod] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [category, setCategory] = useState("");
  const [explanation, setExplanation] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "" });
  const [currency, setCurrency] = useState("USD");
  const [selectedFile, setSelectedFile] = useState(null);
  const [foodList, setFoodList] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [receiptDetails, setReceiptDetails] = useState({});
  const [splitEqually, setSplitEqually] = useState(false);

  // Fetch all groups on component mount
  useEffect(() => {
    api.fetchGroups().then(setGroups).catch(console.error);
  }, []);

  // Fetch members when a group is selected
  useEffect(() => {
    if (selectedGroup) {
      api.fetchGroupMembers(selectedGroup).then(setMembers).catch(console.error);
    }
  }, [selectedGroup]);

  const handleGroupClick = (groupName) => {
    setSelectedGroup(groupName);
    api
      .fetchGroupMembers(groupName)
      .then((members) => {
        const initialWhoAte = members.reduce((acc, member) => ({ ...acc, [member]: "" }), {});
        setWhoAte(initialWhoAte);
      })
      .catch(console.error);
  };

  const handleWhoAteChange = (member, value) => {

    if (!splitEqually) {
      // Convert the value to a number
      const numericValue = Number(value);
    
      // Check if the value is a valid number and greater than or equal to 0
      if (!isNaN(numericValue) && numericValue >= 0) {
        // Update the state or perform the necessary action
        setWhoAte((prev) => ({
          ...prev,
          [member]: numericValue,
        }));
      } else {
        // Optionally, you can handle invalid input here (e.g., show an error message)
        console.log("Invalid input. Please enter a positive number.");
      }
    }
  };

  const handleSplitEquallyChange = (event) => {
    const isChecked = event.target.checked;
    setSplitEqually(isChecked);

    if (isChecked) {
      setSplitMethod("ratio");
      const equalSplit = members.reduce((acc, member) => ({ ...acc, [member]: 1 }), {});
      setWhoAte(equalSplit);
    } else {
      // When unchecked, reset the amounts to an empty string
      const resetSplit = members.reduce((acc, member) => ({ ...acc, [member]: "" }), {});
      setWhoAte(resetSplit);
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
  
    const formData = new FormData();
    formData.append("photo", selectedFile);
  
    try {
      const receipt_data = await api.extractFoods(formData);
  
      setFoodList(receipt_data.foods);
      setReceiptDetails(receipt_data.receiptDetails);
  
      const initialAssignments = receipt_data.foods.reduce(
        (acc, food) => ({ ...acc, [food]: "" }),
        {}
      );
      setAssignments(initialAssignments);
  
      const membersResponse = await api.fetchGroupMembers(selectedGroup); // Fetch group members
      setMembers(membersResponse);
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


  const handleAssignmentChange = (food, member) => {
    setAssignments((prev) => ({
      ...prev,
      [food]: member,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedGroup || !payer || !category || !splitMethod) {
      setSnackbar({ open: true, message: "All fields are required.", severity: "error" });
      return;
    }

    if (splitMethod !== "amount" && !totalAmount) {
      setSnackbar({ open: true, message: "Total amount is required for ratio or percentage split.", severity: "error" });
      return;
    }

    const consumers = Object.keys(whoAte).filter((member) => whoAte[member] > 0);
    if (consumers.length === 0) {
      setSnackbar({ open: true, message: `Values for ${splitMethod} are required.`, severity: "error" });
      return;
    }

    const amounts = consumers.map((key) => whoAte[key]);

    // Convert amounts if splitMethod is "amount"
    const convertedAmounts = splitMethod === "amount"
    ? await Promise.all(amounts.map(async (amount) => {
        if (currency !== "USD") {
          return await convertCurrency(currency, "USD", parseFloat(amount));
        }
        // If currency is USD, return the original amount
        return parseFloat(amount); // If currency is USD, return the original amount
      }))
    : amounts;

    const convertedTotalAmount =
      currency !== "USD"
        ? await convertCurrency(currency, "USD", parseFloat(totalAmount))
        : parseFloat(totalAmount);

    const grTransactionData = {
      payer,
      consumers,
      splitMethod,
      amounts: convertedAmounts,
      totalAmount: convertedTotalAmount,
      category,
      explanation,
      timestamp: new Date().toISOString(),
    };

    try {
      await api.addSplitbill(selectedGroup, grTransactionData);
      setSnackbar({ open: true, message: "Transaction added successfully.", severity: "success" });
      setPayer("");
      setWhoAte({});
      setSplitMethod("");
      setTotalAmount("");
      setCategory("");
      setExplanation("");
      setCurrency("USD");
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to add transaction.", severity: "error" });
    }
  };

  const handleFoodAssignmentsSubmit = async () => {
    if (!selectedGroup || !payer || !category) {
      setSnackbar({ open: true, message: "Group, payer, and category are required.", severity: "error" });
      return;
    }
  
    // Validate that all foods are assigned to a user
    const assignedFoods = Object.keys(assignments).filter((food) => assignments[food]);
    if (assignedFoods.length !== foodList.length) {
      setSnackbar({ open: true, message: "All foods must be assigned to members.", severity: "error" });
      return;
    }
  
    // Extract receipt details
    const { items, tax } = receiptDetails || {};
    if (!items || !tax) {
      setSnackbar({ open: true, message: "Receipt details are incomplete.", severity: "error" });
      return;
    }
  
    // Generate the list of prices for each food item in foodList
    const pricesList = [];
    items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        pricesList.push(item.cost);
      }
    });
  
    // Calculate total food cost and tax amount
    const totalFoodCost = pricesList.reduce((sum, price) => sum + price, 0);
    const taxAmount = tax.amount;
  
    // Calculate user amounts based on food assignments
    const userAmounts = {};
    foodList.forEach((food, index) => {
      const assignedUser = assignments[food];
      if (assignedUser) {
        const foodPrice = pricesList[index];
        const foodTax = (foodPrice / totalFoodCost) * taxAmount;
  
        if (!userAmounts[assignedUser]) userAmounts[assignedUser] = 0;
        userAmounts[assignedUser] += foodPrice + foodTax;
      }
    });
  
    // Prepare the grTransactionData
    const grTransactionData = {
      payer,
      consumers: Object.keys(userAmounts),
      splitMethod: "amount",
      amounts: Object.values(userAmounts),
      totalAmount: null, // Not needed for amount split
      category,
      explanation,
      timestamp: new Date().toISOString(),
    };
  
    try {
      await api.addSplitbill(selectedGroup, grTransactionData); // Replace with your API endpoint call
      setSnackbar({ open: true, message: "Food assignments submitted successfully.", severity: "success" });
  
      // Reset form fields
      setPayer("");
      setAssignments({});
      setCategory("");
      setExplanation("");
      setReceiptDetails(null);
      setFoodList([]);
    } catch (error) {
      setSnackbar({ open: true, message: "Failed to submit food assignments.", severity: "error" });
    }
  };

  const handleTotalAmountChange = (value) => {
    // Convert the value to a number
    const numericValue = Number(value);
  
    // Check if the value is a valid number and greater than or equal to 0
    if (!isNaN(numericValue) && numericValue >= 0) {
      // Update the state or perform the necessary action
      setTotalAmount(numericValue);
    } else {
      // Optionally, you can handle invalid input here (e.g., show an error message)
      console.log("Invalid input. Please enter a positive number.");
    }
  };
  

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Split Bill
      </Typography>
  
      <Typography variant="h6">Select a Group:</Typography>
      <Box>
        {groups.map((group) => (
          <Button
            key={group}
            variant={selectedGroup === group ? "contained" : "outlined"}
            onClick={() => handleGroupClick(group)}
            style={{ marginRight: "8px", marginBottom: "8px" }}
          >
            {group}
          </Button>
        ))}
      </Box>
  
      {selectedGroup && (
        <>
          <Typography variant="h6" mt={2}>Payer:</Typography>
          <Select
            fullWidth
            value={payer}
            onChange={(e) => setPayer(e.target.value)}
          >
            {members.map((member) => (
              <MenuItem key={member} value={member}>
                {member}
              </MenuItem>
            ))}
          </Select>
  
          <Typography variant="h6" mt={2}>Split Method:</Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel>Split Method</InputLabel>
            <Select
              value={splitMethod}
              onChange={(e) => setSplitMethod(e.target.value)}
            >
              <MenuItem value="ratio">Ratio</MenuItem>
              <MenuItem value="percentage">Percentage</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
            </Select>
          </FormControl>
  
          <FormControl fullWidth margin="normal">
            <InputLabel>Currency</InputLabel>
            <Select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <MenuItem value="USD">USD</MenuItem>
              <MenuItem value="EUR">EUR</MenuItem>
              <MenuItem value="IRR">IRR</MenuItem>
            </Select>
          </FormControl>
  
          {splitMethod !== "amount" && (
            <>
              <Typography variant="h6" mt={2}>Total Amount:</Typography>
              <TextField
                fullWidth
                type="number"
                value={totalAmount}
                onChange={(e) => handleTotalAmountChange(e.target.value)}
                placeholder="Enter the total amount"
                inputProps={{ min: 0 }} // Prevent negative numbers
              />
            </>
          )}
  
          <Typography variant="h6" mt={2}>Who Ate?</Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={splitEqually}
                onChange={handleSplitEquallyChange}
                sx={{ "&.Mui-checked": { color: "#1e40af" } }}
              />
            }
            label="Split Equally"
          />
          <Box>
            {members.map((member) => (
              <TextField
                key={member}
                label={member}
                type="number"
                value={whoAte[member] || ""}
                onChange={(e) => handleWhoAteChange(member, e.target.value)}
                placeholder={`Enter ${splitMethod !== "amount" ? splitMethod : "contribution"}`}
                inputProps={{ min: 0 }} // Prevent negative numbers
                style={{ marginRight: "8px", marginBottom: "8px" }}
              />
            ))}
          </Box>
  
          <Typography variant="h6" mt={2}>Category:</Typography>
          <TextField
            fullWidth
            value={category}
            onChange={(e) => setCategory(e.target.value.toLowerCase())}
            placeholder="e.g., Dinner"
          />
  
          <Typography variant="h6" mt={2}>Explanation (Optional):</Typography>
          <TextField
            fullWidth
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="e.g., Group dinner at a restaurant"
          />
  
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginTop: "16px" }}
          >
            Submit
          </Button>
  
          <Box mt={4}>
            <Typography variant="h5" gutterBottom>
              Scan Receipt for Food Assignment
            </Typography>
  
            <div>
              <Button 
                variant="contained" 
                onClick={() => handleCameraClick(setSelectedFile)} 
                style={{ marginRight: "8px" }}
              >
                Use Camera
              </Button>
              <input type="file" accept="image/*" onChange={handleFileUpload} style={{ marginRight: "8px" }} />
              <Button variant="contained" color="primary" onClick={handleScan}>
                Submit Photo
              </Button>
            </div>
  
            {foodList.length > 0 && (
              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Assign Foods to Members
                </Typography>
                {foodList.map((food) => (
                  <Box key={food} mb={2} display="flex" alignItems="center">
                    <Typography style={{ marginRight: "16px" }}>{food}</Typography>
                    <Select
                      value={assignments[food]}
                      onChange={(e) => handleAssignmentChange(food, e.target.value)}
                      displayEmpty
                      style={{ minWidth: "200px" }}
                    >
                      <MenuItem value="">Select a user</MenuItem>
                      {members.map((member) => (
                        <MenuItem key={member} value={member}>
                          {member}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                ))}
                <Typography mt={2} style={{ color: "gray" }}>
                  Please enter payer, category and explanation (optional), then click on submit. 
                </Typography>
                <Typography mt={2} style={{ color: "gray" }}>
                  Tax will be considered in adding transactions.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFoodAssignmentsSubmit}
                  style={{ marginTop: "16px" }}
                >
                  Submit Food Assignments
                </Button>
              </Box>
            )}
          </Box>
  
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ open: false, message: "", severity: "" })}
          >
            <Alert
              onClose={() => setSnackbar({ open: false, message: "", severity: "" })}
              severity={snackbar.severity}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default SplitBill;
