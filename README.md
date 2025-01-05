# Expense Manager API

This project is a Flask-based API for managing expenses, tracking group transactions, simplifying debts, and processing receipt data. It serves as a basic implementation of a "Splitwise"-like application with added features for receipt and payment processing using OCR.

## Features

1. **Group Management**

   - Create, list, and manage groups.
   - Add members to groups.

2. **Expense Tracking**

   - Add, list, and search transactions within groups.
   - Fetch and manage balance graphs for groups.
   - Simplify group debts.

3. **Split Bill**

   - Supports equal, ratio-based, and percentage-based bill splitting.

4. **Receipt and Payment Processing**

   - OCR-based receipt scanning to extract transaction details.
   - Payment receipt processing for amount extraction.

5. **Data Visualization**

   - Visualize expenses in each group using a circular graph.

6. **Recurrent Expenses**

   - Add recurrent expenses (e.g., taxes) to a group named "Expense" automatically.

7. **Data Persistence**

   - Group and transaction data are saved to and loaded from a JSON file.

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-repo/expense-manager.git
   cd expense-manager
   ```

2. Install Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

3. Install Node.js dependencies:

   ```bash
   npm install
   ```

4. Run the application:

   ```bash
   python app.py
   ```

## API Endpoints

### **Home**

- **`GET /`**
  - Returns a welcome message.

### **Group Management**

- **`GET /groups`**
  - Fetch all groups.
- **`POST /groups`**
  - Create a new group.
  - **Payload**: `{ "name": "group_name" }`
- **`GET /groups/<group_name>/members`**
  - Fetch members of a specific group.
- **`POST /groups/<group_name>/members`**
  - Add a member to a specific group.
  - **Payload**: `{ "name": "member_name" }`

### **Transaction Management**

- **`GET /groups/<group_name>/transactions`**
  - Fetch all transactions in a group.
- **`POST /groups/<group_name>/transactions`**
  - Add a transaction to a group.
  - **Payload**:
    ```json
    {
      "from_user": "user_name",
      "to_user": "user_name",
      "amount": 100,
      "category": "Food",
      "timestamp": "2023-12-31T12:00:00",
      "explanation": "Lunch"
    }
    ```
- **`POST /groups/<group_name>/simplify-debts`**
  - Simplify group debts.

### **Split Bill**

- **`POST /groups/<group_name>/group_transactions`**
  - Add a split bill transaction.
  - **Payload**:
    ```json
    {
      "from_user": "payer_name",
      "to_users": ["user1", "user2"],
      "amounts": [50, 50],
      "split_method": "equal",
      "category": "Dinner",
      "timestamp": "2023-12-31T12:00:00",
      "explanation": "Dinner bill"
    }
    ```

### **Balance Graph**

- **`GET /groups/<group_name>/balance`**
  - Fetch the balance graph for a specific group.

### **Expense Visualization**

- **`GET /groups/<group_name>/expense-graph`**
  - Fetch a circular graph visualizing expenses in the specified group.

### **Recurrent Expenses**

- **`POST /groups/Expense/recurrent`**
  - Add a recurrent expense to the "Expense" group.
  - **Payload**:
    ```json
    {
      "amount": 200,
      "category": "Tax",
      "frequency": "Monthly"
    }
    ```

### **Receipt and Payment Processing**

- **`POST /scan-receipt`**
  - Process a receipt image to extract item details.
  - **Form Data**: `photo` (file).
- **`POST /scan-payment`**
  - Process a payment receipt image to extract the amount.
  - **Form Data**:
    - `photo` (file)
    - `name` (string).

## File Structure

- `app.py`: Main Flask application.
- `core/`: Contains core logic for expense and debt management.
  - `graph.py`: Defines the `ExpenseGraph`.
  - `debt_simplification.py`: Debt simplification logic.
  - `balance_calculation.py`: Balance graph calculation logic.
- `models/`: Contains data models for `Group` and `User`.
- `utils/`: Utilities, including the `receipt_scanner`.
- `data/`: Stores persistent group and transaction data.
- `uploads/`: Stores uploaded receipt images.

## Requirements

- Python 3.8+
- Flask
- Flask-CORS
- Pillow
- pytesseract (for OCR)
- Node.js and npm

## Running Tests

To test the application, use tools like Postman or cURL to interact with the endpoints. Ensure that `data/graph.json` is writable and accessible for data persistence.

## License

This project is open-source and available under the MIT License.

