"use strict";

const form = document.getElementById("uv-form");
const address = document.getElementById("uv-address");
const searchEngine = document.getElementById("uv-search-engine");
const error = document.getElementById("uv-error");
const errorCode = document.getElementById("uv-error-code");
const frame = document.getElementById("uv-frame");
const connection = new BareMux.BareMuxConnection("/baremux/worker.js");

// Add input focus animation
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
  
  // Add fade-in animation when loading new page
  frame.style.opacity = "0";
  frame.src = __uv$config.prefix + __uv$config.encodeUrl(url);
  
  // Fade in the frame once it starts loading
  frame.addEventListener("load", () => {
    frame.style.opacity = "1";
  }, { once: true });
});