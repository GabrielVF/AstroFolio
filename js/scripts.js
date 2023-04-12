// Variable to store the chart instance
let chart;

// Function to fetch token prices
async function fetchPrices() {
    const currency = localStorage.getItem("currency") || "usd";
    const tokenIds = tokens.map(token => token.id).join(",");
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd,${currency}`);
    const data = await response.json();

    let atomToUsd = 1;
    if (currency === "atom") {
        const atomResponse = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=cosmos&vs_currencies=usd");
        const atomData = await atomResponse.json();
        atomToUsd = atomData.cosmos.usd;
    }

    tokens.forEach(token => {
        let tokenPrice;

        if (currency === "atom") {
            tokenPrice = data[token.id].usd / atomToUsd;
        } else {
            tokenPrice = data[token.id][currency];
        }

        const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
        const tokenPriceElement = document.getElementById(`${token.name}Price`);

        if (tokenPriceElement) {
            tokenPriceElement.innerText = `${tokenPrice.toFixed(decimals)} ${currency.toUpperCase()}`;
        }

        token.price = tokenPrice;
    });

    calculateValue();
}

// Function to calculate the total value and individual token balances
function calculateValue() {
    let totalValue = 0;
    const currency = localStorage.getItem("currency") || "usd";
    const individualBalancesContainer = document.getElementById("individual-balances");

    if (individualBalancesContainer) {
        individualBalancesContainer.innerHTML = ""; // Clear the container before adding new elements
    }

    const chartData = [];

    tokens.forEach(token => {
        const tokenInput = document.getElementById(`${token.name}Tokens`);
        const tokenAmount = tokenInput ? parseFloat(tokenInput.value) : parseFloat(localStorage.getItem(`${token.name}Tokens`)) || 0;

        if (!isNaN(tokenAmount) && token.price) {
            totalValue += tokenAmount * token.price;

            // Add data to the chartData array if the balance is greater than zero
            chartData.push({
                tokenName: token.name,
                tokenTag: token.tag, // Add the token's "tag" property here
                tokenBalance: tokenAmount * token.price,
            });

        }
    });

    const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
    const resultElement = document.getElementById("result");

    if (resultElement) {
        resultElement.innerText = `${totalValue.toFixed(decimals)} ${currency.toUpperCase()}`;
    }
    
    toggleSections(totalValue);

    // Filter the chart data to exclude tokens with a zero balance
    const filteredChartData = chartData.filter(data => data.tokenBalance > 0);
    
    // Calculate the percentage of each token and add it to filteredChartData
    filteredChartData.forEach(data => {
        data.percentage = (data.tokenBalance / totalValue) * 100;
    });

    // Sort the chart data by balance descending and take the top 5
    const sortedChartData = filteredChartData.sort((a, b) => b.tokenBalance - a.tokenBalance).slice(0, 5);

    // Add individual balances and percentages to the container
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

    // Generate random colors for each token in filteredChartData
    const backgroundColors = filteredChartData.map(() => getRandomColor());

    // Create and update the pie chart
    if (document.getElementById("chart")) {
        if (chart) {
            chart.destroy(); // Destroy the previous chart before creating a new one
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

// Functions to save and load token amounts
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

// Functions to save and load currency
function saveCurrency() {
    const currencySelect = document.getElementById("currency");
    if (currencySelect) {
        localStorage.setItem("currency", currencySelect.value);
    }
}

function loadCurrency() {
    const savedCurrency = localStorage.getItem("currency");
    const currencySelect = document.getElementById("currency");

    if (savedCurrency && currencySelect) {
        currencySelect.value = savedCurrency;
    }
}

// Function to load all tokens
function loadAllTokens() {
    tokens.forEach(token => {
        loadToken(token.name);
    });
}

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Function to toggle sections based on total balance
function toggleSections(totalBalance) {
    const balanceSection = document.querySelector('.balance-section');
    const welcomeMessage = document.getElementById('welcome-message');
    
    if (totalBalance === 0) {
        balanceSection.style.display = 'none';
        welcomeMessage.style.display = 'block';
    } else {
        balanceSection.style.display = 'flex';
        welcomeMessage.style.display = 'none';
    }
}

// Event listener for the window load event
window.addEventListener("load", () => {
    loadAllTokens();
    loadCurrency();
    fetchPrices();
    const currencySelect = document.getElementById("currency");
    if (currencySelect) {
        currencySelect.addEventListener("change", () => {
            saveCurrency();
            fetchPrices();
        });
    }
});

