// script.js
// This file powers the uploader UI. It collects user inputs (token,
// privacy level, and selected files) and sends them to the API route
// implemented in route.ts via a POST request. It then displays the
// results or errors to the user.

// Utility function to create a list item element for each upload result
function createStatusItem(message, success = true) {
  const p = document.createElement('p');
  p.textContent = message;
  p.className = success
    ? 'text-green-700 dark:text-green-400'
    : 'text-red-700 dark:text-red-400';
  return p;
}

document.addEventListener('DOMContentLoaded', () => {
  const uploadBtn = document.getElementById('uploadBtn');
  const tokenInput = document.getElementById('token');
  const privacySelect = document.getElementById('privacy');
  const filesInput = document.getElementById('files');
  const statusDiv = document.getElementById('status');

  uploadBtn.addEventListener('click', async () => {
    // Clear previous messages
    statusDiv.innerHTML = '';

    const token = tokenInput.value.trim();
    const privacy = privacySelect.value;
    const files = filesInput.files;

    if (!token) {
      statusDiv.appendChild(
        createStatusItem('Error: Please provide a valid bearer token.', false)
      );
      return;
    }

    if (!files || files.length === 0) {
      statusDiv.appendChild(
        createStatusItem('Error: Please select at least one video file.', false)
      );
      return;
    }

    // Indicate the upload is starting
    const uploadingMsg = document.createElement('p');
    uploadingMsg.textContent = 'Uploading... this may take a moment.';
    uploadingMsg.className = 'text-blue-700 dark:text-blue-300';
    statusDiv.appendChild(uploadingMsg);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });
      formData.append('privacy', privacy);

      // Note: the API URL is relative to the site root. If you place your
      // route.ts in `app/api/upload`, the final URL will be `/api/upload`.
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();
      // Remove the uploading message
      statusDiv.removeChild(uploadingMsg);

      if (!response.ok || !result.ok) {
        const errorMsg = result.error || 'Unknown error occurred';
        statusDiv.appendChild(createStatusItem(`Error: ${errorMsg}`, false));
        return;
      }

      // Display success messages for each uploaded file
      if (Array.isArray(result.results)) {
        result.results.forEach((item) => {
          const videoLink = item.videoId
            ? `https://youtube.com/watch?v=${item.videoId}`
            : null;
          const message = videoLink
            ? `Uploaded "${item.file}" successfully! Video ID: ${item.videoId}`
            : `Uploaded "${item.file}" successfully!`;
          const statusItem = createStatusItem(message, true);
          // Make the video ID clickable if available
          if (videoLink) {
            const anchor = document.createElement('a');
            anchor.href = videoLink;
            anchor.textContent = ' (View on YouTube)';
            anchor.target = '_blank';
            anchor.className = 'underline hover:text-red-600';
            statusItem.appendChild(anchor);
          }
          statusDiv.appendChild(statusItem);
        });
      } else {
        statusDiv.appendChild(
          createStatusItem(
            'Upload completed, but no result details were returned.',
            true
          )
        );
      }
    } catch (err) {
      // Remove the uploading message if still present
      if (statusDiv.contains(uploadingMsg)) {
        statusDiv.removeChild(uploadingMsg);
      }
      statusDiv.appendChild(
        createStatusItem(
          'Error: ' + (err.message || 'Failed to communicate with the server.'),
          false
        )
      );
    }
  });
});
