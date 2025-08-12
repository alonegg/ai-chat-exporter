document.addEventListener('DOMContentLoaded', function() {
  const extractBtn = document.getElementById('extractBtn');
  const exportBtn = document.getElementById('exportBtn');
  const filenameInput = document.getElementById('filename');
  const pathInput = document.getElementById('path');
  const markdownCheckbox = document.getElementById('markdown');
  const htmlCheckbox = document.getElementById('html');
  const previewDiv = document.getElementById('preview');
  const statusDiv = document.getElementById('status');
  const settingsBtn = document.getElementById('settingsBtn');
  
  let currentConversation = null;
  let currentMarkdown = null;
  
  // Load saved settings
  loadSettings();
  
  // Event listeners
  extractBtn.addEventListener('click', extractConversation);
  exportBtn.addEventListener('click', exportToGitHub);
  settingsBtn.addEventListener('click', openSettings);
  
  function loadSettings() {
    chrome.storage.sync.get({
      defaultPath: 'conversations',
      exportMarkdown: true,
      exportHtml: true,
      fileNaming: 'timestamp'
    }, function(items) {
      pathInput.value = items.defaultPath;
      markdownCheckbox.checked = items.exportMarkdown;
      htmlCheckbox.checked = items.exportHtml;
      
      // Generate default filename based on naming pattern
      if (items.fileNaming === 'timestamp') {
        const now = new Date();
        const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
        filenameInput.value = `conversation-${timestamp}`;
      } else {
        filenameInput.value = 'conversation';
      }
    });
  }
  
  function extractConversation() {
    showStatus('Extracting conversation...', 'info');
    extractBtn.disabled = true;
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'extractChat'}, function(response) {
        extractBtn.disabled = false;
        
        if (chrome.runtime.lastError) {
          showStatus('Error: ' + chrome.runtime.lastError.message, 'error');
          return;
        }
        
        if (response && response.success) {
          currentConversation = response.conversation;
          currentMarkdown = response.markdown;
          
          showStatus(`Successfully extracted ${response.conversation.messages.length} messages`, 'success');
          
          // Show preview
          showPreview(response.markdown);
          
          // Enable export button
          exportBtn.disabled = false;
        } else {
          showStatus('Error: ' + (response ? response.error : 'Unknown error'), 'error');
          previewDiv.innerHTML = '';
        }
      });
    });
  }
  
  function showPreview(markdown) {
    if (!markdown) {
      previewDiv.innerHTML = '<p>No content to preview</p>';
      return;
    }
    
    // Convert markdown to HTML for preview
    const html = convertMarkdownToHtml(markdown);
    previewDiv.innerHTML = html;
  }
  
  function convertMarkdownToHtml(markdown) {
    // Simple markdown to HTML conversion
    let html = markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Links
      .replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Horizontal rules
      .replace(/^---$/gim, '<hr>')
      // Line breaks
      .replace(/\n/g, '<br>');
    
    return html;
  }
  
  function exportToGitHub() {
    if (!currentConversation || !currentMarkdown) {
      showStatus('Please extract a conversation first', 'error');
      return;
    }
    
    const filename = filenameInput.value.trim();
    const path = pathInput.value.trim();
    const exportMarkdown = markdownCheckbox.checked;
    const exportHtml = htmlCheckbox.checked;
    
    if (!filename) {
      showStatus('Please enter a filename', 'error');
      return;
    }
    
    if (!exportMarkdown && !exportHtml) {
      showStatus('Please select at least one export format', 'error');
      return;
    }
    
    showStatus('Exporting to GitHub...', 'info');
    exportBtn.disabled = true;
    
    // Prepare files to export
    const files = [];
    
    if (exportMarkdown) {
      files.push({
        filename: filename + '.md',
        content: currentMarkdown,
        path: path
      });
    }
    
    if (exportHtml) {
      const htmlContent = generateHtmlFile(currentConversation, currentMarkdown);
      files.push({
        filename: filename + '.html',
        content: htmlContent,
        path: path
      });
    }
    
    // Send to background script for GitHub upload
    chrome.runtime.sendMessage({
      action: 'uploadToGitHub',
      files: files
    }, function(response) {
      exportBtn.disabled = false;
      
      if (response && response.success) {
        showStatus('Successfully exported to GitHub!', 'success');
        
        // Show links to uploaded files
        if (response.files && response.files.length > 0) {
          let linksHtml = '<div class="export-links"><h4>Exported Files:</h4>';
          response.files.forEach(file => {
            linksHtml += `<a href="${file.html_url}" target="_blank">${file.name}</a><br>`;
          });
          linksHtml += '</div>';
          
          const linksDiv = document.createElement('div');
          linksDiv.innerHTML = linksHtml;
          statusDiv.appendChild(linksDiv);
        }
      } else {
        showStatus('Export failed: ' + (response ? response.error : 'Unknown error'), 'error');
      }
    });
  }
  
  function generateHtmlFile(conversation, markdown) {
    const htmlContent = convertMarkdownToHtml(markdown);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${conversation.platform} Conversation - ${new Date(conversation.timestamp).toLocaleDateString()}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 10px;
        }
        h2 {
            color: #2196F3;
            margin-top: 30px;
            padding: 10px;
            background: #f8f9fa;
            border-left: 4px solid #2196F3;
        }
        h3 {
            color: #666;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
            border-left: 4px solid #4CAF50;
        }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre code {
            background: none;
            padding: 0;
        }
        hr {
            border: none;
            height: 2px;
            background: linear-gradient(to right, #4CAF50, #2196F3);
            margin: 20px 0;
        }
        a {
            color: #2196F3;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .metadata {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .export-info {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        ${htmlContent}
        <div class="export-info">
            <p>Exported with <strong>AI Chat Exporter</strong> on ${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;
  }
  
  function showStatus(message, type) {
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.innerHTML = '';
      }, 3000);
    }
  }
  
  function openSettings() {
    chrome.runtime.openOptionsPage();
  }
});