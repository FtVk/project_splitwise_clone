from collections import defaultdict
from datetime import datetime
import json

class ExpenseGraph:
    def __init__(self):
        # Graph to store detailed transaction history
        self.transactions = defaultdict(list)  # Stores detailed transactions
        self.balance_graph = BalanceGraph()    # Underlying balance graph

    def add_transaction(self, from_user, to_user, amount, category, timestamp=None):
        """Add a transaction between users and update the balance graph."""
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()
        
        transaction = {
            "to": to_user,
            "amount": amount,
            "category": category,
            "timestamp": timestamp
        }
        
        # Add the transaction to the history
        self.transactions[from_user].append(transaction)

        # Update the balance graph
        self.balance_graph.add_edge(from_user, to_user, amount)

    def visualize_transactions(self):
        """Visualize the detailed transactions."""
        for user, transactions in self.transactions.items():
            print(f"Transactions by {user}:")
            for transaction in transactions:
                print(f"  -> {transaction['to']} | {transaction['amount']} | {transaction['category']} | {transaction['timestamp']}")

    def simplify_balances(self):
        """Simplify the underlying balance graph."""
        simplifier = DebtSimplification(self.balance_graph)
        simplifier.simplify_debts()

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



class DebtSimplification:
    def __init__(self, balance_graph):
        self.graph = balance_graph

    def simplify_debts(self):
        """Simplify the graph by reducing the number of transactions."""
        # Create a net balance for each user
        net_balance = defaultdict(float)

        # Calculate net balances based on the graph
        for from_user, obligations in self.graph.graph.items():
            for to_user, amount in obligations.items():
                net_balance[from_user] -= amount
                net_balance[to_user] += amount

        # Separate creditors and debtors
        creditors = {user: balance for user, balance in net_balance.items() if balance > 0}
        debtors = {user: -balance for user, balance in net_balance.items() if balance < 0}

        # Clear the existing graph
        self.graph.graph.clear()

        # Simplify debts using a greedy approach
        while debtors and creditors:
            # Get a debtor and a creditor
            debtor, debt_amount = next(iter(debtors.items()))
            creditor, credit_amount = next(iter(creditors.items()))

            # Settle the smallest amount between debtor and creditor
            settle_amount = min(debt_amount, credit_amount)

            # Update the graph with the simplified debt
            self.graph.add_edge(debtor, creditor, settle_amount)

            # Adjust the amounts
            debt_amount -= settle_amount
            credit_amount -= settle_amount

            # Remove settled users or update remaining amounts
            if debt_amount == 0:
                del debtors[debtor]
            else:
                debtors[debtor] = debt_amount

            if credit_amount == 0:
                del creditors[creditor]
            else:
                creditors[creditor] = credit_amount

        # Recalculate balances in the BalanceGraph
        self.recalculate_balances()

    def recalculate_balances(self):
        """Recalculate all balances based on the simplified graph."""
        self.graph.balance.clear()  # Clear the existing balance sheet
        for from_user, obligations in self.graph.graph.items():
            for to_user, amount in obligations.items():
                self.graph.update_balance(from_user, to_user, amount)

# Initialize the ExpenseGraph
#expense_graph = ExpenseGraph()


# Add transactions
#expense_graph.add_transaction("Alice", "Bob", 50, "Lunch")
#expense_graph.add_transaction("Alice", "Charlie", 30, "Lunch")
#expense_graph.add_transaction("Bob", "Charlie", 30, "Dinner")
#expense_graph.add_transaction("Charlie", "Alice", 40, "Gift")

#print("\n=== Detailed Transactions ===")
#expense_graph.visualize_transactions()

#print("\n=== Simplified Balances Before Simplification ===")
#expense_graph.balance_graph.visualize_graph()

# Simplify debts
#expense_graph.simplify_balances()

#print("\n=== Simplified Balances After Simplification ===")
#expense_graph.balance_graph.visualize_graph()
