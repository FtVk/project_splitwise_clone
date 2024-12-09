# Import the storage module
from utils.storage import save_data, load_data
import wx
import matplotlib.pyplot as plt
from models.group import Group
from models.user import User


class ExpenseTracker(wx.Frame):
    def __init__(self):
        # Initialize the main frame for the expense tracker application
        super().__init__(None, title="Expense Tracker")
        
        # Load existing groups and users from storage
        self.groups = load_data()
        self.current_users_names = []
        self.current_group = None
        self.currect_from_user = None
        self.currect_to_user = None
        
        # Create a panel and sizer for layout
        self.panel = wx.Panel(self)
        self.sizer = wx.BoxSizer(wx.VERTICAL)

        # Group selection label
        self.group_label = wx.StaticText(self.panel, label="Select Group:")
        self.sizer.Add(self.group_label, 0, wx.ALL, 5)
        
        # Dropdown for selecting a group
        self.group_choice = wx.Choice(self.panel, choices=[group.name for group in self.groups])
        self.group_choice.Bind(wx.EVT_CHOICE, self.on_group_select)
        self.sizer.Add(self.group_choice, 0, wx.ALL | wx.EXPAND, 5)

        # Button to add a new group
        self.add_group_button = wx.Button(self.panel, label="Add Group")
        self.add_group_button.Bind(wx.EVT_BUTTON, self.on_add_group)
        self.sizer.Add(self.add_group_button, 0, wx.ALL | wx.CENTER, 5)

        # User selection label
        self.user_label = wx.StaticText(self.panel, label="Select Users:")
        self.sizer.Add(self.user_label, 0, wx.ALL, 5)
        self.user_label = wx.StaticText(self.panel, label="Who paid?")
        self.sizer.Add(self.user_label, 0, wx.ALL, 5)
        
        # Dropdowns for selecting users to add expenses between
        self.user_from_choice = wx.Choice(self.panel)
        self.user_to_choice = wx.CheckListBox(self.panel)
        self.sizer.Add(self.user_from_choice, 0, wx.ALL | wx.EXPAND, 5)
        self.user_label = wx.StaticText(self.panel, label="Who are the debtors?")
        self.sizer.Add(self.user_label, 0, wx.ALL, 5)
        self.sizer.Add(self.user_to_choice, 0, wx.ALL | wx.EXPAND, 5)

        # Button to add a new user
        self.add_user_button = wx.Button(self.panel, label="Add User")
        self.add_user_button.Bind(wx.EVT_BUTTON, self.on_add_user)
        self.sizer.Add(self.add_user_button, 0, wx.ALL | wx.CENTER, 5)

        # Label and input for expense amount
        self.amount_label = wx.StaticText(self.panel, label="Expense Amount:")
        self.sizer.Add(self.amount_label, 0, wx.ALL, 5)
        
        self.amount_input = wx.TextCtrl(self.panel)
        self.sizer.Add(self.amount_input, 0, wx.ALL | wx.EXPAND, 5)

        # Button to add an expense
        self.add_expense_button = wx.Button(self.panel, label="Add Expense")
        self.add_expense_button.Bind(wx.EVT_BUTTON, self.on_add_expense)
        self.sizer.Add(self.add_expense_button, 0, wx.ALL | wx.CENTER, 5)

        # Button to view balances
        self.view_balance_button = wx.Button(self.panel, label="View Balance")
        self.view_balance_button.Bind(wx.EVT_BUTTON, self.on_view_balance)
        self.sizer.Add(self.view_balance_button, 0, wx.ALL | wx.CENTER, 5)

        # Button to view expense graph
        self.view_graph_button = wx.Button(self.panel, label="View Graph")
        self.view_graph_button.Bind(wx.EVT_BUTTON, self.on_view_graph)
        self.sizer.Add(self.view_graph_button, 0, wx.ALL | wx.CENTER, 5)

        # Set the sizer for the panel
        self.panel.SetSizer(self.sizer)
        self.SetSize((400, 400))  # Set initial window size
        self.Show()  # Show the application window

        # Bind the close event to save data
        self.Bind(wx.EVT_CLOSE, self.on_close)

    def on_group_select(self, event):
        # Event handler for when a group is selected
        current_group_name = self.group_choice.GetStringSelection()
        self.current_group = next((group for group in self.groups if group.name == current_group_name), None)
        self.current_users_names = [user.name for user in self.current_group.members]  
        self.update_user_choices()  # Update user dropdowns based on selected group

    def update_user_choices(self):
        # Update the user dropdowns based on the selected group
        if self.current_group:
            self.user_from_choice.SetItems(self.current_users_names)  # Set user names in the dropdown
            self.user_to_choice.SetItems(self.current_users_names)    # Set user names in the dropdown
        else:
            # If there is no current group, clear the dropdowns
            self.user_from_choice.SetItems([])
            self.user_to_choice.SetItems([])

    def on_add_group(self, event):
        # Event handler for adding a new group
        group_name = wx.GetTextFromUser ("Enter the name of the new group:", "Add Group")
        
        if group_name:
            if group_name not in [group.name for group in self.groups]:
                group = Group(name=group_name)  # Initialize the new group
                self.groups.append(group)
                self.group_choice.Append(group_name)  # Add the new group to the dropdown
                wx.MessageBox(f"Group '{group_name}' added successfully!", "Success")
            else:
                wx.MessageBox(f"Group '{group_name}' already exists!", "Error")

    def on_add_user(self, event):
        # Event handler for adding a new user to the selected group
        if not self.current_group:
            wx.MessageBox("Please select a group first.", "Error")
            return
        
        user_name = wx.GetTextFromUser ("Enter the name of the new user:", "Add User")
        
        if user_name:
            if user_name not in [user.name for user in self.current_group.members]:
                user = User(user_name)  # Initialize user 
                self.current_group.add_member(user)
                self.current_users_names.append(user.name)
                self.update_user_choices()  # Update user dropdowns
                wx.MessageBox(f"User  '{user_name}' added to group '{self.current_group.name}' successfully!", "Success")
            else:
                wx.MessageBox(f"User  '{user_name}' already exists in group '{self.current_group.name}'!", "Error")

    def on_add_expense(self, event):
        # Get the selected payer and debtors
        user_from_name = self.user_from_choice.GetStringSelection()
        selected_debtors_indexes = self.user_to_choice.GetCheckedItems()
        debtors_names = [self.user_to_choice.GetString(idx) for idx in selected_debtors_indexes]

        # Get the expense amount
        amount = self.amount_input.GetValue()

        # Validation
        if not user_from_name or not debtors_names or not amount:
            wx.MessageBox("Please select a payer, at least one debtor, and specify an amount.", "Error")
            return

        if user_from_name in debtors_names:
            wx.MessageBox("The payer cannot be a debtor.", "Error")
            return

        try:
            amount = float(amount)  # Convert the amount to a float
        except ValueError:
            wx.MessageBox("Please enter a valid numeric amount.", "Error")
            return

        # Split the expense amount equally among debtors
        people_number = len(debtors_names)+1 if len(debtors_names) > 1 else 1
        per_person_amount = amount / people_number

        # Get user objects for the payer and debtors
        payer = next((user for user in self.current_group.members if user.name == user_from_name), None)
        debtors = [user for user in self.current_group.members if user.name in debtors_names]

        # Update the group's expense graph
        for debtor in debtors:
            self.current_group.graph.add_edge(payer, debtor, per_person_amount)

        # Clear the input fields
        self.amount_input.Clear()
        self.user_to_choice.SetChecked([])  # Uncheck all items in the checklist
        wx.MessageBox(f"Expense of {amount} has been added. Each debtor owes {per_person_amount:.2f}.", "Success")

    def on_view_balance(self, event):
        # Event handler for viewing balances
        balances = self.current_group.graph.balance
    
        # Create a message
    def on_view_balance(self, event):
        # Event handler for viewing balances
        balances = self.current_group.graph.balance
    
        # Create a message displaying the balances for each user
        balance_message = "\n".join([f"{user.name}: {balance}" for user, balance in balances.items()])
        wx.MessageBox(balance_message, "Balances")  # Show the balances in a message box

    def on_view_graph(self, event):
        # Event handler for viewing the expense graph
        balances = self.current_group.graph.balance
        # Create a bar chart to visualize the balances
        plt.bar([x.name for x in balances.keys()], balances.values(), color='blue')
        plt.ylabel('Balance')  # Label for the y-axis
        plt.title('Expense Balances by User')  # Title of the graph
        plt.axhline(0, color='black', linewidth=0.8, linestyle='--')  # Line at y=0 for reference
        plt.xticks(rotation=45)  # Rotate x-axis labels for better readability
        plt.tight_layout()  # Adjust layout to prevent clipping of tick-labels
        plt.show()  # Display the graph

    def on_close(self, event):
        """Event handler for closing the application."""
        save_data(self.groups)  # Save the current groups and users to a file
        self.Destroy()  # Close the application

def main():
    # Main function to run the application
    app = wx.App(False)  # Create a new application instance
    
    # Initialize the Expense Tracker
    tracker = ExpenseTracker()

    app.MainLoop()  # Start the application's main loop

if __name__ == "__main__":
    main()  # Run the main function when the script is executed