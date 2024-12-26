import React, { useState } from "react";
import { addUser } from "../services/api";

const AddUserPage = () => {
  const [name, setName] = useState("");

  const handleAddUser = async () => {
    try {
      await addUser(name);
      alert(`User ${name} added successfully!`);
      setName("");
    } catch (error) {
      alert("Failed to add user.");
    }
  };

  return (
    <div>
      <h1>Add User</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter user name"
      />
      <button onClick={handleAddUser}>Add User</button>
    </div>
  );
};

export default AddUserPage;
