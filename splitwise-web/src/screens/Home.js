import React, { useState, useEffect } from "react";
import { addTransaction, fetchUsers, addUser } from "../services/api";
//import { TextField, Button, Typography, Container, Alert, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";

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
} from "@mui/material";

const Home = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [members, setMembers] = useState([]);
  const [fromUser, setFromUser] = useState("");
  const [toUser, setToUser] = useState("");
  const [newMember, setNewMember] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

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
    const transactionData = {
      from_user: fromUser,
      to_user: toUser,
      amount,
      category,
    };
    await api.addTransaction(selectedGroup, transactionData);
    alert("Transaction added successfully!");
    // Optionally clear fields
    setFromUser("");
    setToUser("");
    setCategory("");
    setAmount("");
  };

  return (
    <Container className="container">
      <Box mt={4}>
        <Typography variant="h4" gutterBottom>
          Expense Manager
        </Typography>
  
        {/* Group Selection */}
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
  
        {/* Members and Transactions Section */}
        {selectedGroup && (
          <>
            {/* Members Section */}
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
            <Button variant="contained" color="secondary" onClick={handleAddMember}>
              Add Member
            </Button>
  
            {/* Transaction Section */}
            <Box mt={4}>
              <TextField
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <Button variant="contained" color="primary" onClick={handleAddTransaction}>
                Add Transaction
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
  
};

export default Home;
