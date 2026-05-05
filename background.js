/**
 * YouTube Status and Features 2013-2020 Restorer
 * background.js - Service Worker for Manifest V3
 */

const LEGACY_FEATURES_URL = "https://www.youtube.com/features?disable_polymer=1";

// 1. Action: Click the extension icon to go straight to Status and Features
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: LEGACY_FEATURES_URL });
});

// 2. Intercept: Redirect modern Studio feature links to the legacy endpoint
chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  const url = new URL(details.url);
  
  // Check if user is trying to access modern features/settings
  if (url.hostname === "studio.youtube.com" && url.pathname.includes("/editing/details")) {
    chrome.tabs.update(details.tabId, { url: LEGACY_FEATURES_URL });
  }
}, { url: [{ hostContains: 'youtube.com' }] });

// 3. Optional: Listen for messages from content scripts to handle UI state
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CHECK_RESTORE_STATUS") {
    sendResponse({ status: "restorer_active", version: "2013-2020" });
  }
  return true;
});
