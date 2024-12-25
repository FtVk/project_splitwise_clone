import requests

def get_exchange_rate(source_currency, target_currency):
    url = f"https://api.exchangerate-api.com/v4/latest/{source_currency}"
    response = requests.get(url)
    
    if response.status_code != 200:
        raise Exception("Error fetching data from the API")
    
    data = response.json()
    return data['rates'].get(target_currency)

def convert_currency(source_currency, target_currency, amount):
    # Get the exchange rate
    exchange_rate = get_exchange_rate(source_currency, target_currency)
    
    if exchange_rate is None:
        raise ValueError("Invalid currency type provided.")
    
    # Calculate the converted amount
    converted_amount = amount * exchange_rate
    return converted_amount

