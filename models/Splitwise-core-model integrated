# File: user.py
class User:
    def __init__(self, name):
        self.name = name
        self.balance = None

    def __repr__(self):
        return f"User({self.name})"

# File: graph.py
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
        """Provide a basic textual visualization of the graph."""
        for user, edges in self.graph.items():
            for neighbor, amount in edges.items():
                print(f"{user} owes {neighbor}: {amount}")

# File: debt_simplification.py
class DebtSimplification:
    def __init__(self, graph):
        self.graph = graph

    def simplify_debts(self):
        """Simplify the graph by reducing the number of transactions."""
        # Create a net balance for each user
        net_balance = defaultdict(float)

        # Calculate net balances
        for from_user, obligations in self.graph.graph.items():
            for to_user, amount in obligations.items():
                net_balance[from_user] -= amount
                net_balance[to_user] += amount

        # Create lists for creditors and debtors
        creditors = {user: balance for user, balance in net_balance.items() if balance > 0}
        debtors = {user: -balance for user, balance in net_balance.items() if balance < 0}

        self.graph.graph.clear()

        # Simplify debts
        while debtors and creditors:
            # Get a debtor and a creditor
            debtor, debt_amount = next(iter(debtors.items()))
            creditor, credit_amount = next(iter(creditors.items()))

            # Settle the smallest amount between the debtor and creditor
            settle_amount = min(debt_amount, credit_amount)

            self.graph.graph[debtor][creditor] = settle_amount

            # Update balances
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

        # Refresh balance sheet using BalanceCalculation
        calculator = BalanceCalculation(self.graph)
        calculator.recalculate_balances()

# File: balance_calculation.py
class BalanceCalculation:
    def __init__(self, graph):
        self.graph = graph

    def recalculate_balances(self):
        """Recalculate all balances based on the current graph."""
        self.graph.balance.clear()  # Clear existing balances
        for from_user, obligations in self.graph.graph.items():
            for to_user, amount in obligations.items():
                self.graph.balance[from_user] -= amount
                self.graph.balance[to_user] += amount

    def get_balances(self):
        """Return a snapshot of all user balances."""
        return dict(self.graph.balance)

# File: group.py
class Group:
    def __init__(self, name, members=None):
        self.name = name
        self.members = [User('Me')] + (members or [])
        self.graph = ExpenseGraph()

    def add_member(self, user):
        if user not in self.members:
            self.members.append(user)

# Example usage
if __name__ == "__main__":
    graph = ExpenseGraph()

    graph.add_edge("A", "B", 50)  # A owes B $50
    graph.add_edge("B", "C", 30)
    graph.add_edge("C", "D", 10)
    graph.add_edge("D", "B", 40)

    print("=== Before Simplification ===")
    graph.visualize_graph()

    simplifier = DebtSimplification(graph)
    simplifier.simplify_debts()

    print("\n=== After Simplification ===")
    graph.visualize_graph()

    calculator = BalanceCalculation(graph)
    balances = calculator.get_balances()
    print("\n=== Final Balances ===")
    print(balances)
