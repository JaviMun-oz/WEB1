// app.js — the oracle chooses its secret number:
const secret = Math.floor(Math.random() * 100) + 1;

const attempt = document.querySelector("#attempt");
const test = document.querySelector("#test");
const response = document.querySelector("#response");
const marker = document.querySelector("#marker");

test.addEventListener("click", () => {
    const guess = Number(attempt.value);
    response.textContent = `You said: ${guess}`;
});

console.log(
    "(psst... the secret is",
    secret,
    "— remove this line when finished)"
);
