from collections import defaultdict

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
