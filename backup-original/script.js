// STUDIO 27 demo interactions. Replace this placeholder with the real salon WhatsApp number.
const WHATSAPP_NUMBER = "916297519708"; // India: 91 + 10-digit number, digits only.
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
menuToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}));
document.getElementById("year").textContent = new Date().getFullYear();
const date = document.getElementById("date");
const now = new Date();
date.min = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.getElementById("bookingForm").addEventListener("submit", e => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const name = String(data.get("name") || "").trim();
  const service = String(data.get("service") || "").trim();
  if (!name || !service) return toast("Please enter your name and choose a service.");
  const message = [
    "Hi STUDIO 27! I'd like to request an appointment.",
    `Name: ${name}`, `Service: ${service}`,
    data.get("date") ? `Preferred date: ${data.get("date")}` : "",
    data.get("time") ? `Preferred time: ${data.get("time")}` : "",
    data.get("notes") ? `Notes: ${data.get("notes")}` : "",
    "", "I understand this request is not confirmed until the salon replies."
  ].filter(Boolean).join("\n");
  if (WHATSAPP_NUMBER === "916297519708") {
    toast("Demo mode: replace the placeholder WhatsApp number in script.js before booking.");
    return;
  }
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
});
function toast(text) {
  const el = document.getElementById("toast");
  el.textContent = text; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 4200);
}
