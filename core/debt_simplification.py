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

        # Refresh balance sheet
        self.graph.recalculate_balances()
