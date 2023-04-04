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

            // Agrega datos al array chartData si el saldo es mayor que cero
            chartData.push({
                tokenName: token.name,
                tokenTag: token.tag, // Agrega la propiedad "tag" del token aquí
                tokenBalance: tokenAmount * token.price,
            });

        }
    });

    const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
    const resultElement = document.getElementById("result");

    if (resultElement) {
        resultElement.innerText = `${totalValue.toFixed(decimals)} ${currency.toUpperCase()}`;
    }

    // Filtrar los datos del gráfico para excluir tokens con saldo cero
    const filteredChartData = chartData.filter(data => data.tokenBalance > 0);
    
    // Calcular el porcentaje de cada token y agregarlo a filteredChartData
    filteredChartData.forEach(data => {
        data.percentage = (data.tokenBalance / totalValue) * 100;
    });

    // Ordenar los datos del gráfico por saldo descendente y tomar los 5 más altos
    const sortedChartData = filteredChartData.sort((a, b) => b.tokenBalance - a.tokenBalance).slice(0, 5);

    // Agregar saldos individuales y porcentajes al contenedor
    sortedChartData.forEach(data => {
        if (individualBalancesContainer && data.tokenBalance > 0) {
            const individualBalanceElement = document.createElement("div");
            individualBalanceElement.className = "individual-balance-item";
            individualBalanceElement.innerHTML = `
                <span class="token-name">${data.tokenTag}:</span>
                <span class="token-balance">${data.tokenBalance.toFixed(decimals)} ${currency.toUpperCase()} (${data.percentage.toFixed(2)}%)</span>
            `;
            individualBalancesContainer.appendChild(individualBalanceElement);
        }
    });

    // Generar colores aleatorios para cada token en filteredChartData
    const backgroundColors = filteredChartData.map(() => getRandomColor());

    // Crear y actualizar el gráfico circular
    if (document.getElementById("chart")) {
        if (chart) {
            chart.destroy(); // Destruye el gráfico anterior antes de crear uno nuevo
        }

        const ctx = document.getElementById("chart").getContext("2d");
        chart = new Chart(ctx, {
            type: "pie",
            data: {
                labels: filteredChartData.map(data => data.tokenName),
                datasets: [
                    {
                        data: filteredChartData.map(data => data.tokenBalance),
                        backgroundColor: backgroundColors,
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

function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

window.addEventListener("load", () => {
    loadAllTokens();
    loadCurrency();
    fetchPrices();
});
