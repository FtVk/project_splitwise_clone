# Expense Tracker Application

## Overview
The Expense Tracker is a GUI-based application built using Python and wxPython. It allows users to manage group expenses, track balances, and visualize financial transactions with bar charts. This is especially useful for splitting bills among groups like friends, family, or coworkers.

## Features
1. **Group Management**:
   - Add and manage multiple groups.
   - Assign members to each group.

2. **Expense Management**:
   - Record expenses with a payer and one or more debtors.
   - Automatically split the expense amount equally among debtors.

3. **Balance Tracking**:
   - View current balances for all group members.

4. **Visualization**:
   - Display a bar graph showing balances for each user.

5. **Data Persistence**:
   - Save groups and expenses to a file.
   - Load saved data when the application restarts.

---

## Installation

### Prerequisites
- Python 3.7+
- wxPython
- matplotlib

### Install Dependencies
```bash
pip install wxpython matplotlib
```

---

## How to Run

1. Clone the repository or download the source code.
2. Navigate to the project directory.
3. Run the main Python file:
   ```bash
   python main.py
   ```

---

## Usage

### Main Components
1. **Group Selection**:
   - Use the dropdown to select an existing group.
   - Add a new group by clicking the "Add Group" button.

2. **User Management**:
   - Add users to the selected group using the "Add User" button.

3. **Add Expense**:
   - Select a payer from the dropdown.
   - Check one or more debtors in the checklist.
   - Enter the expense amount.
   - Click "Add Expense" to record the transaction.

4. **View Balances**:
   - Click "View Balance" to display each user's balance in a popup.

5. **View Graph**:
   - Click "View Graph" to visualize user balances with a bar chart.

6. **Save and Exit**:
   - Data is saved automatically when you close the application.

---

## Code Explanation

### Key Modules
- **GUI (`ExpenseTracker`)**:
  - Handles the user interface using wxPython.
- **Data Models**:
  - `Group` and `User` classes manage group and member data.
- **Graph (`matplotlib`)**:
  - Visualize balances in a bar chart.
- **Data Persistence**:
  - Functions `save_data()` and `load_data()` save and retrieve group data using Python's `pickle` module.

### Core Functionalities
1. **Data Persistence**:
   - `save_data`: Saves groups and their members to a file.
   - `load_data`: Loads saved groups and members when the app starts.
   
2. **Expense Calculation**:
   - Splits expenses equally among selected debtors.

3. **Graph Updates**:
   - Updates a directed graph to manage who owes whom.

---

## Example Usage

### Adding a Group and Users
1. Click "Add Group" and name it (e.g., *Friends*).
2. Select the new group.
3. Add users like *Alice* and *Bob*.

### Adding an Expense
1. Select the payer (e.g., *Alice*).
2. Check debtors (e.g., *Bob*).
3. Enter the amount (e.g., 100).
4. Click "Add Expense".

### Viewing Balances and Graph
1. Click "View Balance" to see how much *Bob* owes *Alice*.
2. Click "View Graph" for a visual representation.

---

## Known Issues
1. Ensure no duplicate names when adding groups or users.
2. Always select a group before performing actions like adding users or expenses.

---

## Future Enhancements
- Allow weighted expense splitting (e.g., by percentages).
- Support for deleting groups, users, or specific expenses.
- Advanced visualizations for complex graphs.

---

## License
This project is open-source and available under the MIT License.
