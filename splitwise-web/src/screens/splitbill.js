import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Select,
    MenuItem,
    Checkbox,
    FormControlLabel,
    Snackbar,
    Alert,
} from "@mui/material";
import api from "../services/api";

const SplitBillPage = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [category, setCategory] = useState("");
    const [whoPaid, setWhoPaid] = useState({});
    const [splitMethod, setSplitMethod] = useState("ratio");
    const [whoAte, setWhoAte] = useState({});
    const [splitEqually, setSplitEqually] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Fetch groups on page load
    useEffect(() => {
        api.fetchGroups().then(setGroups).catch(console.error);
    }, []);

    const handleGroupClick = (groupName) => {
        setSelectedGroup(groupName);
        api.fetchGroupMembers(groupName)
            .then((members) => {
                const initialValues = members.reduce((acc, member) => ({ ...acc, [member]: "" }), {});
                setWhoPaid(initialValues);
                setWhoAte(initialValues);
            })
            .catch(console.error);
    };

    const handleSplitEquallyChange = (event) => {
        const isChecked = event.target.checked;
        setSplitEqually(isChecked);
        if (isChecked) {
            setWhoAte(Object.keys(whoAte).reduce((acc, member) => ({ ...acc, [member]: 1 }), {}));
        }
    };

    const handleSubmit = () => {
        const payer = Object.keys(whoPaid).find((member) => parseFloat(whoPaid[member]) > 0);
        const totalPaid = parseFloat(whoPaid[payer]);

        if (!payer || !totalPaid || !category) {
            setSnackbar({ open: true, message: "Please fill in all required fields.", severity: "error" });
            return;
        }

        let totalShares = 0;
        const splits = {};

        if (splitMethod === "ratio" || splitEqually) {
            totalShares = Object.values(whoAte).reduce((sum, value) => sum + parseFloat(value || 0), 0);
        } else if (splitMethod === "percent") {
            totalShares = 100;
        } else if (splitMethod === "cash") {
            totalShares = totalPaid;
        }

        Object.keys(whoAte).forEach((member) => {
            const value = parseFloat(whoAte[member] || 0);
            if (value > 0) {
                if (splitMethod === "ratio" || splitEqually) {
                    splits[member] = (value / totalShares) * totalPaid;
                } else if (splitMethod === "percent") {
                    splits[member] = (value / 100) * totalPaid;
                } else if (splitMethod === "cash") {
                    splits[member] = value;
                }
            }
        });

        const promises = [];
        Object.keys(splits).forEach((member) => {
            if (member !== payer) {
                const amount = splits[member];
                promises.push(
                    api.addTransaction(selectedGroup, {
                        from_user: member,
                        to_user: payer,
                        amount,
                        category,
                        timestamp: new Date().toISOString(),
                    })
                );
            }
        });

        Promise.all(promises)
            .then(() => {
                setSnackbar({ open: true, message: "Transactions recorded successfully!", severity: "success" });
            })
            .catch(() =>
                setSnackbar({
                    open: true,
                    message: "Failed to record transactions. Please try again.",
                    severity: "error",
                })
            );
    };

    return (
        <Box sx={{ padding: 4 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: "bold",
                    color: "#1e3a8a",
                    textAlign: "center",
                    marginBottom: 4,
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
                }}
            >
                Split Bill with Style
            </Typography>

            {!selectedGroup ? (
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2, color: "#4a4a4a" }}>
                        Select a Group
                    </Typography>
                    <Grid container spacing={2}>
                        {groups.map((group) => (
                            <Grid item xs={12} sm={6} md={4} key={group}>
                                <Button
                                    fullWidth
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#1e40af",
                                        color: "#ffffff",
                                        textTransform: "none",
                                        fontSize: "16px",
                                        fontWeight: "bold",
                                        "&:hover": { backgroundColor: "#374151" },
                                    }}
                                    onClick={() => handleGroupClick(group)}
                                >
                                    {group}
                                </Button>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            ) : (
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                        Category
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Enter category (e.g., Dinner)"
                        sx={{ marginBottom: 4 }}
                    />

                    <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                        Who Paid?
                    </Typography>
                    <Grid container spacing={2} sx={{ marginBottom: 4 }}>
                        {Object.keys(whoPaid).map((member) => (
                            <Grid item xs={6} sm={4} md={3} key={member}>
                                <TextField
                                    label={member}
                                    type="number"
                                    value={whoPaid[member]}
                                    onChange={(e) =>
                                        setWhoPaid({ ...whoPaid, [member]: e.target.value })
                                    }
                                    fullWidth
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: 2 }}>
                        Who Ate?
                    </Typography>
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
                    <Select
                        value={splitMethod}
                        onChange={(e) => setSplitMethod(e.target.value)}
                        fullWidth
                        disabled={splitEqually}
                        sx={{ marginBottom: 2 }}
                    >
                        <MenuItem value="ratio">Ratio</MenuItem>
                        <MenuItem value="percent">Percent</MenuItem>
                        <MenuItem value="cash">Cash</MenuItem>
                    </Select>

                    <Grid container spacing={2} sx={{ marginBottom: 4 }}>
                        {Object.keys(whoAte).map((member) => (
                            <Grid item xs={6} sm={4} md={3} key={member}>
                                <TextField
                                    label={member}
                                    type="number"
                                    value={splitEqually ? 1 : whoAte[member]}
                                    onChange={(e) =>
                                        setWhoAte({ ...whoAte, [member]: e.target.value })
                                    }
                                    fullWidth
                                    disabled={splitEqually}
                                />
                            </Grid>
                        ))}
                    </Grid>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleSubmit}
                        sx={{
                            backgroundColor: "#1e3a8a",
                            color: "#ffffff",
                            fontSize: "18px",
                            fontWeight: "bold",
                            padding: "10px 20px",
                            "&:hover": { backgroundColor: "#374151" },
                        }}
                    >
                        Submit
                    </Button>
                </Box>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default SplitBillPage;
