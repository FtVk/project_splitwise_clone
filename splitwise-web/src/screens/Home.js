import React, { useState, useEffect } from "react";
import api from "../services/api";
import {
  Container,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { convertCurrency } from "../services/currency_conversion";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [balanceData, setBalanceData] = useState({});
  const [reTransactions, setReTransactions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [fromUser, setFromUser] = useState("");
  const [toUser, setToUser] = useState("");
  const [newMember, setNewMember] = useState("");
  const [category, setCategory] = useState("");
  const [explanation, setExplanation] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD"); // Currency state
  const [searchPhrase, setSearchPhrase] = useState("");

  useEffect(() => {
    const loadGroups = async () => {
      const groupList = await api.fetchGroups();
      setGroups(groupList);
    };
    loadGroups();
  }, []);

  const handleSelectGroup = async (group) => {
    setSelectedGroup(group);
    const membersList = await api.fetchGroupMembers(group);
    setMembers(membersList);

    const balance = await api.fetchBalanceData(group);
    const recentTransactions = await api.fetchRecentTransactions(group);

    setBalanceData(balance);
    setReTransactions(recentTransactions);
  };

  const handleAddGroup = async () => {
    if (!newGroupName) return;
    await api.addGroup(newGroupName);
    setGroups((prev) => [...prev, newGroupName]);
    setNewGroupName("");
  };

  const handleAddMember = async () => {
    if (!newMember || !selectedGroup) return;
    await api.addMemberToGroup(selectedGroup, newMember);
    setMembers((prev) => [...prev, newMember]);
    setNewMember("");
  };

  const handleAddTransaction = async () => {
    if (!selectedGroup || !fromUser || !toUser || !amount || !category) {
      alert("Please fill out all fields.");
      return;
    }

    let convertedAmount = parseFloat(amount);

    // Check and convert currency to USD
    if (currency !== "USD") {
      try {
        convertedAmount = await convertCurrency(currency, "USD", parseFloat(amount));
      } catch (error) {
        alert("Currency conversion failed: " + error.message);
        return;
      }
    }

    const transactionData = {
      from_user: fromUser,
      to_user: toUser,
      amount: parseFloat(convertedAmount),
      category,
      explanation,
    };

    await api.addTransaction(selectedGroup, transactionData);

    // Fetch updated data
    const balance = await api.fetchBalanceData(selectedGroup);
    const recentTransactions = await api.fetchRecentTransactions(selectedGroup);

    setBalanceData(balance);
    setReTransactions(recentTransactions);

    alert("Transaction added successfully!");

    // Clear fields
    setFromUser("");
    setToUser("");
    setExplanation("");
    setCategory("");
    setAmount("");
    setCurrency("USD"); // Reset currency to default
  };

  const handleSimplifyDebts = async () => {
    await api.simplifyDebts(selectedGroup);

    const updatedBalance = await api.fetchBalanceData(selectedGroup);
    setBalanceData(updatedBalance);

    alert("Debts simplified successfully!");
  };

  const handleSearch = async () => {
    const filteredTransactions = await api.searchTransactions(selectedGroup, searchPhrase);
    setTransactions(filteredTransactions);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!selectedGroup || !transactionId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmDelete) return;

    try {
      await api.deleteTransaction(selectedGroup, transactionId);
      alert("Transaction deleted successfully!");

      // Refresh data
      const balance = await api.fetchBalanceData(selectedGroup);
      const recentTransactions = await api.fetchRecentTransactions(selectedGroup);

      setBalanceData(balance);
      setReTransactions(recentTransactions);
    } catch (error) {
      alert("Failed to delete transaction: " + error.message);
    }
  };

  return (
    <Container className="container">
      <Grid container spacing={4}>
        {/* Left Panel */}
        <Grid item xs={12} md={8}>
          <Box mt={4}>
            <Typography variant="h4" gutterBottom>
              Expense Manager
            </Typography>

            <FormControl fullWidth margin="normal">
              <InputLabel>Select Group</InputLabel>
              <Select
                value={selectedGroup}
                onChange={(e) => handleSelectGroup(e.target.value)}
              >
                {groups.map((group) => (
                  <MenuItem key={group} value={group}>
                    {group}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Add New Group"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleAddGroup}>
              Add Group
            </Button>

            {selectedGroup && (
              <>
                <Typography variant="h6" gutterBottom mt={4}>
                  Members of {selectedGroup}
                </Typography>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Select From User</InputLabel>
                  <Select
                    value={fromUser}
                    onChange={(e) => setFromUser(e.target.value)}
                  >
                    {members.map((member) => (
                      <MenuItem key={member} value={member}>
                        {member}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Select To User</InputLabel>
                  <Select
                    value={toUser}
                    onChange={(e) => setToUser(e.target.value)}
                  >
                    {members.map((member) => (
                      <MenuItem key={member} value={member}>
                        {member}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Add New Member"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                  fullWidth
                  margin="normal"
                />
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleAddMember}
                >
                  Add Member
                </Button>

                <Box mt={4}>
                  <TextField
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Explanation"
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value.toLowerCase())}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
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
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddTransaction}
                  >
                    Add Transaction
                  </Button>
                </Box>

                <Box mt={4}>
                  <Typography variant="h6" gutterBottom>
                    Balance Graph
                  </Typography>
                  <pre>{JSON.stringify(balanceData, null, 2)}</pre>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleSimplifyDebts}
                  >
                    Simplify Debts
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Grid>

        {/* Right Panel for Recent Transactions */}
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            style={{ padding: "16px", maxHeight: "400px", overflowY: "auto" }}
          >
            <Typography variant="h6" gutterBottom>
              Recent Transactions
            </Typography>
            <List>
              {reTransactions.length > 0 ? (
                reTransactions.slice(0, 10).map((reTransactions, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`From: ${reTransactions.from} to: ${reTransactions.to}`}
                      secondary={
                        <>
                          <span>Amount: ${reTransactions.amount.toFixed(2)}</span>
                          <br />
                          <span>Time: {new Date(reTransactions.timestamp).toLocaleString()}</span>
                          <br />
                          <span>Category: {reTransactions.category}</span>
                          <br />
                          <span>
                            Explanation: {reTransactions.explanation ? reTransactions.explanation : "No Explanation"}
                          </span>
                        </>
                      }
                    />
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() => handleDeleteTransaction(reTransactions.transaction_id)}
                      style={{ marginLeft: "10px" }}
                    >
                      Delete
                    </Button>
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No recent transactions found." />
                </ListItem>
              )}
            </List>

            <TextField
              label="Search by Category or Explanation"
              variant="outlined"
              value={searchPhrase}
              onChange={(e) => setSearchPhrase(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button variant="contained" color="primary" onClick={handleSearch}>
              Search
            </Button>

            <Box mt={2}>
              <Typography variant="h6" gutterBottom>
                Results of Search
              </Typography>
              <List>
                {transactions.length > 0 ? (
                  transactions.slice(0, 10).map((transaction, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={`From: ${transaction.from} to: ${transaction.to}`}
                        secondary={
                          <>
                            <span>Amount: ${transaction.amount.toFixed(2)}</span>
                            <br />
                            <span>Time: {new Date(transaction.timestamp).toLocaleString()}</span>
                            <br />
                            <span>Category: {transaction.category}</span>
                            <br />
                            <span>
                              Explanation: {transaction.explanation ? transaction.explanation : "No Explanation"}
                            </span>
                          </>
                        }
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        style={{ marginLeft: "10px" }}
                      >
                        Delete
                      </Button>
                    </ListItem>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="No search results found." />
                  </ListItem>
                )}
              </List>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Home;
