import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#ffbb28", "#a4de6c"];

const VisualizationPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.fetchGroups().then((data) => {
      setGroups(data);
      if (data.length > 0) {
        setSelectedGroup(data[0]);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      setLoading(true);
      api.fetchGroupTransactions(selectedGroup).then((data) => {
        // Filter transactions: exclude "payment" category and future timestamps
        const currentTime = new Date();
        const filteredTransactions = data.filter(
          (t) => t.category !== "payment" && new Date(t.timestamp) <= currentTime
        );

        setTransactions(filteredTransactions);

        // Create chart data from filtered transactions
        const categoryMap = {};
        filteredTransactions.forEach((t) => {
          if (!categoryMap[t.category]) {
            categoryMap[t.category] = 0;
          }
          categoryMap[t.category] += t.amount;
        });

        const formattedData = Object.entries(categoryMap).map(([key, value]) => ({
          name: key,
          value,
        }));

        setChartData(formattedData);
        setLoading(false);
      });
    }
  }, [selectedGroup]);

  return (
    <Box p={3}>
      <Typography variant="h4" align="center" gutterBottom style={{ fontWeight: "bold" }}>
        Group Transaction Visualization
      </Typography>

      <Box mb={3} display="flex" justifyContent="center">
        <Select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          displayEmpty
          style={{ minWidth: 200 }}
        >
          {groups.map((group) => (
            <MenuItem key={group} value={group}>
              {group}
            </MenuItem>
          ))}
        </Select>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box height={400}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={150}
                  fill="#8884d8"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box mt={5}>
            <Typography variant="h6" gutterBottom>
              Transactions in {selectedGroup}:
            </Typography>

            {transactions.map((transaction, index) => (
              <Card key={index} style={{ marginBottom: "16px", backgroundColor: "#f9f9f9" }}>
                <CardContent>
                  <Typography>
                    <strong>From:</strong> {transaction.from_user}
                  </Typography>
                  <Typography>
                    <strong>To:</strong> {transaction.to_user}
                  </Typography>
                  <Typography>
                    <strong>Category:</strong> {transaction.category}
                  </Typography>
                  <Typography>
                    <strong>Amount:</strong> ${transaction.amount.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            ))}

            {transactions.length === 0 && (
              <Typography>No transactions available for this group.</Typography>
            )}
          </Box>
        </>
      )}
    </Box>
  );
};

export default VisualizationPage;
