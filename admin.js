/* ==========================================================================
 * STUDIO 27 — owner dashboard (demo interface)
 *
 * IMPORTANT — this file contains NO real customer data and NO backend.
 *   • Every appointment below is invented sample data for showing the layout.
 *   • It is deliberately kept separate from script.js (the public booking
 *     form). Sending a WhatsApp request does NOT create a record here.
 *   • Nothing in the appointment data is persisted: no database, no network
 *     calls. Status changes live in memory only and reset on reload.
 *   • A demo sign-in screen exists (login.js), but it is not real
 *     authentication — its credentials are plain text and its session flag
 *     lives in the browser.
 *
 * A real database and secure owner authentication come in the next phase.
 * ========================================================================== */

/* --- Demo session gate ----------------------------------------------------
 * This dashboard is meant to be entered through the demo sign-in screen:
 * login.js writes a session flag to sessionStorage, and this script refuses to
 * boot without it, sending anyone who opens admin.html directly to login.html.
 *
 * This is a CLIENT-SIDE convenience gate, NOT security. The flag can be set by
 * hand in devtools, this file is public, and nothing is verified on a server. */
const S27_SESSION_KEY = "s27AdminDemoSession";
const s27SignedIn = (function () {
  try { return window.sessionStorage.getItem(S27_SESSION_KEY) === "active"; }
  catch (e) { return false; }
})();

if (!s27SignedIn) {
  /* replace() (not assign) so the dashboard does not stay in the back stack. */
  window.location.replace("login.html");
}

if (s27SignedIn) {

/* The dashboard ships hidden in admin.html so that a visitor without the demo
 * session never sees it — not even for the instant between the page painting
 * and the redirect above taking effect. Reveal it now that the flag has been
 * checked. (With JavaScript off this never runs, so the <noscript> rule in the
 * head keeps the page looking exactly as it did before.) */
const admShell = document.querySelector(".adm-shell");
if (admShell) admShell.hidden = false;

/* --- Sample data ---------------------------------------------------------- */
/* "days" is an offset from today, resolved at load time so the demo always
 * shows a believable mix of past and upcoming appointments. */
const SAMPLE_APPOINTMENTS = [
  { ref: "S27-1031", name: "Aarav Mehta", service: "Cut & styling", days: -24, time: "Morning", status: "Completed" },
  { ref: "S27-1032", name: "Priya Nandi", service: "Colour studio", days: -19, time: "Afternoon", status: "Completed" },
  { ref: "S27-1033", name: "Rohit Ghosh", service: "Care rituals", days: -15, time: "Evening", status: "Completed" },
  { ref: "S27-1034", name: "Sneha Dutta", service: "Event ready", days: -12, time: "Morning", status: "Completed" },
  { ref: "S27-1035", name: "Imran Sheikh", service: "Cut & styling", days: -9, time: "Evening", status: "Cancelled" },
  { ref: "S27-1036", name: "Maya Bose", service: "Colour studio", days: -6, time: "Afternoon", status: "Completed" },
  { ref: "S27-1037", name: "Tanvi Roy", service: "Help me choose", days: -3, time: "Flexible", status: "Pending" },
  { ref: "S27-1038", name: "Debjit Pal", service: "Cut & styling", days: -1, time: "Morning", status: "Pending" },
  { ref: "S27-1039", name: "Ananya Sen", service: "Care rituals", days: 0, time: "Afternoon", status: "Confirmed" },
  { ref: "S27-1040", name: "Kabir Mondal", service: "Event ready", days: 1, time: "Evening", status: "Confirmed" },
  { ref: "S27-1041", name: "Riya Chatterjee", service: "Colour studio", days: 2, time: "Morning", status: "Pending" },
  { ref: "S27-1042", name: "Nikhil Banerjee", service: "Cut & styling", days: 4, time: "Flexible", status: "Confirmed" },
  { ref: "S27-1043", name: "Ishita Sarkar", service: "Help me choose", days: 6, time: "Afternoon", status: "Pending" },
  { ref: "S27-1044", name: "Arjun Das", service: "Care rituals", days: 9, time: "Evening", status: "Confirmed" }
];

const STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];
const CARD_STATUSES = ["Pending", "Confirmed", "Completed", "Cancelled"];
const VIEW_TITLES = { dashboard: "Dashboard", appointments: "Appointments", services: "Services", settings: "Settings" };

/* --- Pure helpers (kept separate so they can be tested on their own) ------- */

/* ISO date (yyyy-mm-dd) for "today plus offset days", in the visitor's own
 * local calendar — never UTC, so the demo never slips a day. */
