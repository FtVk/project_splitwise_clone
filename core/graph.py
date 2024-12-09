from collections import defaultdict
from . import balance_calculation

class ExpenseGraph:
    def __init__(self):
        self.graph = defaultdict(dict)
        self.balance = defaultdict(float)  # Store balances here

    def add_edge(self, from_user, to_user, amount):
        if to_user in self.graph[from_user]:
            self.graph[from_user][to_user] += amount
        else:
            self.graph[from_user][to_user] = amount
        
        balance_calculation.balance_update(self.balance, from_user, to_user, amount)

