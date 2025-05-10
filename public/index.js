"use strict";

const validPasswords = [
  "44d179d8fb7b6d01bd4617892085c4e7c2326dcc58d3a0b38bd9b7d51f16178a", // o
  "7ebbbf813ec4387ec0c4c5a914f6b7b66d73ad256c500e81eb15f195b0fcdb64"  // e
];

const passwordScreen = document.getElementById("password-screen");
const mainContent = document.getElementById("main-content");
const passwordInput = document.getElementById("password-input");
const submitPassword = document.getElementById("submit-password");
const passwordError = document.getElementById("password-error");

//  localStorage 
const storedHash = localStorage.getItem("passwordHash");
if (validPasswords.includes(storedHash)) {
  passwordScreen.style.display = "none";
  mainContent.style.display = "block";
  mainContent.style.animation = "fadeIn 0.8s ease-out";
}

submitPassword.addEventListener("click", (e) => {
  e.preventDefault();
  const password = passwordInput.value;
  const hashedPassword = CryptoJS.SHA256(password).toString();

  if (validPasswords.includes(hashedPassword)) {
    localStorage.setItem("passwordHash", hashedPassword);
    passwordScreen.style.display = "none";
    mainContent.style.display = "block";
    mainContent.style.animation = "fadeIn 0.8s ease-out";
  } else {
    passwordError.textContent = "Incorrect password";
    passwordInput.value = "";
    passwordInput.parentElement.style.animation = "shake 0.4s ease-in-out";
    setTimeout(() => {
      passwordInput.parentElement.style.animation = "";
    }, 400);
  }
});

passwordInput.addEventListener("input", () => {
  passwordError.textContent = "";
});

passwordInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    submitPassword.click();
  }
});

// UV logic
const form = document.getElementById("uv-form");
const address = document.getElementById("uv-address");
const searchEngine = document.getElementById("uv-search-engine");
const error = document.getElementById("uv-error");
const errorCode = document.getElementById("uv-error-code");
const frame = document.getElementById("uv-frame");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

address.addEventListener("focus", () => {
  address.parentElement.classList.add("focused");
});

address.addEventListener("blur", () => {
  address.parentElement.classList.remove("focused");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await registerSW();
  } catch (err) {
    error.textContent = "Failed to register service worker.";
    errorCode.textContent = err.toString();
    throw err;
  }

  const url = search(address.value, searchEngine.value);
  frame.style.display = "block";
  let wispUrl = (location.protocol === "https:" ? "wss" : "ws") + "://" + location.host + "/wisp/";

  if (await connection.getTransport() !== "/epoxy/index.mjs") {
    await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
  }

  frame.style.opacity = "0";
  frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);

  frame.addEventListener("load", () => {
    frame.style.opacity = "1";
  }, { once: true });
});
