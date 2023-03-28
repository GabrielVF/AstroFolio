const tokens = [
    { name: "ATOM", id: "cosmos" },
    { name: "LUNA", id: "terra-luna-2" },
    { name: "OSMO", id: "osmosis" },
    { name: "JUNO", id: "juno-network" },
    { name: "EVMOS", id: "evmos" },
    { name: "KUJI", id: "kujira" },
];

let chart;

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
    const individualBalancesContainer = document.getElementById("individual-balances");

    if (individualBalancesContainer) {
        individualBalancesContainer.innerHTML = ""; // Limpiar el contenedor antes de agregar nuevos elementos
    }

    const chartData = [];

    tokens.forEach(token => {
        const tokenInput = document.getElementById(`${token.name}Tokens`);
        const tokenAmount = tokenInput ? parseFloat(tokenInput.value) : parseFloat(localStorage.getItem(`${token.name}Tokens`)) || 0;

        if (!isNaN(tokenAmount) && token.price) {
            totalValue += tokenAmount * token.price;

            // Agregar saldos individuales al contenedor solo si el saldo es mayor que cero
            if (individualBalancesContainer && tokenAmount * token.price > 0) {
                const tokenBalance = tokenAmount * token.price;
                const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
                const individualBalanceElement = document.createElement("p");
                individualBalanceElement.innerText = `${token.name}: ${tokenBalance.toFixed(decimals)} ${currency.toUpperCase()}`;
                individualBalancesContainer.appendChild(individualBalanceElement);
            // Agrega datos al array chartData si el saldo es mayor que cero
            chartData.push({
                tokenName: token.name,
                tokenBalance: tokenAmount * token.price,
            });
        }
    }
});

const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
const resultElement = document.getElementById("result");

if (resultElement) {
    resultElement.innerText = `${totalValue.toFixed(decimals)} ${currency.toUpperCase()}`;
}

// Crear y actualizar el gráfico circular
if (document.getElementById("chart")) {
    if (chart) {
        chart.destroy(); // Destruye el gráfico anterior antes de crear uno nuevo
    }

    const ctx = document.getElementById("chart").getContext("2d");
    chart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: chartData.map(data => data.tokenName),
            datasets: [
                {
                    data: chartData.map(data => data.tokenBalance),
                    backgroundColor: [
                        "#FF6384",
                        "#36A2EB",
                        "#FFCE56",
                        "#4BC0C0",
                        "#9966FF",
                        "#FF9F40",
                    ],
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "bottom",
                },
            },
        },
    });
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
