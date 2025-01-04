import React, { useState, useEffect } from "react";
import {
    Typography,
    Button,
    TextField,
    Container,
    List,
    ListItem,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    Box,
    Grid,
    Paper,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFnsV3";
import { StaticDatePicker, DatePicker } from "@mui/x-date-pickers";
import api from "../services/api";
import { convertCurrency } from "../services/currency_conversion";

const MeExpensesPage = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [explanation, setExplanation] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [dueDate, setDueDate] = useState(null);
    const [recurrence, setRecurrence] = useState("");
    const [selectedDate, setSelectedDate] = useState(new Date());

    useEffect(() => {
        api.fetchGroupTransactions("expense")
            .then((data) => {
                setTransactions(data || []);
                filterTransactionsByMonth(new Date(), data || []);
            })
            .catch((err) => console.error("Failed to fetch transactions:", err));
    }, []);

    const handleAddTransaction = async () => {
        let convertedAmount = parseFloat(amount);

        if (currency !== "USD") {
            try {
                convertedAmount = await convertCurrency(
                    currency,
                    "USD",
                    parseFloat(amount)
                );
            } catch (error) {
                alert("Currency conversion failed: " + error.message);
                return;
            }
        }

        const newTransaction = {
            amount: parseFloat(convertedAmount),
            category,
            explanation,
            timestamp: dueDate ? dueDate.toISOString() : new Date().toISOString(),
            recurrence,
        };

        api.addTransaction("expense", {
            from_user: "Me",
            to_user: "government",
            ...newTransaction,
        })
            .then(() => {
                setTransactions((prev) => [...prev, newTransaction]);
                filterTransactionsByMonth(selectedDate, [
                    ...transactions,
                    newTransaction,
                ]);
                setOpenDialog(false);
                resetDialogFields();
            })
            .catch((err) => console.error("Error adding transaction:", err));
    };

    const filterTransactionsByMonth = (date, allTransactions) => {
        const month = date.getMonth();
        const year = date.getFullYear();
        const filtered = allTransactions.filter((transaction) => {
            const transactionDate = new Date(transaction.timestamp);
            return (
                transactionDate.getMonth() === month &&
                transactionDate.getFullYear() === year
            );
        });
        setFilteredTransactions(filtered);
    };

    const resetDialogFields = () => {
        setAmount("");
        setCategory("");
        setExplanation("");
        setDueDate(null);
        setRecurrence("");
        setCurrency("USD");
    };


    return (
        <Container maxWidth="lg">
            <Box
                sx={{
                    backgroundColor: "#f5f5f5",
                    padding: "20px",
                    borderRadius: "8px",
                    mb: 3,
                }}
            >
            <Typography variant="h4" align="center" gutterBottom>
                My Expenses
            </Typography>
            </Box>
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ padding: "20px", borderRadius: "8px" }}>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <StaticDatePicker
                                displayStaticWrapperAs="desktop"
                                views={["year", "month", "day"]}
                                value={selectedDate}
                                onChange={(newDate) => {
                                    setSelectedDate(newDate);
                                    filterTransactionsByMonth(newDate, transactions);
                                }}
                                onMonthChange={(newMonth) => {
                                    const updatedDate = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1);
                                    setSelectedDate(updatedDate);
                                    filterTransactionsByMonth(updatedDate, transactions);
                                }}
                            />
                        </LocalizationProvider>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ padding: "20px", borderRadius: "8px" }}>
                        <Typography variant="h6" gutterBottom>
                            Transactions for {selectedDate.toLocaleString("default", { month: "long", year: "numeric" })}
                        </Typography>
                        <List>
                            {filteredTransactions.map((transaction, index) => (
                                <ListItem key={index} sx={{ borderBottom: "1px solid #eee" }}>
                                    <ListItemText
                                        primary={`$${transaction.amount} - ${transaction.category}`}
                                        secondary={`Explanation: ${transaction.explanation ? transaction.explanation : "No Explanation"} | Date: ${new Date(
                                            transaction.timestamp
                                        ).toLocaleDateString()}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        {filteredTransactions.length === 0 && (
                            <Typography variant="body2" color="textSecondary" align="center">
                                No transactions for this month.
                            </Typography>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Box mt={3} textAlign="center">
                <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
                    Add Transaction
                </Button>
            </Box>
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Add Transaction</DialogTitle>
                <DialogContent>
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
                        <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="EUR">EUR</MenuItem>
                            <MenuItem value="IRR">IRR</MenuItem>
                        </Select>
                    </FormControl>
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
                        onChange={(e) => setExplanation(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Due Date"
                            value={dueDate}
                            onChange={(newValue) => setDueDate(newValue)}
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                        />
                    </LocalizationProvider>
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Recurrence</InputLabel>
                        <Select value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
                            <MenuItem value="">None</MenuItem>
                            <MenuItem value="monthly">Monthly</MenuItem>
                            <MenuItem value="yearly">Yearly</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddTransaction} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MeExpensesPage;
