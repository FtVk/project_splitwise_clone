import React, { useEffect, useState } from "react";
import { Typography, Box, Button, Card, CardContent, Grid, Snackbar, Alert } from "@mui/material";
import api from "../services/api";

const PaymentsPage = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [balances, setBalances] = useState([]);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Fetch groups on page load
    useEffect(() => {
        api.fetchGroups().then(setGroups).catch(console.error);
    }, []);

    // Load and simplify balance graph
    const loadBalanceGraph = (groupName) => {
        api.simplifyDebts(groupName)
            .then(() => api.fetchBalanceData(groupName))
            .then((data) => {
                setSelectedGroup(groupName);
                setBalances(data.edges || []);
            })
            .catch(console.error);
    };

    // Handle group selection
    const handleGroupClick = (groupName) => {
        loadBalanceGraph(groupName);
    };

    // Handle payment action
    const handlePayment = (from, to, amount) => {
        const confirm = window.confirm(`Are you sure the payment of $${amount} from ${from} to ${to} is completed?`);
        if (confirm) {
            api.addTransaction(selectedGroup, {
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
                        severity: "success",
                    });
                    // Reload balance graph after the transaction
                    loadBalanceGraph(selectedGroup);
                })
                .catch(() =>
                    setSnackbar({
                        open: true,
                        message: "Failed to record payment. Please try again.",
                        severity: "error",
                    })
                );
        }
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1e3a8a", textAlign: "center", marginBottom: 4 }}>
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