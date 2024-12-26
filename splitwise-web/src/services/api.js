import axios from "axios";


const API_BASE_URL = "http://127.0.0.1:5000"; // Base URL for your backend


const api = {
  fetchGroups: () =>
    axios.get(`${API_BASE_URL}/groups`).then((res) => res.data.groups),


  addGroup: (groupName) =>
    axios.post(`${API_BASE_URL}/groups`, { name: groupName }).then((res) => res.data),


  fetchGroupMembers: (groupName) =>
    axios.get(`${API_BASE_URL}/groups/${groupName}/members`).then((res) => res.data.members),


  addMemberToGroup: (groupName, memberName) =>
    axios.post(`${API_BASE_URL}/groups/${groupName}/members`, { name: memberName }).then((res) => res.data),


  addTransaction: (groupName, transactionData) =>
    axios.post(`${API_BASE_URL}/groups/${groupName}/transactions`, transactionData).then((res) => res.data),
};

export default api;
