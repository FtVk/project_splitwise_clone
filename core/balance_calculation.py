#from datetime import datetime, timedelta

def balance_update(balance, from_user, to_user, amount):
    balance[from_user] -= amount
    balance[to_user] += amount
    
#class RecurringExpense:
    def __init__(self, description, amount, payer, participants, interval_days):
        self.expense = Expense(description, amount, payer, participants)
        self.interval_days = interval_days
        self.next_due_date = datetime.now() + timedelta(days=interval_days)

    def is_due(self):
        return datetime.now() >= self.next_due_date

    def update_next_due_date(self):
        self.next_due_date += timedelta(days=self.interval_days)
