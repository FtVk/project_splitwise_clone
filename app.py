from flask import Flask, request, jsonify
from core.graph import ExpenseGraph  # Use your graph
from core.debt_simplification import DebtSimplification
from core.balance_calculation import BalanceGraph
from core.debt_simplification import DebtSimplification
import utils.receipt_scanner as scanner
from flask_cors import CORS
from models.group import Group
from models.user import User
import os
import json
from werkzeug.utils import secure_filename
from PIL import Image

app = Flask(__name__)
CORS(app)

# Configure upload folder and allowed file types
UPLOAD_FOLDER = './uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Initialize the graph and load stored users
expense_graph = ExpenseGraph()

DATA_PATH = "data/graph.json"

# Load groups from JSON file or initialize empty groups
def load_groups():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r") as file:
            group_data = json.load(file)
            groups = {name: Group(name, members=[User(member) for member in data["nodes"]])
                      for name, data in group_data["groups"].items()}
            for name, data in group_data["groups"].items():
                # Load transaction edges into the graph
                for edge in data["edges"]:
                    groups[name].graph.add_transaction(
                        edge["from"], edge["to"], edge["amount"], edge["category"], edge["timestamp"], edge["explanation"]
                    )

                # Load balance graph
                if "balance_graph" in data:
                    balance_graph_data = data["balance_graph"]
                    for edge in balance_graph_data["edges"]:
                        groups[name].graph.balance_graph.add_edge(
                            edge["from"], edge["to"], edge["amount"]
                        )
            return groups
    return {}


def save_groups(groups):
    group_data = {
        "groups": {
            name: {
                "nodes": list(set(member.name for member in group.members)),
                "edges": [
                    {"from": from_user, "to": transaction["to"], "amount": transaction["amount"],
                     "category": transaction["category"], "timestamp": transaction["timestamp"], "explanation": transaction["explanation"]}
                    for from_user, transactions in group.graph.graph.items()
                    for transaction in transactions
                ],
                "balance_graph": {
                    "nodes": list(set(from_user for from_user in group.graph.balance_graph.graph.keys()) |
                                  set(to_user for edges in group.graph.balance_graph.graph.values() 
                                      for to_user in edges.keys())),
                    "edges": [
                        {"from": from_user, "to": to_user, "amount": amount}
                        for from_user, edges in group.graph.balance_graph.graph.items()
                        for to_user, amount in edges.items()
                    ]
                }
            } for name, group in groups.items()
        }
    }

    with open(DATA_PATH, "w") as file:
        json.dump(group_data, file, indent=4)


# Initialize groups
groups = load_groups()

@app.route("/groups", methods=["GET"])
def fetch_groups():
    """Fetch all groups."""
    return jsonify({"groups": list(groups.keys())}), 200

@app.route("/groups", methods=["POST"])
def add_group():
    """Add a new group."""
    group_name = request.json.get("name")
    if not group_name:
        return jsonify({"error": "Group name is required."}), 400

    if group_name in groups:
        return jsonify({"error": "Group already exists."}), 400

    groups[group_name] = Group(group_name)
    save_groups(groups)
    return jsonify({"message": f"Group '{group_name}' added successfully."}), 201

@app.route("/groups/<group_name>/balance", methods=["GET"])
def get_balance_graph(group_name):
    """Fetch the balance graph for a specific group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    balance_graph = group.graph.balance_graph
    return jsonify({
        "nodes": list(set(balance_graph.graph.keys()) | 
                      set(to_user for edges in balance_graph.graph.values() for to_user in edges.keys())),
        "edges": [
            {"from": from_user, "to": to_user, "amount": amount}
            for from_user, edges in balance_graph.graph.items()
            for to_user, amount in edges.items()
        ]
    }), 200

@app.route("/groups/<group_name>/members", methods=["GET"])
def fetch_group_members(group_name):
    """Fetch members of a specific group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    return jsonify({"members": list(set(member.name for member in group.members))}), 200

@app.route("/groups/<group_name>/members", methods=["POST"])
def add_member_to_group(group_name):
    """Add a member to a specific group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    member_name = request.json.get("name")
    if not member_name:
        return jsonify({"error": "Member name is required."}), 400

    user = User(member_name)
    group.add_member(user)
    save_groups(groups)
    return jsonify({"message": f"Member '{member_name}' added to group '{group_name}'."}), 201

@app.route("/groups/<group_name>/transactions", methods=["GET"])
def fetch_group_transactions(group_name):
    """Fetch all transactions for a specific group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    transactions = [
        {
            "from_user": from_user,
            "to_user": transaction["to"],
            "amount": transaction["amount"],
            "category": transaction["category"],
            "timestamp": transaction["timestamp"],
        }
        for from_user, transactions in group.graph.graph.items()
        for transaction in transactions
    ]

    return jsonify({"transactions": transactions}), 200
