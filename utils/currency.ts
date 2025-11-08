export const supportedCurrencies = [
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'USD', name: 'United States Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
];

export const formatCurrency = (value: number, currency: string) => {
    try {
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch (error) {
        console.warn(`Could not format currency for code: ${currency}. Falling back to USD.`);
        return new Intl.NumberFormat('en-IN', { 
            style: 'currency', 
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    }
};

export const formatCurrencyWhole = (value: number, currency: string) => {
    try {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    } catch (error) {
        console.warn(`Could not format currency for code: ${currency}. Falling back to USD.`);
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    }
};