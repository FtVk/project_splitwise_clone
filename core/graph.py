import json
from collections import defaultdict
from datetime import datetime

class ExpenseGraph:
    def __init__(self):
        # Graph to store financial obligations
        self.graph = defaultdict(list)
        # Balance sheet for all users
        self.balance = defaultdict(float)


    def add_transaction(self, from_user, to_user, amount, category):
        """Add a transaction as an edge between two users."""

        if amount <= 0:
            raise ValueError("Amount must be positive.")
        
        timestamp = datetime.utcnow().isoformat()

        transaction = {
            "to": to_user,
            "amount": amount,
            "category": category,
            "timestamp": timestamp
        }
        self.graph[from_user].append(transaction)

         # Update balance sheet
        self.update_balance(from_user, to_user, amount)

    def update_balance(self, from_user, to_user, amount):
        """Update balances for users involved in a transaction."""
        self.balance[from_user] -= amount
        self.balance[to_user] += amount

    def get_transactions(self, user):
        """Get all transactions involving a specific user."""
        if user not in self.graph:
            raise ValueError(f"User {user} does not exist.")
        return self.graph[user]

    def save_graph(self, file_path="data/graph.json"):
        """Save the graph to a file."""
        with open(file_path, "w") as file:
            json.dump(self.graph, file, indent=4)

    def load_graph(self, file_path="data/graph.json"):
        """Load the graph from a file."""
        try:
            with open(file_path, "r") as file:
                self.graph = json.load(file)
        except FileNotFoundError:
            self.graph = {}

            for neighbor, amount in edges.items():
                print(f"{user} owes {neighbor}: {amount}")

