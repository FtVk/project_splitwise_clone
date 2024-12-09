from .user import User
from core.graph import ExpenseGraph

class Group:
    def __init__(self, name, members=None):
        self.name = name
        self.members = [User('Me')] + (members or [])
        self.graph = ExpenseGraph()

    def add_member(self, user):
        if user not in self.members:
            self.members.append(user)
