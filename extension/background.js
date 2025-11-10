chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveLink') {
    const apiUrl = 'https://readit-backend-r69u.onrender.com/api/articles';

    fetch(apiUrl, {
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
      .catch(errorData => {
        // Ensure sendResponse is called even on API errors
        sendResponse({ success: false, data: errorData });
      });
    return true; // Indicate that sendResponse will be called asynchronously
  }
});
