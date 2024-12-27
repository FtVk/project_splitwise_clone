import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Home from "./screens/Home";
import PaymentsPage from "./screens/payments";
import SplitBillPage from "./screens/splitbill";

const App = () => {
    return (
        <Router>
            <AppBar position="static" style={{ backgroundColor: "#1e3a8a", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
                <Toolbar style={{ justifyContent: "space-between" }}>
                    <Typography variant="h6" style={{ fontWeight: "bold" }}>
                        SplitWise App
                    </Typography>
                    <Box>
                        <Button
                            component={Link}
                            to="/"
                            color="inherit"
                            style={{ fontSize: "16px", fontWeight: "500" }}
                        >
                            Home
                        </Button>

                        <Button
                            component={Link}
                            to="/payments"
                            color="inherit"
                            style={{ fontSize: "16px", fontWeight: "500" }}
                        >
                            Payments
                        </Button>

                        <Button
                            component={Link}
                            to="/splitbill"
                            color="inherit"
                            style={{ fontSize: "16px", fontWeight: "500" }}
                        >
                            Split Bill
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/splitbill" element={<SplitBillPage />} />
            </Routes>
        </Router>
    );
};

export default App;