@app.route("/groups/<group_name>/transactions", methods=["POST"])
def add_transaction(group_name):
    """Add a transaction to a group's expense graph and update the balance graph."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    data = request.json
    from_user = data.get("from_user")
    to_user = data.get("to_user")
    amount = data.get("amount")
    category = data.get("category")
    timestamp = data.get("timestamp")
    explanation = data.get("explanation")

    if not all([from_user, to_user, amount, category]):
        print([from_user, to_user, amount, category])
        return jsonify({"error": "Missing transaction details"}), 400

    try:
        group.graph.add_transaction(from_user, to_user, amount, category, timestamp, explanation)
        save_groups(groups)
        return jsonify({"message": "Transaction added successfully."}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@app.route("/groups/<group_name>/simplify-debts", methods=["POST"])
def simplify_debts(group_name):
    """Simplify debts for a specific group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    simplifier = DebtSimplification(group.graph.balance_graph)
    simplifier.simplify_debts()
    save_groups(groups)

    return jsonify({"message": f"Debts for group '{group_name}' simplified successfully."}), 200


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Splitwise Clone API"}), 200

@app.route("/groups/<group_name>/transactions/recent", methods=["GET"])
def fetch_recent_transactions(group_name):
    """Fetch the last three transactions for a specific group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    recent_transactions = group.graph.fetch_recent_transactions()
    return jsonify({"transactions": recent_transactions}), 200

@app.route('/search_transactions', methods=['GET'])
def search_transactions():
    group_name = request.args.get('group_name')  # Get the group name from the query parameters
    search_phrase = request.args.get('phrase', '')  # Get the search phrase from the query parameters

    # Assuming you have a way to access the group by name
    group = groups.get(group_name)  # 'groups' should be a dictionary of loaded groups
    if not group:
        return jsonify({"error": "Group not found"}), 404

    transactions = group.graph.get_all_transactions()  # Get all transactions from the group's graph
    filtered_transactions = [
        transaction for transaction in transactions
        if search_phrase.lower() in transaction['category'].lower() or
           search_phrase.lower() in transaction['explanation'].lower()
    ]

    return jsonify(filtered_transactions), 200  

@app.route("/groups/<group_name>/group_transactions", methods=["POST"])
def add_splitbill(group_name):
    """Add a transaction to a group's expense graph and update the balance graph."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    data = request.json
    from_user = data.get("from_user")  # Payer
    to_users = data.get("to_users")  # List of people who consumed
    amounts = data.get("amounts")  # Amounts owed by each consumer
    split_method = data.get("split_method")  # Method of split
    total_amount = data.get("total_amount")  # Total amount for ratio/percentage
    category = data.get("category")
    timestamp = data.get("timestamp")
    explanation = data.get("explanation")

    if not all([from_user, to_users, amounts, category, split_method]):
        return jsonify({"error": "Missing transaction details"}), 410

    if len(to_users) != len(amounts):
        print(to_users, amounts)
        return jsonify({"error": "Mismatch between to_users and amounts"}), 403

    try:
        if split_method in ["ratio", "percentage"]:
            if total_amount is None:
                return jsonify({"error": "Total amount is required for ratio or percentage splits."}), 402

            if from_user in to_users:
                payer_index = to_users.index(from_user)
                amount_to_delete = amounts.pop(payer_index)
                to_users.pop(payer_index)
                
            # Calculate total amounts 
            calculated_total = sum(amounts) + amount_to_delete

            # Add transactions for each user
            for to_user, amount in zip(to_users, amounts):
                group.graph.add_transaction(from_user, to_user, total_amount * amount / calculated_total , category, timestamp, explanation)
                
        else:
            for to_user, amount in zip(to_users, amounts):
                if to_user != from_user:
                    group.graph.add_transaction(from_user, to_user, amount, category, timestamp, explanation)

        save_groups(groups)
        return jsonify({"message": "Transaction added successfully."}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 401
    
    
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/scan-receipt', methods=['POST'])
def scan_receipt():
    image = request.files.get('photo')

    if image and not allowed_file(image.filename):
        return jsonify({'error': 'File type not allowed'}), 500

    try:
        # Save the image for debugging purposes
        file_path = os.path.join(UPLOAD_FOLDER, image.filename)
        image.save(file_path)

        # Perform OCR using pytesseract
        receipt_details = scanner.process_expense_receipt(file_path)

        if not receipt_details or 'items' not in receipt_details or not receipt_details['items']:
            return jsonify({'error': 'Could not extract the desired data from the photo'}), 502

        quantities = [item['quantity'] for item in receipt_details['items']]
        names = [item['name'] for item in receipt_details['items']]
        foods = []
        for i, food in enumerate(names):
            for j in range(int(quantities[i])):
                foods.append(f'{food} number {j+1}')
            
        return jsonify({'foods': foods, 'receiptDetails': receipt_details})
    
    except Exception as e:
        print(f"Error processing receipt: {e}")
        return jsonify({'error': 'Failed to process receipt'}), 501

    

@app.route('/scan-payment', methods=['POST'])
def scan_payment():
    image = request.files.get('photo')
    name = request.form.get('name')  

    if not image or not allowed_file(image.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    try:
        # Save the image for debugging purposes
        file_path = os.path.join(UPLOAD_FOLDER, secure_filename(image.filename))
        image.save(file_path)

        # Perform OCR using scanner logic
        amount, name_found = scanner.process_payment_receipt(file_path, name)

        if amount is None:  # Check if amount extraction failed
            return jsonify({'error': 'Could not extract the desired data from the photo'}), 422

        return jsonify({'amount': amount, 'name_found': name_found})

    except Exception as e:
        print(f"Error processing receipt: {e}")
        return jsonify({'error': 'Failed to process receipt'}), 500


        

if __name__ == "__main__":
    app.run(debug=True)
