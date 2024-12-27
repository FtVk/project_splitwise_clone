import axios from "axios";

/**
 * Fetches the exchange rate between two currencies.
 * @param {string} sourceCurrency - The source currency (e.g., "USD").
 * @param {string} targetCurrency - The target currency (e.g., "EUR").
 * @returns {Promise<number>} - The exchange rate.
 */
const getExchangeRate = async (sourceCurrency, targetCurrency) => {
  const url = `https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`;
  
  try {
    const response = await axios.get(url);
    const rates = response.data.rates;

    if (!rates[targetCurrency]) {
      throw new Error("Invalid currency type provided.");
    }

    return rates[targetCurrency];
  } catch (error) {
    throw new Error("Error fetching data from the API");
  }
};

/**
 * Converts an amount from one currency to another.
 * @param {string} sourceCurrency - The source currency (e.g., "USD").
 * @param {string} targetCurrency - The target currency (e.g., "EUR").
 * @param {number} amount - The amount to convert.
 * @returns {Promise<number>} - The converted amount.
 */
const convertCurrency = async (sourceCurrency, targetCurrency, amount) => {
  const exchangeRate = await getExchangeRate(sourceCurrency, targetCurrency);
  return amount * exchangeRate;
};

export { getExchangeRate, convertCurrency };
