import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, IconButton, Box, Menu, MenuItem } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faMoneyBill, faUtensils, faChartPie, faBars } from '@fortawesome/free-solid-svg-icons';
import Home from "./screens/Home";
import PaymentsPage from "./screens/payments";
import SplitBillPage from "./screens/splitbill";
import VisualizationPage from "./screens/visualization";
import logo from './logo.png';

const App = () => {
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    return (
        <Router>
            <AppBar
                position="static"
                style={{
                    background: "linear-gradient(90deg, #1e3a8a, #2563eb,rgb(220, 189, 255))",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                }}
            >
                <Toolbar style={{ justifyContent: "space-between" }}>
                    {/* App Logo and Title */}
                    <Box display="flex" alignItems="center">
                        <img
                            src={logo} // Replace with the actual path to your transparent logo
                            alt="SplitWise Logo"
                            style={{
                                width: "70px",
                                height: "70px",
                                marginRight: "1px",
                            }}
                        />
                        <Typography variant="h6" style={{ fontWeight: "bold", color: "white" }}>
                            SplitWise
                        </Typography>
                    </Box>

                    {/* Desktop Navigation */}
                    <Box sx={{ display: { xs: "none", sm: "block" } }}>
                        <Button
                            component={Link}
                            to="/"
                            color="inherit"
                            style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "white",
                                marginRight: "10px",
                                transition: "transform 0.2s ease",
                            }}
                            onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                        >
                            <FontAwesomeIcon icon={faHome} style={{ marginRight: "5px" }} />
                            Home
                        </Button>

                        <Button
                            component={Link}
                            to="/payments"
                            color="inherit"
                            style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "white",
                                marginRight: "10px",
                                transition: "transform 0.2s ease",
                            }}
                            onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                        >
                            <FontAwesomeIcon icon={faMoneyBill} style={{ marginRight: "5px" }} />
                            Payments
                        </Button>

                        <Button
                            component={Link}
                            to="/splitbill"
                            color="inherit"
                            style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "white",
                                marginRight: "10px",
                                transition: "transform 0.2s ease",
                            }}
                            onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                        >
                            <FontAwesomeIcon icon={faUtensils} style={{ marginRight: "5px" }} />
                            Split Bill
                        </Button>

                        <Button
                            component={Link}
                            to="/visualization"
                            color="inherit"
                            style={{
                                fontSize: "16px",
                                fontWeight: "500",
                                color: "white",
                                marginRight: "10px",
                                transition: "transform 0.2s ease",
                            }}
                            onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
                            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
                        >
                            <FontAwesomeIcon icon={faChartPie} style={{ marginRight: "5px" }} />
                            Visualization
                        </Button>
                    </Box>

                    {/* Mobile Menu */}
                    <Box sx={{ display: { xs: "block", sm: "none" } }}>
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="menu"
                            onClick={handleMenuOpen}
                        >
                            <FontAwesomeIcon icon={faBars} />
                        </IconButton>
                        <Menu
                            anchorEl={anchorEl}
                            open={Boolean(anchorEl)}
                            onClose={handleMenuClose}
                            style={{ marginTop: "40px" }}
                        >
                            <MenuItem onClick={handleMenuClose} component={Link} to="/">
                                Home
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose} component={Link} to="/payments">
                                Payments
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose} component={Link} to="/splitbill">
                                Split Bill
                            </MenuItem>
                            <MenuItem onClick={handleMenuClose} component={Link} to="/visualization">
                                Visualization
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/splitbill" element={<SplitBillPage />} />
                <Route path="/visualization" element={<VisualizationPage />} />
            </Routes>
        </Router>
    );
};

export default App;
