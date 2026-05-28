window.addEventListener('error', function(e) {
  if (e && e.message && (e.message.indexOf('Loading chunk') !== -1 || e.message.indexOf('Loading CSS chunk') !== -1 || e.message.indexOf('Failed to fetch') !== -1)) {
    if (!window.__chunkRetried) {
      window.__chunkRetried = true;
      window.location.reload();
    }
  }
});
