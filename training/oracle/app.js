// app.js — the oracle chooses its secret number:
const secret = Math.floor(Math.random() * 100) + 1;

const attempt = document.querySelector("#attempt");
const test = document.querySelector("#test");
const response = document.querySelector("#response");
const marker = document.querySelector("#marker");

let attempts = 0;
marker.textContent = `Attempts: ${attempts}`;

test.addEventListener("click", () => {
    const guess = Number(attempt.value);

    if (attempt.value === "" || Number.isNaN(guess) || guess < 1 || guess > 100) {
        response.textContent = "Please enter a number between 1 and 100.";
        return;
    }

    attempts += 1;
    marker.textContent = `Attempts: ${attempts}`;

    if (guess === secret) {
        response.textContent = `Correct! You guessed the secret number in ${attempts} attempts.`;
        test.disabled = true;
    } else if (guess < secret) {
        response.textContent = "Too low! Try a higher number.";
    } else if (guess > secret) {
        response.textContent = "Too high! Try a lower number.";
    }
});

console.log(
    "(psst... the secret is",
    secret,
    "— remove this line when finished)"
);
