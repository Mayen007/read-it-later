importScripts('config.js');

const API_BASE_URL = READ_IT_LATER_CONFIG.environment === 'production'
  ? READ_IT_LATER_CONFIG.productionApiBaseUrl
  : READ_IT_LATER_CONFIG.apiBaseUrl;

async function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accessToken', 'refreshToken'], (result) => {
      resolve({
        accessToken: result.accessToken || null,
        refreshToken: result.refreshToken || null
      });
    });
  });
}

async function storeAccessToken(accessToken) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ accessToken }, resolve);
  });
}

async function clearStoredTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['accessToken', 'refreshToken'], resolve);
  });
}

async function refreshAccessToken(refreshToken) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    await storeAccessToken(data.accessToken);
    return data.accessToken;
  } catch (error) {
    // Clear invalid tokens
    await clearStoredTokens();
    throw error;
  }
}

async function makeAuthenticatedRequest(url, options = {}) {
  const tokens = await getStoredToken();

  if (!tokens.accessToken) {
    throw new Error('Authentication required');
  }

  // Add auth header
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${tokens.accessToken}`
  };

  let response = await fetch(url, options);

  // Refresh expired or invalid access tokens, then retry once.
  if (response.status === 401 || response.status === 403) {
    if (!tokens.refreshToken) {
      await clearStoredTokens();
      throw new Error('Authentication required');
    }

    try {
      const newAccessToken = await refreshAccessToken(tokens.refreshToken);

      // Retry original request with new token
      options.headers['Authorization'] = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    } catch (refreshError) {
      throw new Error('Authentication required');
    }
  }

  return response;
}

function isSavableUrl(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch (error) {
    return false;
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveLink') {
    if (!isSavableUrl(message.url)) {
      sendResponse({ success: false, error: 'Only HTTP and HTTPS pages can be saved.' });
      return false;
    }

    const apiUrl = `${API_BASE_URL}/articles`;

    makeAuthenticatedRequest(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: message.url })
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        } else {
          return res.json().then(errorData => Promise.reject(errorData));
        }
      })
      .then(data => sendResponse({ success: true, data }))
      .catch(error => {
        // Handle authentication errors
        if (error.message === 'Authentication required') {
          sendResponse({ success: false, error: 'Authentication required' });
        } else {
          sendResponse({ success: false, data: error });
        }
      });
    return true; // Indicate that sendResponse will be called asynchronously
  }
});
