const fetchWrapper = async (...args) => {
  try {
    const response = await fetch(...args);

    // if backend sent a redirect
    if (response.redirected) {
      window.location.href = response.url;
      return;
    }

    // For API routes (JSON responses), always return the response so callers
    // can handle errors gracefully instead of triggering page refreshes.
    const contentType = response.headers.get("content-type") || "";
    const isJsonResponse = contentType.includes("application/json");

    if (response.status == 404) {
      if (!isJsonResponse && contentType.includes("text/html")) {
        const html = await response.text();
        document.open();
        document.write(html);
        document.close();
        return;
      }
      // For JSON 404s, return response so caller can handle the error
      if (isJsonResponse) {
        return response;
      }
      alert("Backend returned Endpoint Not Found.");
      return;
    }

    // For 500+ errors on JSON API routes, return the response so callers
    // can read the error message. Only show refresh dialog for non-API errors.
    if (response.status >= 500) {
      if (isJsonResponse) {
        return response;
      }
      const shouldRefresh = confirm(
        "Backend is not responding. Click OK to refresh.",
      );
      if (shouldRefresh) {
        window.location.reload();
      }
      return;
    }

    return response;
  } catch (error) {
    console.error('[fetchWrapper] Network error:', error);
    // network failures
    const shouldRefresh = confirm(
      "Cannot connect to backend. Click OK to refresh.",
    );

    if (shouldRefresh) {
      window.location.reload();
    }
  }
};

export default fetchWrapper;
