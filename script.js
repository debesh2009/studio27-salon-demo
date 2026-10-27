// STUDIO 27 — demo interactions (plain JavaScript, no dependencies).

/* ---------------------------------------------------------------------------
 * CONFIGURATION — the only line you need to change to go live.
 *
 * DEMO_WHATSAPP_NUMBER is the number THIS DEMO sends requests to. It is an
 * authorised TESTING number and is NOT the salon's public contact number.
 *
 * To publish this site for a real salon:
 *   1. Replace the value below with the salon's own authorised WhatsApp
 *      number, in international format, digits only (no "+", no spaces).
 *      Example for India: "919876543210"
 *   2. Delete the demo notice paragraph in index.html and set IS_DEMO=false.
 *   3. Update README.md.
 * ------------------------------------------------------------------------- */
const DEMO_WHATSAPP_NUMBER = "916297519708";
const IS_DEMO = true;

/* --- Mobile navigation ---------------------------------------------------- */
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");

function setMenuOpen(open) {
  nav.classList.toggle("open", open);
  // aria-expanded must always mirror the real menu state.
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
}

menuToggle.addEventListener("click", () => {
  setMenuOpen(!nav.classList.contains("open"));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav.classList.contains("open")) {
    setMenuOpen(false);
    menuToggle.focus();
  }
});

/* --- Footer year ---------------------------------------------------------- */
document.getElementById("year").textContent = new Date().getFullYear();

/* --- Booking form --------------------------------------------------------- */
const form = document.getElementById("bookingForm");
const nameField = document.getElementById("name");
const serviceField = document.getElementById("service");
const dateField = document.getElementById("date");
const notesField = document.getElementById("notes");
const toastEl = document.getElementById("toast");
const fallbackLink = document.getElementById("whatsappFallback");

/* Preferred date: build "today" from the visitor's own local calendar date
 * (not UTC), so late-evening visitors are not pushed onto tomorrow. */
const localNow = new Date();
const localToday = new Date(localNow.getTime() - localNow.getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);
dateField.min = localToday;

[nameField, serviceField, dateField].forEach((field) => {
  ["input", "change"].forEach((type) => {
    field.addEventListener(type, () => field.removeAttribute("aria-invalid"));
  });
});

function toast(text, duration) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove("show"), duration || 4200);
}

function hideFallback() {
  fallbackLink.hidden = true;
  fallbackLink.setAttribute("href", "#");
}

form.addEventListener("submit", (event) => {
  // Never let the browser submit this form itself: that could put the
  // customer's details into the URL. Everything happens client-side.
  event.preventDefault();

  const data = new FormData(event.currentTarget);
  const name = String(data.get("name") || "").trim();
  const service = String(data.get("service") || "").trim();
  const preferredDate = String(data.get("date") || "").trim();
  const preferredTime = String(data.get("time") || "").trim();
  const notes = String(data.get("notes") || "").trim();

  const problems = [];
  if (!name) problems.push([nameField, "Please add your name."]);
  if (!service) problems.push([serviceField, "Please choose a service."]);
  if (!preferredDate) {
    problems.push([dateField, "Please choose a preferred date."]);
  } else if (preferredDate < localToday) {
    problems.push([dateField, "Please choose today or a later date."]);
  }

  if (problems.length) {
    hideFallback();
    problems.forEach(([field]) => field.setAttribute("aria-invalid", "true"));
    problems[0][0].focus();
    toast(problems[0][1]);
    return;
  }

  const message = [
    "Hi STUDIO 27! I'd like to request an appointment.",
    `Name: ${name}`,
    `Service: ${service}`,
    `Preferred date: ${preferredDate}`,
    preferredTime ? `Preferred time: ${preferredTime}` : "",
    notes ? `Notes: ${notes}` : "",
    "",
    "This is a request only — it is not confirmed until you reply."
  ]
    .filter(Boolean)
    .join("\n");

  const url = `https://wa.me/${DEMO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  // Opens WhatsApp in a new browsing context. Nothing is sent until the
  // customer presses send inside WhatsApp, so there is nothing to confirm yet.
  window.open(url, "_blank", "noopener,noreferrer");

  // window.open() returns null even when the tab opens successfully whenever
  // "noopener" is used, so its return value cannot be trusted to detect a
  // blocked pop-up. Instead we always offer the same link as a manual fallback.
  fallbackLink.href = url;
  fallbackLink.hidden = false;

  toast(
    IS_DEMO
      ? "Demo: WhatsApp should now be open in a new tab, addressed to the testing number, with your request typed out. Press send there — nothing is booked until the studio replies, and this demo stores nothing."
      : "WhatsApp should now be open in a new tab with your request typed out. Press send there — the appointment is not booked until the studio replies.",
    9000
  );
});
