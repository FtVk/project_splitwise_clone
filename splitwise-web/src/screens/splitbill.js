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
  };

  const handleFileUpload = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleCameraClick = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  
        // Create a video element to display the live camera feed
        const videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.setAttribute("playsinline", true); // For iOS compatibility
        videoElement.autoplay = true;
  
        // Append the video element to the DOM
        document.body.appendChild(videoElement);
  
        // Wait for the video stream to start
        await new Promise((resolve) => {
          videoElement.onloadedmetadata = () => {
            resolve();
          };
        });
  
        // Add a button to capture the photo
        const captureButton = document.createElement("button");
        captureButton.textContent = "Capture Photo";
        document.body.appendChild(captureButton);
  
        let capturedFile = null; // To hold the captured file
  
        captureButton.addEventListener("click", () => {
          // Create a canvas to draw the captured frame
          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d");
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;
  
          // Draw the video frame to the canvas
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
          // Convert the canvas to a blob (image file)
          canvas.toBlob((blob) => {
            if (blob) {
              // Create a file from the blob
              capturedFile = new File([blob], "captured-photo.jpg", { type: "image/jpeg" });
  
              // Display the captured image
              const imgElement = document.createElement("img");
              imgElement.src = URL.createObjectURL(blob);
              document.body.appendChild(imgElement);
  
              console.log("Captured image file:", capturedFile);
  
              // Add a submit button after capturing
              const submitButton = document.createElement("button");
              submitButton.textContent = "Submit Photo";
              document.body.appendChild(submitButton);
  
              // Handle submission
              submitButton.addEventListener("click", () => {
                if (capturedFile) {
                  setSelectedFile(capturedFile); // Set the captured file
                  alert("Photo submitted!");
  
                  // Clean up the DOM
                  videoElement.remove();
                  captureButton.remove();
                  imgElement.remove();
                  submitButton.remove();
                  stream.getTracks().forEach((track) => track.stop());
                }
              });
            }
          });
        });
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

      if (receipt_data.error) {
        alert(receipt_data.error);
        return;
      }

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
      console.error("Error processing the photo:", error);
      alert("An unexpected error occurred. Please try again.");
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
              <Button variant="contained" onClick={handleCameraClick} style={{ marginRight: "8px" }}>
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
