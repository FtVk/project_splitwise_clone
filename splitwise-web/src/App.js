import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link  } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import Home from "./screens/Home";
import DebtSimplificationPage from "./screens/DebtSimplificationPage";

const App = () => {
    return (
        <Router>
            <AppBar position="static" style={{ backgroundColor: "#1e3a8a", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}>
            <Toolbar style={{ justifyContent: "space-between" }}>
                <Typography variant="h6" style={{ fontWeight: "bold" }}>
                SplitWise App
                </Typography>
                <Button color="inherit" style={{ fontSize: "16px", fontWeight: "500" }}>DebtSimplificationPage</Button>
            </Toolbar>
            </AppBar>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/debt-simplification" element={<DebtSimplificationPage />} />
            </Routes>
        </Router>
    );
};

export default App;
