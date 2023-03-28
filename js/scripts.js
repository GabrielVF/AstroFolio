const tokens = [
    { name: "ATOM", id: "cosmos" },
    { name: "LUNA", id: "terra-luna-2" },
    { name: "OSMO", id: "osmosis" },
    { name: "JUNO", id: "juno-network" },
    { name: "EVMOS", id: "evmos" },
    { name: "KUJI", id: "kujira" },
];

async function fetchPrices() {
    const currency = localStorage.getItem("currency") || "usd";
    const tokenIds = tokens.map(token => token.id).join(",");
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=${currency}`);
    const data = await response.json();

    tokens.forEach(token => {
        const tokenPrice = data[token.id][currency];
        const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
        const tokenPriceElement = document.getElementById(`${token.name}Price`);

        if (tokenPriceElement) {
            tokenPriceElement.innerText = `${tokenPrice.toFixed(decimals)} ${currency.toUpperCase()}`;
        }

        token.price = tokenPrice;
    });

    calculateValue();
}

function calculateValue() {
    let totalValue = 0;
    const currency = localStorage.getItem("currency") || "usd";

    tokens.forEach(token => {
        const tokenInput = document.getElementById(`${token.name}Tokens`);
        const tokenAmount = tokenInput ? parseFloat(tokenInput.value) : parseFloat(localStorage.getItem(`${token.name}Tokens`)) || 0;

        if (!isNaN(tokenAmount) && token.price) {
            totalValue += tokenAmount * token.price;
        }
    });

    const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
    const resultElement = document.getElementById("result");

    if (resultElement) {
        resultElement.innerText = `Total balance: ${totalValue.toFixed(decimals)} ${currency.toUpperCase()}`;
    }
}

function saveToken(tokenName) {
    const tokenInput = document.getElementById(`${tokenName}Tokens`);
    localStorage.setItem(tokenName + "Tokens", tokenInput.value);
}

function loadToken(tokenName) {
    const savedToken = localStorage.getItem(tokenName + "Tokens");
    const tokenInput = document.getElementById(`${tokenName}Tokens`);

    if (savedToken && tokenInput) {
        tokenInput.value = savedToken;
    }
}

function saveCurrency() {
    const currencySelect = document.getElementById("currency");
    localStorage.setItem("currency", currencySelect.value);
}

function loadCurrency() {
    const savedCurrency = localStorage.getItem("currency");
    const currencySelect = document.getElementById("currency");

    if (savedCurrency && currencySelect) {
        currencySelect.value = savedCurrency;
    }
}

function loadAllTokens() {
    tokens.forEach(token => {
        loadToken(token.name);
    });
}

window.addEventListener("load", () => {
    loadAllTokens();
    loadCurrency();
    fetchPrices();
});
