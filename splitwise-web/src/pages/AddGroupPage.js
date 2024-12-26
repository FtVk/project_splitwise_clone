import React, { useState } from "react";
import { addGroup } from "../services/api";

const AddGroupPage = () => {
  const [groupName, setGroupName] = useState("");
  const [members, setMembers] = useState("");

  const handleAddGroup = async () => {
    try {
      const memberList = members.split(",").map((m) => m.trim());
      await addGroup(groupName, memberList);
      alert(`Group ${groupName} added successfully!`);
      setGroupName("");
      setMembers("");
    } catch (error) {
      alert("Failed to add group.");
    }
  };

  return (
    <div>
      <h1>Add Group</h1>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Enter group name"
      />
      <input
        type="text"
        value={members}
        onChange={(e) => setMembers(e.target.value)}
        placeholder="Enter members (comma-separated)"
      />
      <button onClick={handleAddGroup}>Add Group</button>
    </div>
  );
};

export default AddGroupPage;
