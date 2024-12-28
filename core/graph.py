import json
from collections import defaultdict
from datetime import datetime
from core.balance_calculation import BalanceGraph
from core.debt_simplification import DebtSimplification

class ExpenseGraph:
    def __init__(self):
        # Graph to store detailed transaction history
        self.graph = defaultdict(list)  # Stores detailed transactions
        self.balance_graph = BalanceGraph()    # Underlying balance graph

    def add_transaction(self, from_user, to_user, amount, category, timestamp=None, explanation=None):
        """Add a transaction between users and update the balance graph."""
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()
        
        transaction = {
            "to": to_user,
            "amount": amount,
            "category": category,
            "timestamp": timestamp,
            "explanation": explanation
        }
        
        # Add the transaction to the history
        self.graph[from_user].append(transaction)

        # Update the balance graph
        self.balance_graph.add_edge(from_user, to_user, amount)
        
    def fetch_recent_transactions(self, selected_group):
        # Assuming selected_group is a list of users in the group
        all_transactions = []

        for user in selected_group:
            if user in self.graph:
                all_transactions.extend(self.graph[user])

        # Sort transactions by timestamp in descending order
        all_transactions.sort(key=lambda x: x["timestamp"], reverse=True)

        # Return the last three transactions
        return all_transactions[:3]

    def visualize_transactions(self):
        """Visualize the detailed transactions."""
        for user, transactions in self.graph.items():
            print(f"Transactions by {user}:")
            for transaction in transactions:
                print(f"  -> {transaction['to']} | {transaction['amount']} | {transaction['category']} | {transaction['timestamp']}")

    def simplify_balances(self):
        """Simplify the underlying balance graph."""
        simplifier = DebtSimplification(self.balance_graph)
        simplifier.simplify_debts()

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
