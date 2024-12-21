class BalanceCalculation:
    def __init__(self, graph):
        self.graph = graph

    def recalculate_balances(self):
        """Recalculate all balances based on the current graph."""
        self.graph.balance.clear()
        for from_user, obligations in self.graph.graph.items():
            for to_user, amount in obligations.items():
                self.graph.balance[from_user] -= amount
                self.graph.balance[to_user] += amount

    def get_balances(self):
        """Return a snapshot of all user balances."""
        return dict(self.graph.balance)
