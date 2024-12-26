from flask import Flask, request, jsonify
from core.graph import ExpenseGraph  # Use your graph
from core.debt_simplification import DebtSimplification
from flask_cors import CORS
from models.group import Group
from models.user import User
import os
import json

app = Flask(__name__)
CORS(app)

# Initialize the graph and load stored users
expense_graph = ExpenseGraph()
debt_simplifier = DebtSimplification(expense_graph)
DATA_PATH = "data/graph.json"

# Load groups from JSON file or initialize empty groups
def load_groups():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, "r") as file:
            group_data = json.load(file)
            groups = {name: Group(name, members=[User(member) for member in data["nodes"]])
                      for name, data in group_data["groups"].items()}
            for name, data in group_data["groups"].items():
                for edge in data["edges"]:
                    groups[name].graph.add_transaction(
                        edge["from"], edge["to"], edge["amount"], edge["category"]
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
                     "category": transaction["category"], "timestamp": transaction["timestamp"]}
                    for from_user, transactions in group.graph.graph.items()
                    for transaction in transactions
                ]
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

@app.route("/groups/<group_name>/members", methods=["GET"])
def fetch_group_members(group_name):
    """Fetch members of a specific group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    return jsonify({"members": [member.name for member in group.members]}), 200

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

@app.route("/groups/<group_name>/transactions", methods=["POST"])
def add_transaction(group_name):
    """Add a transaction to a group."""
    group = groups.get(group_name)
    if not group:
        return jsonify({"error": f"Group '{group_name}' not found."}), 404

    data = request.json
    from_user = data.get("from_user")
    to_user = data.get("to_user")
    amount = data.get("amount")
    category = data.get("category")

    if not (from_user and to_user and amount and category):
        return jsonify({"error": "from_user, to_user, amount, and category are required."}), 400

    try:
        print(f"Received group_name: {from_user, to_user, float(amount), category}")
        group.graph.add_transaction(from_user, to_user, float(amount), category)
        save_groups(groups)
        return jsonify({"message": f"Transaction added: {from_user} owes {to_user} ${amount} for {category}."}), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

# Simplify debts
@app.route("/simplify-debts", methods=["GET"])
def simplify_debts():
    debt_simplifier.simplify_debts()
    return jsonify({"message": "Debts simplified successfully."}), 200


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Welcome to the Splitwise Clone API"}), 200


if __name__ == "__main__":
    app.run(debug=True)
