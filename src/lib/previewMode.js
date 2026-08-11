const PREVIEW_SESSION_KEY = "builtright_local_preview";

export function isDevelopmentPreview(search = window.location.search) {
  if (!import.meta.env.DEV) return false;

  const previewValue = new URLSearchParams(search).get("preview");
  if (previewValue === "0") {
    window.sessionStorage.removeItem(PREVIEW_SESSION_KEY);
    return false;
  }

  if (previewValue === "1") {
    window.sessionStorage.setItem(PREVIEW_SESSION_KEY, "1");
    return true;
  }

  return window.sessionStorage.getItem(PREVIEW_SESSION_KEY) === "1";
}
