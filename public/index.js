"use strict";


const validPasswords = [
  "a3fd0c59a5e275cd8d5cc5a3a1a56317c7816e55ac1e2e762b3b8b3fca063f4d", // o
  "f10a168f0c49a22458cb437e2ea94e446e8131c6ea225660b7d92406e04c9514"  // e
];


const passwordScreen = document.getElementById("password-screen");
const mainContent = document.getElementById("main-content");
const passwordInput = document.getElementById("password-input");
const submitPassword = document.getElementById("submit-password");
const passwordError = document.getElementById("password-error");

submitPassword.addEventListener("click", (e) => {
  e.preventDefault();
  const password = passwordInput.value;
  const hashedPassword = CryptoJS.SHA256(password).toString();

  if (validPasswords.includes(hashedPassword)) {
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
