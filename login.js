/* ==========================================================================
   STUDIO 27 — owner sign-in (DEMONSTRATION ONLY)

   IMPORTANT — read before trusting this file:

   This is NOT authentication. It is a front-end imitation of a sign-in screen
   built so the dashboard demo has an entry point. Everything below runs in the
   visitor's own browser, so:

     • The username and password are written in plain text a few lines down and
       are visible to anyone who opens this file or the browser devtools.
     • Nothing is verified on a server. There is no token and no cookie.
     • The only thing this page "remembers" is a single session flag written to
       sessionStorage after the demo credentials match. That is a convenience
       gate, not protection: the flag can be set by hand in devtools, it is
       cleared when the tab closes, and it stops nothing when JavaScript is off.

   Real owner authentication (server-side, with hashed credentials) is a later
   phase. Do not use this page for real customer data.
   ========================================================================== */
"use strict";

(function () {
  /* --- The demo credentials ------------------------------------------------
     Left deliberately readable — hiding them would only pretend to be security. */
  var DEMO_USERNAME = "admin";
  var DEMO_PASSWORD = "12345678";

  /* The demo session flag shared with admin.js. It records only "this tab has
     signed in" — never a username or password. Both files must agree on it. */
  var SESSION_KEY = "s27AdminDemoSession";

  /* Fixed wording only. Whatever the visitor types is never echoed back, so a
     rejected password can never appear in the page. */
  var MESSAGES = {
    both: "That username and password were not recognised. Use the demo credentials shown below.",
    username: "That username was not recognised. Use the demo credentials shown below.",
    password: "That password was not correct. Use the demo credentials shown below."
  };

  var form = document.getElementById("login-form");
  var usernameInput = document.getElementById("login-username");
  var passwordInput = document.getElementById("login-password");
  var toggle = document.getElementById("toggle-password");
  var errorBox = document.getElementById("login-error");

  if (!form || !usernameInput || !passwordInput || !toggle || !errorBox) {
    return;
  }

  /* --- Errors -------------------------------------------------------------- */
  function showError(message, markUsername, markPassword) {
    errorBox.textContent = message;
    errorBox.hidden = false;

    if (markUsername) {
      usernameInput.setAttribute("aria-invalid", "true");
    } else {
      usernameInput.removeAttribute("aria-invalid");
    }

    if (markPassword) {
      passwordInput.setAttribute("aria-invalid", "true");
    } else {
      passwordInput.removeAttribute("aria-invalid");
    }
  }

  function clearError() {
    errorBox.hidden = true;
    errorBox.textContent = "";
    usernameInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
  }

  /* --- Sign in ------------------------------------------------------------- */
  form.addEventListener("submit", function (event) {
    /* Stop the browser from ever assembling a request. This is what keeps the
       password out of the URL, out of any query string, and out of the browser
       history — the form is never actually submitted anywhere. */
    event.preventDefault();

    var username = usernameInput.value.trim();
    var password = passwordInput.value;

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      clearError();
      /* Mark this tab as signed in so admin.js will boot. Wrapped so an
         environment without sessionStorage still reaches the redirect. */
      try {
        window.sessionStorage.setItem(SESSION_KEY, "active");
      } catch (e) { /* storage unavailable — the demo still navigates */ }
      window.location.assign("admin.html");
      return;
    }

    var wrongUsername = username !== DEMO_USERNAME;
    var wrongPassword = password !== DEMO_PASSWORD;

    showError(
      wrongUsername && wrongPassword
        ? MESSAGES.both
        : wrongUsername
          ? MESSAGES.username
          : MESSAGES.password,
      wrongUsername,
      wrongPassword
    );

    /* Wipe the rejected password rather than leaving it sitting in the field. */
    passwordInput.value = "";
    passwordInput.focus();
  });

  /* Typing again clears the previous rejection, so the error never goes stale. */
  [usernameInput, passwordInput].forEach(function (input) {
    input.addEventListener("input", function () {
      input.removeAttribute("aria-invalid");
      if (!usernameInput.hasAttribute("aria-invalid") &&
          !passwordInput.hasAttribute("aria-invalid")) {
        errorBox.hidden = true;
      }
    });
  });

  /* --- Show / hide password ------------------------------------------------ */
  /* Focus stays on the toggle, so the control can be pressed again with the
     keyboard without tabbing around the form. */
  toggle.addEventListener("click", function () {
    var revealed = passwordInput.type === "text";

    passwordInput.type = revealed ? "password" : "text";
    toggle.textContent = revealed ? "Show" : "Hide";
    toggle.setAttribute("aria-pressed", revealed ? "false" : "true");
    toggle.setAttribute("aria-label", revealed ? "Show password" : "Hide password");
  });
})();
