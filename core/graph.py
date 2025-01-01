from collections import defaultdict
from datetime import datetime
from core.balance_calculation import BalanceGraph
from core.debt_simplification import DebtSimplification
import uuid

class ExpenseGraph:
    def __init__(self):
        # Graph to store detailed transaction history
        self.graph = defaultdict(list)
        self.balance_graph = BalanceGraph()

    def add_transaction(self, from_user, to_user, amount, category, timestamp=None, explanation=None, transaction_id=None):
        """Add a transaction between users and update the balance graph."""
        if amount <= 0:
            raise ValueError("Amount must be positive.")
        
        if timestamp is None:
            timestamp = datetime.utcnow().isoformat()
        
        if transaction_id is None:
            transaction_id = str(uuid.uuid4())

        transaction = {
            "to": to_user,
            "amount": amount,
            "category": category,
            "timestamp": timestamp,
            "explanation": explanation,
            "transaction_id": transaction_id
        }
        
        # Add the transaction to the history
        self.graph[from_user].append(transaction)

        # Update the balance graph
        self.balance_graph.add_edge(from_user, to_user, amount)
    
    def delete_transaction(self, transaction_id):
        """Delete a specific transaction by its unique ID and update the balance graph."""
        for user, transactions in self.graph.items():
            for transaction in transactions:
                if transaction["transaction_id"] == transaction_id:
                    transactions.remove(transaction)
                    self.balance_graph.add_edge(user, transaction["to_user"], -transaction["amount"])
                    self.simplify_balances()

                    return True
        return False


    def fetch_recent_transactions(self):
        # Assuming selected_group is a list of users in the group
        all_transactions = self.get_all_transactions()

        all_transactions.sort(key=lambda x: x["timestamp"], reverse=True)

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
    
    def get_all_transactions(self):
        transactions = []
        for key, value in self.graph.items():
            for expense in value:
                transaction = expense
                transaction['from'] = key
                transactions.append(transaction)
        return transactions