function dateFromToday(offset) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
  const pad = (value) => String(value).padStart(2, "0");
  return `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
}

function formatDate(iso) {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function buildDataset() {
  return SAMPLE_APPOINTMENTS.map((row) => ({ ...row, date: dateFromToday(row.days) }));
}

function countByStatus(list) {
  const counts = { total: list.length, Pending: 0, Confirmed: 0, Completed: 0, Cancelled: 0 };
  list.forEach((row) => { counts[row.status] += 1; });
  return counts;
}

function filterAppointments(list, criteria) {
  const query = String(criteria.query || "").trim().toLowerCase();
  return list.filter((row) => {
    if (criteria.status && row.status !== criteria.status) return false;
    if (criteria.service && row.service !== criteria.service) return false;
    if (query && `${row.name} ${row.ref}`.toLowerCase().indexOf(query) === -1) return false;
    return true;
  });
}

function byDateAscending(a, b) {
  if (a.date === b.date) return 0;
  return a.date < b.date ? -1 : 1;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* --- Element handles ------------------------------------------------------ */
const byId = (id) => document.getElementById(id);

const appointmentsBody = byId("appointments-body");
const searchField = byId("filter-search");
const statusField = byId("filter-status");
const serviceField = byId("filter-service");
const resultCount = byId("result-count");
const toastEl = byId("toast");
const sidebar = byId("adm-sidebar");
const menuButton = byId("adm-menu-btn");
const backdrop = byId("adm-backdrop");
const navLinks = Array.from(document.querySelectorAll("[data-view]"));

let appointments = buildDataset();

/* --- Toast ---------------------------------------------------------------- */
function toast(text, duration) {
  toastEl.textContent = text;
  toastEl.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => toastEl.classList.remove("show"), duration || 4600);
}

/* --- Sidebar drawer (tablet + mobile) ------------------------------------- */
function setDrawer(open) {
  sidebar.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close dashboard menu" : "Open dashboard menu");
  backdrop.hidden = !open;
}

function closeDrawer() {
  setDrawer(false);
}

menuButton.addEventListener("click", () => setDrawer(!sidebar.classList.contains("open")));
backdrop.addEventListener("click", closeDrawer);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && sidebar.classList.contains("open")) {
    closeDrawer();
    menuButton.focus();
  }
});

/* Leaving the drawer open while resizing up to desktop would leave the
   backdrop covering the page, so close it when the layout changes. */
window.matchMedia("(max-width: 1023px)").addEventListener("change", (event) => {
  if (!event.matches) closeDrawer();
});

/* --- View switching ------------------------------------------------------- */
function showView(name) {
  const active = VIEW_TITLES[name] ? name : "dashboard";

  Object.keys(VIEW_TITLES).forEach((key) => {
    byId(`view-${key}`).hidden = key !== active;
  });

  navLinks.forEach((link) => {
    if (link.dataset.view === active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });

  byId("adm-topbar-view").textContent = VIEW_TITLES[active];
  document.title = `${VIEW_TITLES[active]} (demo) — STUDIO 27`;
  closeDrawer();
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => showView(link.dataset.view));
});

window.addEventListener("hashchange", () => showView(location.hash.slice(1)));

/* --- Rendering ------------------------------------------------------------ */
function renderSummary(counts) {
  byId("stat-total").textContent = counts.total;
  byId("stat-pending").textContent = counts.Pending;
  byId("stat-confirmed").textContent = counts.Confirmed;
  byId("stat-completed").textContent = counts.Completed;
  byId("navCountAppointments").textContent = counts.total;

  const share = (value) => `${(value / (counts.total || 1)) * 100}%`;

  byId("adm-split").innerHTML = CARD_STATUSES
    .filter((status) => counts[status] > 0)
    .map((status) => `<span data-status="${status}" style="width:${share(counts[status])}"></span>`)
    .join("");

  byId("adm-legend").innerHTML = CARD_STATUSES
    .map((status) => `<li data-status="${status}"><span class="adm-dot" aria-hidden="true"></span>${status}<b>${counts[status]}</b></li>`)
    .join("");
}

function renderUpcoming(list) {
  const upcoming = list
    .filter((row) => row.status === "Pending" || row.status === "Confirmed")
    .sort(byDateAscending)
    .slice(0, 5);

  if (!upcoming.length) {
    byId("adm-upcoming").innerHTML = `<li class="adm-list-empty">No pending or confirmed sample requests right now.</li>`;
    return;
  }

  byId("adm-upcoming").innerHTML = upcoming
    .map((row) => `<li><span class="adm-cell-name"><b>${escapeHtml(row.name)}</b><span class="adm-ref">${row.ref} · ${escapeHtml(row.service)}</span></span><span class="adm-list-when">${formatDate(row.date)} · ${escapeHtml(row.time)}</span><span class="adm-status" data-status="${row.status}">${row.status}</span></li>`)
    .join("");
}

function renderTable(list) {
  const rows = list.slice().sort(byDateAscending);

  if (!rows.length) {
    appointmentsBody.innerHTML = `<tr><td class="adm-empty" colspan="7">No sample records match these filters.</td></tr>`;
    return;
  }

  appointmentsBody.innerHTML = rows
    .map((row) => `<tr>
