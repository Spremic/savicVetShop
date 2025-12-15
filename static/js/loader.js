/**
 * Premium Page Loader - Optimized
 * Handles page loading state with smooth transitions
 */

(function() {
  'use strict';

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoader);
  } else {
    initLoader();
  }

  function initLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader) return;

    // Check if page is already loaded
    if (document.readyState === 'complete') {
      hideLoader();
      return;
    }

    // Hide loader when page is fully loaded
    window.addEventListener('load', hideLoader);

    // Fallback: hide loader after max time (prevents stuck loader)
    setTimeout(hideLoader, 5000);
  }

  function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (!loader || loader.classList.contains('hidden')) return;

    // Add hidden class for fade out
    loader.classList.add('hidden');

    // Remove from DOM after animation completes
    setTimeout(function() {
      if (loader && loader.parentNode) {
        loader.parentNode.removeChild(loader);
      }
    }, 600);
  }

  // Expose hideLoader for manual control if needed
  window.hidePageLoader = hideLoader;
})();

