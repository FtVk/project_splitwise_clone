from collections import defaultdict

class ExpenseGraph:
    def __init__(self):
        # Graph to store financial obligations
        self.graph = defaultdict(dict)
        # Balance sheet for all users
        self.balance = defaultdict(float)

    def add_edge(self, from_user, to_user, amount):
        """Add or update a financial obligation between users."""
        if amount <= 0:
            raise ValueError("Amount must be positive.")

        if to_user in self.graph[from_user]:
            self.graph[from_user][to_user] += amount
        else:
            self.graph[from_user][to_user] = amount
        # Update balance sheet
        self.update_balance(from_user, to_user, amount)

    def update_balance(self, from_user, to_user, amount):
        """Update balances for users involved in a transaction."""
        self.balance[from_user] -= amount
        self.balance[to_user] += amount

    def visualize_graph(self):
        """(Optional) Provide a basic textual visualization of the graph."""
        for user, edges in self.graph.items():
            for neighbor, amount in edges.items():
                print(f"{user} owes {neighbor}: {amount}")

