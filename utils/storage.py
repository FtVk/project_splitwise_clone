import pickle
import os

# Define the file path to save the data
DATA_FILE = "expense_tracker_data.pkl"

def save_data(groups):
    """Save the groups data to a file."""
    with open(DATA_FILE, "wb") as file:
        pickle.dump(groups, file)

def load_data():
    """Load the groups data from a file."""
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, "rb") as file:
            return pickle.load(file)
    return []  # Return an empty list if no data file exists
