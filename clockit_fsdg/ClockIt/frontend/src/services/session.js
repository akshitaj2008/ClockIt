// One place that decides what happens when the server says "your login is
// no longer valid" (expired after 7 days, or tampered with).
// Every API helper calls handleAuthFailure(), so the user is always sent
// back to the login page instead of seeing broken, half-empty screens.

export function handleAuthFailure(status) {
  if (status !== 401 && status !== 403) return false;

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
  return true;
}
