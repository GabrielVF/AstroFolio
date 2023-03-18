const atomTokensInput = document.getElementById("atomTokens");
const lunaTokensInput = document.getElementById("lunaTokens");
const currencySelect = document.getElementById("currency");
const atomPriceDisplay = document.getElementById("atomPrice");
const lunaPriceDisplay = document.getElementById("lunaPrice");

atomTokensInput.addEventListener("input", () => {
    saveAtomTokens();
    calculateValue();
});

lunaTokensInput.addEventListener("input", () => {
    saveLunaTokens();
    calculateValue();
});

async function fetchPrices() {
    const currency = currencySelect.value;
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=cosmos,terra-luna-2&vs_currencies=${currency}`);
    const data = await response.json();
    const atomPrice = data.cosmos[currency];
    const lunaPrice = data["terra-luna-2"][currency];
    const decimals = (currency === "usd" || currency === "eur") ? 2 : 8;
    atomPriceDisplay.innerText = `${atomPrice.toFixed(decimals)} ${currency.toUpperCase()}`;
    lunaPriceDisplay.innerText = `${lunaPrice.toFixed(decimals)} ${currency.toUpperCase()}`;
    calculateValue();
}

function calculateValue() {
    const atomTokens = parseFloat(atomTokensInput.value);
    const atomPrice = parseFloat(atomPriceDisplay.innerText);
    const lunaTokens = parseFloat(lunaTokensInput.value);
    const lunaPrice = parseFloat(lunaPriceDisplay.innerText);
    const currency = currencySelect.value.toUpperCase();

    if (isNaN(atomTokens) || isNaN(atomPrice) ||
        isNaN(lunaTokens) || isNaN(lunaPrice)) {
        document.getElementById("result").innerText = "";
        return;
    }

    const atomValue = atomTokens * atomPrice;
    const lunaValue = lunaTokens * lunaPrice;
    const totalValue = atomValue + lunaValue;
    const decimals = (currency === "USD" || currency === "EUR") ? 2 : 8;
    document.getElementById("result").innerText = `Total balance: ${totalValue.toFixed(decimals)} ${currency}`;
}

function saveAtomTokens() {
    localStorage.setItem("atomTokens", atomTokensInput.value);
}

function loadAtomTokens() {
    const savedAtomTokens = localStorage.getItem("atomTokens");
    if (savedAtomTokens) {
        atomTokensInput.value = savedAtomTokens;
    }
}

function saveLunaTokens() {
    localStorage.setItem("lunaTokens", lunaTokensInput.value);
}

function loadLunaTokens() {
    const savedLunaTokens = localStorage.getItem("lunaTokens");
    if (savedLunaTokens) {
        lunaTokensInput.value = savedLunaTokens;
    }
}

function saveCurrency() {
    localStorage.setItem("currency", currencySelect.value);
}

function loadCurrency() {
    const savedCurrency = localStorage.getItem("currency");
    if (savedCurrency) {
        currencySelect.value = savedCurrency;
    }
}

window.addEventListener("load", () => {
    loadAtomTokens();
    loadLunaTokens();
    loadCurrency();
    fetchPrices();
});
