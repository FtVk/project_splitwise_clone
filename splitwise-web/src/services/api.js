import axios from "axios";


const API_BASE_URL = "http://127.0.0.1:5000"; // Base URL for your backend


const api = {
  fetchGroups: () =>
    axios.get(`${API_BASE_URL}/groups`).then((res) => res.data.groups),

  addGroup: (groupName) =>
    axios.post(`${API_BASE_URL}/groups`, { name: groupName }).then((res) => res.data),

  fetchGroupMembers: (groupName) =>
    axios.get(`${API_BASE_URL}/groups/${groupName}/members`).then((res) => res.data.members),

  fetchGroupTransactions: (groupName) =>
    axios
      .get(`${API_BASE_URL}/groups/${groupName}/transactions`)
      .then((res) => res.data.transactions),

  addMemberToGroup: (groupName, memberName) =>
    axios.post(`${API_BASE_URL}/groups/${groupName}/members`, { name: memberName }).then((res) => res.data),

  fetchBalanceData: (groupName) =>
    axios.get(`${API_BASE_URL}/groups/${groupName}/balance`).then((res) => res.data),  

  simplifyDebts: (groupName) =>
    axios.post(`${API_BASE_URL}/groups/${groupName}/simplify-debts`).then((res) => res.data),

  saveBalanceData: (groupName, balanceData) =>
    axios.post(`${API_BASE_URL}/groups/${groupName}/balance`, balanceData).then((res) => res.data),

  addTransaction: (groupName, transactionData) =>
    axios.post(`${API_BASE_URL}/groups/${groupName}/transactions`, transactionData).then((res) => res.data),

  fetchRecentTransactions: (groupName) =>
    axios.get(`${API_BASE_URL}/groups/${groupName}/transactions/recent`).then((res) => res.data.transactions),

  searchTransactions: (groupName, searchPhrase) => 
    axios.get(`${API_BASE_URL}/search_transactions`, {
        params: { group_name: groupName, phrase: searchPhrase }
    }).then((res) => res.data),

  addSplitbill: (groupName, grTransactionData) =>
    axios.post(`${API_BASE_URL}/groups/${groupName}/group_transactions`, {
      from_user: grTransactionData.payer,
      to_users: grTransactionData.consumers,
      amounts: grTransactionData.amounts,
      split_method: grTransactionData.splitMethod,
      total_amount: grTransactionData.totalAmount,
      category: grTransactionData.category,
      timestamp: grTransactionData.timestamp,
      explanation: grTransactionData.explanation,
    }).then((res) => res.data),

  extractFoods: (formData) =>
    axios
      .post(`${API_BASE_URL}/scan-receipt`, formData)
      .then((res) => res.data),

  scanPayment: (formData) =>
    axios
      .post(`${API_BASE_URL}/scan-payment`, formData)
      .then((res) => res.data),

  submitFoodAssignments: (assignments) =>
    axios
      .post(`${API_BASE_URL}/assignments`, assignments)
      .then((res) => res.data),

};

export default api;
