const API_BASE_URL = 'https://readit-backend-r69u.onrender.com/api';

// Check authentication status on load
document.addEventListener('DOMContentLoaded', async function () {
  await checkAuthStatus();
  setupEventListeners();
});

async function checkAuthStatus() {
  const token = await getStoredToken();

  if (token) {
    // User is authenticated, show save section
    showSaveSection();
  } else {
    // User is not authenticated, show auth form
    showAuthSection();
  }
}

function showSaveSection() {
  document.getElementById('authSection').classList.remove('active');
  document.getElementById('saveSection').classList.remove('hidden');
  document.getElementById('headerSubtext').textContent = 'Save and organize articles to read later';
}

function showAuthSection() {
  document.getElementById('authSection').classList.add('active');
  document.getElementById('saveSection').classList.add('hidden');
  document.getElementById('headerSubtext').textContent = 'Sign in to save articles';
}

async function getStoredToken() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['accessToken'], (result) => {
      resolve(result.accessToken || null);
    });
  });
}

async function storeTokens(accessToken, refreshToken) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ accessToken, refreshToken }, resolve);
  });
}

async function clearTokens() {
  return new Promise((resolve) => {
    chrome.storage.local.remove(['accessToken', 'refreshToken'], resolve);
  });
}

function setupEventListeners() {
  const saveBtn = document.getElementById('saveBtn');
  const authForm = document.getElementById('authForm');
  const authToggleLink = document.getElementById('authToggleLink');
  const viewSavedLink = document.getElementById('viewSaved');

  // Save button handler
  if (saveBtn) {
    saveBtn.addEventListener('click', handleSaveArticle);
  }

  // Auth form handler
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }

  // Toggle between login and register
  if (authToggleLink) {
    authToggleLink.addEventListener('click', (e) => {
      e.preventDefault();
      toggleAuthMode();
    });
  }

  // View saved articles link
  if (viewSavedLink) {
    viewSavedLink.addEventListener('click', function (e) {
      e.preventDefault();
      chrome.tabs.create({ url: 'https://readitt.netlify.app/' });
      window.close();
    });
  }
}

let isRegisterMode = false;

function toggleAuthMode() {
  isRegisterMode = !isRegisterMode;
  const authBtn = document.getElementById('authBtn');
  const authToggleText = document.getElementById('authToggleText');
  const authToggleLink = document.getElementById('authToggleLink');

  if (isRegisterMode) {
    authBtn.textContent = 'Register';
    authToggleText.textContent = 'Already have an account?';
    authToggleLink.textContent = 'Sign In';
  } else {
    authBtn.textContent = 'Sign In';
    authToggleText.textContent = "Don't have an account?";
    authToggleLink.textContent = 'Register';
  }
}

async function handleAuthSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  const authBtn = document.getElementById('authBtn');
  const authError = document.getElementById('authError');

  // Clear previous errors
  authError.style.display = 'none';
  authBtn.disabled = true;
  authBtn.textContent = isRegisterMode ? 'Registering...' : 'Signing in...';

  try {
    const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Authentication failed');
    }

    // Store tokens
    await storeTokens(data.accessToken, data.refreshToken);

    // Show save section
    showSaveSection();

  } catch (error) {
    authError.textContent = error.message;
    authError.style.display = 'block';
  } finally {
    authBtn.disabled = false;
    authBtn.textContent = isRegisterMode ? 'Register' : 'Sign In';
  }
}

async function handleSaveArticle() {
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Disable button and show loading state
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving...';
  statusDiv.textContent = 'Saving article';
  statusDiv.className = 'status-loading loading-dots';

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;
    const title = tabs[0].title;

    chrome.runtime.sendMessage({
      action: 'saveLink',
      url: url,
      title: title
    }, async function (response) {
      // Re-enable button
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Current Page';

      if (response && response.success) {
        statusDiv.textContent = 'Saved successfully!';
        statusDiv.className = 'status-success';
      } else if (response && response.data && response.data.error === 'This URL has already been saved.') {
        statusDiv.textContent = 'Already saved!';
        statusDiv.className = 'status-success';
      } else if (response && response.error === 'Authentication required') {
        // Token expired or invalid, show auth form
        await clearTokens();
        showAuthSection();
        statusDiv.textContent = 'Session expired. Please sign in again.';
        statusDiv.className = 'status-error';
      } else if (response && response.data && response.data.error) {
        statusDiv.textContent = `Error: ${response.data.error}`;
        statusDiv.className = 'status-error';
      } else {
        statusDiv.textContent = 'Error saving link';
        statusDiv.className = 'status-error';
      }

      // Clear status after 3 seconds
      setTimeout(() => {
        statusDiv.textContent = '';
        statusDiv.className = '';
      }, 3000);
    });
  });
}