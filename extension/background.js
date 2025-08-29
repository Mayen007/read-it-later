chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'saveLink') {
    fetch('http://localhost:5000/api/articles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: message.url })
    })
      .then(res => {
        if (res.ok) {
          return res.json().then(data => sendResponse({ success: true, data }));
        } else {
          return res.json().then(errorData => sendResponse({ success: false, data: errorData }));
        }
      })
      .catch(err => sendResponse({ success: false, data: { error: 'Network error' } }));
    return true; // keep the message channel open for async response
  }
});
