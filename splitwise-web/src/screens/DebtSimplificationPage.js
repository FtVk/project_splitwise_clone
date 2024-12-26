import React, { useState, useEffect } from "react";
import { addDebt, simplifyDebts, viewDebts, deleteDebt } from "../services/api";

 import {
    TextField,
    Button,
    Typography,
    Container,
    List,
    ListItem,
    ListItemText,
    Divider,
    Alert,
} from "@mui/material";
import { Link } from "react-router-dom";

const DebtSimplificationPage = () => {
    const [fromUser, setFromUser] = useState("");
    const [toUser, setToUser] = useState("");
    const [amount, setAmount] = useState("");
    const [debts, setDebts] = useState({});
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadDebts();
    }, []);

    const handleAddDebt = async () => {
        const response = await addDebt(fromUser, toUser, amount);
        setMessage(response.message || response.error);
        loadDebts(); // Refresh debts
    };

    const handleSimplifyDebts = async () => {
        const response = await simplifyDebts();
        setMessage(response.message || response.error);
        loadDebts(); // Refresh debts
    };

    const loadDebts = async () => {
        const response = await viewDebts();
        setDebts(response);
    };

    return (
        <Container className="container">
            <Typography variant="h4" gutterBottom>
                Debt Simplification
            </Typography>
            <Link to="/" style={{ textDecoration: "none" }}>
                <Button variant="contained" color="primary" style={{ marginBottom: "20px" }}>
                    Go to Home
                </Button>
            </Link>
            <div>
                <TextField
                    label="From User"
                    value={fromUser}
                    onChange={(e) => setFromUser(e.target.value)}
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: "10px" }}
                />
                <TextField
                    label="To User"
                    value={toUser}
                    onChange={(e) => setToUser(e.target.value)}
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: "10px" }}
                />
                <TextField
                    label="Amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    fullWidth
                    variant="outlined"
                    style={{ marginBottom: "10px" }}
                />
                <Button variant="contained" color="success" onClick={handleAddDebt}>
                    Add Debt
                </Button>
            </div>
            <Divider style={{ margin: "20px 0" }} />
            <Button variant="contained" color="secondary" onClick={handleSimplifyDebts}>
                Simplify Debts
            </Button>
            <Typography variant="h5" style={{ margin: "20px 0" }}>
                Current Debts
            <Button
                variant="outlined"
                color="error"
                onClick={() => {
                    deleteDebt(fromUser, toUser);
                    loadDebts();
                }}
            >
                Delete
            </Button>
            </Typography>
            {message && <Alert severity={message.includes("successfully") ? "success" : "error"}>{message}</Alert>}
            <List>
                {Object.keys(debts).map((fromUser) =>
                    Object.keys(debts[fromUser]).map((toUser) => (
                        <ListItem key={`${fromUser}-${toUser}`}>
                            <ListItemText
                                primary={`${fromUser} owes ${toUser}`}
                                secondary={`Amount: $${debts[fromUser][toUser]}`}
                            />
                        </ListItem>
                    ))
                )}
            </List>
        </Container>
    );
};

export default DebtSimplificationPage;
