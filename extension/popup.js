document.addEventListener('DOMContentLoaded', function () {
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  saveBtn.addEventListener('click', async () => {
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
      }, function (response) {
        // Re-enable button
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Current Page';

        if (response && response.success) {
          statusDiv.textContent = 'Saved successfully!';
          statusDiv.className = 'status-success';
        } else if (response && response.data && response.data.error === 'This URL has already been saved.') {
          statusDiv.textContent = 'Already saved!';
          statusDiv.className = 'status-success';
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
  });

  // Add click handler for "View Saved Articles" link if it exists
  const viewSavedLink = document.getElementById('viewSaved');
  if (viewSavedLink) {
    viewSavedLink.addEventListener('click', function (e) {
      e.preventDefault();
      // Open your React frontend (adjust URL as needed)
      chrome.tabs.create({ url: 'http://localhost:3000' });
      window.close(); // Close the popup
    });
  }
});