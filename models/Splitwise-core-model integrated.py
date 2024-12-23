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
        self.balance = defaultdict(float)  # Example: {"Alice": -50, "Bob": 50}

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
    # Step 1: Create a group
    group = Group("Friends")
    group.add_member(User("Alice"))
    group.add_member(User("Bob"))
    group.add_member(User("Charlie"))

    # Step 2: Add some expenses within the group
    group.graph.add_edge("Me", "Alice", 20)  # Me owes Alice $20
    group.graph.add_edge("Alice", "Bob", 50)  # Alice owes Bob $50
    group.graph.add_edge("Bob", "Charlie", 30)  # Bob owes Charlie $30
    group.graph.add_edge("Charlie", "Me", 10)  # Charlie owes Me $10

    print("=== Before Simplification ===")
    group.graph.visualize_graph()

    # Step 3: Simplify the debts within the group
    simplifier = DebtSimplification(group.graph)
    simplifier.simplify_debts()

    print("\n=== After Simplification ===")
    group.graph.visualize_graph()

    # Step 4: Recalculate and get balances within the group
    calculator = BalanceCalculation(group.graph)
    balances = calculator.get_balances()
    print("\n=== Final Balances ===")
    print(balances)