<td data-label="Reference" class="adm-ref-cell">${escapeHtml(row.ref)}</td>
<td data-label="Customer"><span class="adm-cell-name"><b>${escapeHtml(row.name)}</b></span></td>
<td data-label="Service">${escapeHtml(row.service)}</td>
<td data-label="Date" class="adm-date">${formatDate(row.date)}</td>
<td data-label="Time">${escapeHtml(row.time)}</td>
<td data-label="Status"><span class="adm-status" data-status="${row.status}">${row.status}</span></td>
<td data-label="Actions"><select class="adm-status-select" data-ref="${row.ref}" aria-label="Update status for sample record ${row.ref}">${STATUSES.map((status) => `<option${status === row.status ? " selected" : ""}>${status}</option>`).join("")}</select></td>
</tr>`)
    .join("");
}

function currentCriteria() {
  return { query: searchField.value, status: statusField.value, service: serviceField.value };
}

function renderAll() {
  const filtered = filterAppointments(appointments, currentCriteria());

  renderSummary(countByStatus(appointments));
  renderUpcoming(appointments);
  renderTable(filtered);
  resultCount.textContent = `Showing ${filtered.length} of ${appointments.length} sample records`;
}

/* --- Filters -------------------------------------------------------------- */
searchField.addEventListener("input", renderAll);
statusField.addEventListener("change", renderAll);
serviceField.addEventListener("change", renderAll);

byId("filter-clear").addEventListener("click", () => {
  searchField.value = "";
  statusField.value = "";
  serviceField.value = "";
  renderAll();
  searchField.focus();
  toast("Filters cleared.");
});

/* --- Status updates (in memory only) -------------------------------------- */
appointmentsBody.addEventListener("change", (event) => {
  const select = event.target.closest(".adm-status-select");
  if (!select) return;

  const record = appointments.find((row) => row.ref === select.dataset.ref);
  if (!record) return;

  const previous = record.status;
  record.status = select.value;
  renderAll();

  /* Re-focus the same control when it is still on screen, so keyboard users
     are not dropped back at the top of the page after a status change. */
  const refocus = appointmentsBody.querySelector(`.adm-status-select[data-ref="${record.ref}"]`);
  if (refocus) refocus.focus();
  else byId("view-appointments").focus();

  toast(`Sample record ${record.ref} moved from ${previous} to ${record.status}. Demo only — nothing is saved.`);
});

/* --- Services (in-memory demo editing) ------------------------------------ */
/* The four sample services, matching the public site's placeholder prices.
   Edits live in this array only — nothing is written to a database or to
   browser storage — so the original four return on reload. */
let services = [
  { id: 1, name: "Cut & styling", price: 299 },
  { id: 2, name: "Colour studio", price: 999 },
  { id: 3, name: "Care rituals", price: 499 },
  { id: 4, name: "Event ready", price: 799 }
];
let nextServiceId = 5;
let editingServiceId = null;
let pendingDeleteId = null;

const servicesBody = byId("services-body");
const serviceForm = byId("service-form");
const serviceFormTitle = byId("service-form-title");
const serviceNameField = byId("service-name");
const servicePriceField = byId("service-price");

function renderServices() {
  if (!services.length) {
    servicesBody.innerHTML = `<tr><td class="adm-empty" colspan="4">No services right now. Use “Add a service” to create one.</td></tr>`;
    return;
  }

  servicesBody.innerHTML = services
    .map((service) => {
      /* Deleting is a two-step action: the row asks for confirmation first. */
      const actions = pendingDeleteId === service.id
        ? `<span class="adm-row-actions"><button class="button adm-btn-ghost" type="button" data-confirm-delete="${service.id}" aria-label="Confirm deleting ${escapeHtml(service.name)}">Confirm delete</button><button class="button adm-btn-ghost" type="button" data-cancel-delete="${service.id}" aria-label="Cancel deleting ${escapeHtml(service.name)}">Cancel</button></span>`
        : `<span class="adm-row-actions"><button class="button adm-btn-ghost" type="button" data-edit="${service.id}" aria-label="Edit ${escapeHtml(service.name)}">Edit</button><button class="button adm-btn-ghost" type="button" data-delete="${service.id}" aria-label="Delete ${escapeHtml(service.name)}">Delete</button></span>`;

      return `<tr>
