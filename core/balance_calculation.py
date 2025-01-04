from collections import defaultdict
import json

class BalanceGraph:
    def __init__(self):
        # Graph to store simplified financial obligations
        self.graph = defaultdict(dict)  # Directed graph of debts
        self.balance = defaultdict(float)  # Net balance for each user

    def add_edge(self, from_user, to_user, amount):
        """Add or update a financial obligation between users."""
        if from_user == to_user:
            raise ValueError("A user cannot owe themselves.")
        
        if amount <= 0:
            raise ValueError("Amount must be positive.")

        # Update the graph
        if to_user in self.graph[from_user]:
            self.graph[from_user][to_user] += amount
        else:
            self.graph[from_user][to_user] = amount

        # Update the balance sheet
        self.update_balance(from_user, to_user, amount)

    def update_balance(self, from_user, to_user, amount):
        """Update the balance sheet for users."""
        self.balance[from_user] -= amount
        self.balance[to_user] += amount

    def visualize_graph(self):
        """Visualize the simplified debt graph."""
        for from_user, edges in self.graph.items():
            for to_user, amount in edges.items():
                print(f"{from_user} owes {to_user}: {amount}")

    # Serialization: Save graph and balances to a JSON file
    def save_to_file(self, filename):
        data = {
            "graph": {user: {neighbor: amount for neighbor, amount in edges.items()}
                      for user, edges in self.graph.items()},
            "balance": dict(self.balance)
        }
        with open(filename, "w") as file:
            json.dump(data, file, indent=4)

    def balance_to_dict(self):
        """Convert balance graph to a dictionary format."""
        return {
            "graph": {from_user: {to_user: amount for to_user, amount in edges.items()}
                    for from_user, edges in self.graph.items()},
            "balance": dict(self.balance)
        }

    # Deserialization: Load graph and balances from a JSON file
    def load_from_file(self, filename):
        with open(filename, "r") as file:
            data = json.load(file)
            self.graph = defaultdict(dict, {user: edges for user, edges in data["graph"].items()})
            self.balance = defaultdict(float, data["balance"])


