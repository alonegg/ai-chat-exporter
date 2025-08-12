document.addEventListener('DOMContentLoaded', function() {
  const tokenInput = document.getElementById('token');
  const ownerInput = document.getElementById('owner');
  const repoInput = document.getElementById('repo');
  const branchInput = document.getElementById('branch');
  const pathInput = document.getElementById('defaultPath');
  const markdownCheckbox = document.getElementById('defaultMarkdown');
  const htmlCheckbox = document.getElementById('defaultHtml');
  const namingSelect = document.getElementById('fileNaming');
  const autoExportCheckbox = document.getElementById('autoExport');
  const testBtn = document.getElementById('testConnection');
  const saveBtn = document.getElementById('saveSettings');
  const statusDiv = document.getElementById('status');
  
  // Load saved settings
  loadSettings();
  
  // Event listeners
  testBtn.addEventListener('click', testConnection);
  saveBtn.addEventListener('click', saveSettings);
  
  function loadSettings() {
    chrome.storage.sync.get({
      githubToken: '',
      githubOwner: '',
      githubRepo: '',
      githubBranch: 'main',
      defaultPath: 'conversations',
      exportMarkdown: true,
      exportHtml: true,
      fileNaming: 'timestamp',
      autoExport: false
    }, function(items) {
      tokenInput.value = items.githubToken;
      ownerInput.value = items.githubOwner;
      repoInput.value = items.githubRepo;
      branchInput.value = items.githubBranch;
      pathInput.value = items.defaultPath;
      markdownCheckbox.checked = items.exportMarkdown;
      htmlCheckbox.checked = items.exportHtml;
      namingSelect.value = items.fileNaming;
      autoExportCheckbox.checked = items.autoExport;
    });
  }
  
  function saveSettings() {
    const settings = {
      githubToken: tokenInput.value.trim(),
      githubOwner: ownerInput.value.trim(),
      githubRepo: repoInput.value.trim(),
      githubBranch: branchInput.value.trim() || 'main',
      defaultPath: pathInput.value.trim() || 'conversations',
      exportMarkdown: markdownCheckbox.checked,
      exportHtml: htmlCheckbox.checked,
      fileNaming: namingSelect.value,
      autoExport: autoExportCheckbox.checked
    };
    
    // Validation
    if (!settings.githubToken) {
      showStatus('GitHub Personal Access Token is required', 'error');
      return;
    }
    
    if (!settings.githubOwner) {
      showStatus('GitHub Username/Organization is required', 'error');
      return;
    }
    
    if (!settings.githubRepo) {
      showStatus('Repository Name is required', 'error');
      return;
    }
    
    if (!settings.exportMarkdown && !settings.exportHtml) {
      showStatus('At least one export format must be selected', 'error');
      return;
    }
    
    // Save settings
    chrome.storage.sync.set(settings, function() {
      if (chrome.runtime.lastError) {
        showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
      } else {
        showStatus('Settings saved successfully!', 'success');
        
        // Update badge
        chrome.runtime.sendMessage({action: 'updateBadge'});
      }
    });
  }
  
  function testConnection() {
    const token = tokenInput.value.trim();
    const owner = ownerInput.value.trim();
    const repo = repoInput.value.trim();
    
    if (!token || !owner || !repo) {
      showStatus('Please fill in GitHub token, owner, and repository name', 'error');
      return;
    }
    
    showStatus('Testing connection...', 'info');
    testBtn.disabled = true;
    
    // Test GitHub API connection
    fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    .then(response => {
      testBtn.disabled = false;
      
      if (response.ok) {
        return response.json();
      } else if (response.status === 401) {
        throw new Error('Invalid GitHub token');
      } else if (response.status === 404) {
        throw new Error('Repository not found or no access');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    })
    .then(data => {
      showStatus(`✅ Connection successful! Repository: ${data.full_name}`, 'success');
    })
    .catch(error => {
      showStatus(`❌ Connection failed: ${error.message}`, 'error');
    });
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
  
  // Add input validation
  tokenInput.addEventListener('input', function() {
    const token = this.value.trim();
    if (token && !token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
      this.setCustomValidity('GitHub token should start with "ghp_" or "github_pat_"');
    } else {
      this.setCustomValidity('');
    }
  });
  
  ownerInput.addEventListener('input', function() {
    const owner = this.value.trim();
    if (owner && !/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(owner)) {
      this.setCustomValidity('Invalid GitHub username/organization name');
    } else {
      this.setCustomValidity('');
    }
  });
  
  repoInput.addEventListener('input', function() {
    const repo = this.value.trim();
    if (repo && !/^[a-zA-Z0-9._-]+$/.test(repo)) {
      this.setCustomValidity('Invalid repository name');
    } else {
      this.setCustomValidity('');
    }
  });
});