<td data-label="Service">${escapeHtml(service.name)}</td>
<td data-label="Demo price">from ₹${service.price}</td>
<td data-label="Availability"><span class="adm-status" data-status="Confirmed">Active</span></td>
<td data-label="Actions">${actions}</td>
</tr>`;
    })
    .join("");
}

function closeServiceForm() {
  serviceForm.hidden = true;
  editingServiceId = null;
  serviceNameField.value = "";
  servicePriceField.value = "";
  serviceNameField.removeAttribute("aria-invalid");
  servicePriceField.removeAttribute("aria-invalid");
}

function openServiceForm(id) {
  const editing = id === undefined ? null : services.find((service) => service.id === id);
  editingServiceId = editing ? editing.id : null;
  serviceFormTitle.textContent = editing ? "Edit service" : "Add a service";
  serviceNameField.value = editing ? editing.name : "";
  servicePriceField.value = editing ? String(editing.price) : "";
  serviceNameField.removeAttribute("aria-invalid");
  servicePriceField.removeAttribute("aria-invalid");
  serviceForm.hidden = false;
  serviceNameField.focus();
}

/* A price must be a whole, non-negative number. Returns null when invalid. */
function parsePrice(raw) {
  const value = String(raw).trim();
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number >= 0 ? number : null;
}

function saveService() {
  const name = serviceNameField.value.trim();
  const price = parsePrice(servicePriceField.value);

  if (name) serviceNameField.removeAttribute("aria-invalid");
  else serviceNameField.setAttribute("aria-invalid", "true");
  if (price === null) servicePriceField.setAttribute("aria-invalid", "true");
  else servicePriceField.removeAttribute("aria-invalid");

  if (!name || price === null) {
    toast("Please enter a service name and a price of 0 or more. Demo only — nothing is saved.", 5200);
    (name ? servicePriceField : serviceNameField).focus();
    return;
  }

  if (editingServiceId !== null) {
    const service = services.find((row) => row.id === editingServiceId);
    service.name = name;
    service.price = price;
    toast(`“${name}” updated to from ₹${price}. Demo only — nothing is saved.`, 5200);
  } else {
    services.push({ id: nextServiceId, name, price });
    nextServiceId += 1;
    toast(`“${name}” added at from ₹${price}. Demo only — nothing is saved.`, 5200);
  }

  closeServiceForm();
  renderServices();
}

function deleteService(id) {
  const service = services.find((row) => row.id === id);
  if (!service) return;
  services = services.filter((row) => row.id !== id);
  pendingDeleteId = null;
  renderServices();
  toast(`“${service.name}” deleted. Demo only — nothing is saved, and the original four return on reload.`, 5200);
}

byId("services-add").addEventListener("click", () => {
  pendingDeleteId = null;
  renderServices();
  openServiceForm();
});
byId("service-save").addEventListener("click", saveService);
byId("service-cancel").addEventListener("click", closeServiceForm);

/* Enter saves the form, Escape closes it without saving. */
serviceForm.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    saveService();
  } else if (event.key === "Escape") {
    closeServiceForm();
    byId("services-add").focus();
  }
});

servicesBody.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.edit) openServiceForm(Number(button.dataset.edit));
  else if (button.dataset.delete) { pendingDeleteId = Number(button.dataset.delete); renderServices(); }
  else if (button.dataset.confirmDelete) deleteService(Number(button.dataset.confirmDelete));
  else if (button.dataset.cancelDelete) { pendingDeleteId = null; renderServices(); }
});

renderServices();

/* --- Demo-only controls --------------------------------------------------- */
byId("settings-reset").addEventListener("click", () => {
  appointments = buildDataset();
  searchField.value = "";
  statusField.value = "";
  serviceField.value = "";
  renderAll();
  toast("Sample data restored to its original demo values.");
});

/* --- Start ---------------------------------------------------------------- */
/* Today's date in the top bar, in the owner's own local calendar. */
const topbarDate = byId("adm-topbar-date");
topbarDate.dateTime = dateFromToday(0);
topbarDate.textContent = new Date().toLocaleDateString("en-IN", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric"
});

showView(location.hash.slice(1) || "dashboard");
renderAll();

/* --- Log out -------------------------------------------------------------- */
/* The Log out control is a plain link to login.html. Clear the demo session
 * flag first, so the dashboard cannot be reopened with the back button. */
const logoutLink = document.querySelector(".adm-logout");
if (logoutLink) {
  logoutLink.addEventListener("click", function () {
    try { window.sessionStorage.removeItem(S27_SESSION_KEY); } catch (e) {}
  });
}

}
