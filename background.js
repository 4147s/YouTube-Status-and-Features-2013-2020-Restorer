/**
 * YouTube Status and Features 2013-2020 Restorer
 * Restores classic YouTube features and status indicators
 * Author: Tom Leaman
 */

(function() {
  'use strict';

  // Configuration for restored features
  const FEATURES_CONFIG = {
    copyrightStatus: {
      enabled: true,
      selector: '[data-copyright-status]'
    },
    communityGuidelinesStatus: {
      enabled: true,
      selector: '[data-community-guidelines]'
    },
    monetization: {
      enabled: true,
      selector: '[data-monetization-status]'
    },
    liveStreaming: {
      enabled: true,
      selector: '[data-live-streaming]'
    },
    embedAdvance: {
      enabled: true,
      selector: '[data-embed-advance]'
    },
    largerIndbox: {
      enabled: true,
      selector: '[data-larger-inbox]'
    },
    unlimitedPrivateVideos: {
      enabled: true,
      selector: '[data-unlimited-videos]'
    },
    customThumbnails: {
      enabled: true,
      selector: '[data-custom-thumbnails]'
    },
    generalAnnotations: {
      enabled: true,
      selector: '[data-general-annotations]'
    },
    superChat: {
      enabled: true,
      selector: '[data-super-chat]'
    },
    customUrl: {
      enabled: true,
      selector: '[data-custom-url]'
    },
    contentIDAppeals: {
      enabled: true,
      selector: '[data-content-id-appeals]'
    },
    channelMemberships: {
      enabled: true,
      selector: '[data-channel-memberships]'
    }
  };

  /**
   * Initialize the extension and inject styles/functionality
   */
  function initializeExtension() {
    injectStylesheet();
    injectFeatureElements();
    observePageChanges();
    setupEventListeners();
  }

  /**
   * Inject custom CSS for restored features
   */
  function injectStylesheet() {
    const style = document.createElement('style');
    style.textContent = `
      /* YouTube Features 2013-2020 Restorer Styles */
      
      .yt-feature-status {
        display: flex;
        gap: 12px;
        margin: 16px 0;
        padding: 16px;
        background: #f9f9f9;
        border-radius: 4px;
        font-family: "Roboto", sans-serif;
      }

      .yt-status-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .yt-status-label {
        font-size: 12px;
        font-weight: 500;
        color: #606060;
        text-transform: uppercase;
      }

      .yt-status-value {
        font-size: 14px;
        font-weight: 500;
        color: #030303;
      }

      .yt-status-enabled {
        color: #065fd4;
        background: #e8f0fe;
        padding: 4px 8px;
        border-radius: 2px;
        font-weight: 500;
      }

      .yt-status-disabled {
        color: #d33b27;
        background: #fce8e6;
        padding: 4px 8px;
        border-radius: 2px;
        font-weight: 500;
      }

      .yt-copyright-strikes {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .yt-strike {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: #f5f5f5;
        border: 1px solid #dadce0;
        border-radius: 2px;
        font-size: 12px;
        font-weight: 500;
        color: #606060;
      }

      .yt-strike.active {
        background: #d33b27;
        color: white;
        border-color: #d33b27;
      }

      .yt-feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin: 16px 0;
        padding: 16px;
        background: #fafafa;
        border-radius: 4px;
      }

      .yt-feature-card {
        background: white;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 12px;
      }

      .yt-feature-title {
        font-size: 13px;
        font-weight: 500;
        color: #030303;
        margin-bottom: 8px;
      }

      .yt-feature-description {
        font-size: 12px;
        color: #606060;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .yt-feature-status-indicator {
        font-size: 12px;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 2px;
        display: inline-block;
      }

      .yt-feature-status-indicator.enabled {
        background: #e6f4ea;
        color: #137333;
      }

      .yt-feature-status-indicator.disabled {
        background: #fce8e6;
        color: #d33b27;
      }

      .yt-feature-status-indicator.eligible {
        background: #fff3e0;
        color: #e65100;
      }

      .yt-feature-status-indicator.ineligible {
        background: #f3e5f5;
        color: #6a1b9a;
      }

      .yt-annotation-toggle {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .yt-toggle-button {
        padding: 6px 12px;
        border: 1px solid #dadce0;
        border-radius: 2px;
        background: white;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: #3c4043;
        transition: all 0.2s;
      }

      .yt-toggle-button:hover {
        background: #f8f9fa;
        border-color: #aeb0b5;
      }

      .yt-toggle-button.active {
        background: #065fd4;
        color: white;
        border-color: #065fd4;
      }

      @media (max-width: 900px) {
        .yt-feature-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Inject feature status elements into the page
   */
  function injectFeatureElements() {
    const channelPageContent = document.querySelector('[data-channel-tagline-container]') || 
                              document.querySelector('[data-page-container]');
    
    if (!channelPageContent) return;

    const statusContainer = document.createElement('div');
    statusContainer.className = 'yt-feature-status';
    statusContainer.innerHTML = generateStatusHTML();

    // Check if we should insert at the beginning or after existing content
    const existingFeatures = document.querySelector('.yt-feature-status');
    if (!existingFeatures) {
      channelPageContent.insertBefore(statusContainer, channelPageContent.firstChild);
    }

    // Add feature grid
    const gridContainer = document.createElement('div');
    gridContainer.className = 'yt-feature-grid';
    gridContainer.innerHTML = generateFeatureGridHTML();
    channelPageContent.appendChild(gridContainer);
  }

  /**
   * Generate HTML for copyright status section
   */
  function generateStatusHTML() {
    const copyrightStrikes = 0; // This would be fetched from actual data
    const communityStrikes = 0;

    return `
      <div class="yt-status-item">
        <span class="yt-status-label">Copyright Status</span>
        <div class="yt-copyright-strikes">
          ${Array(3).fill(0).map((_, i) => `
            <div class="yt-strike ${i < copyrightStrikes ? 'active' : ''}"></div>
          `).join('')}
        </div>
        <span class="yt-status-value">You have ${copyrightStrikes} copyright strikes</span>
      </div>

      <div class="yt-status-item">
        <span class="yt-status-label">Community Guidelines Status</span>
        <div class="yt-copyright-strikes">
          ${Array(3).fill(0).map((_, i) => `
            <div class="yt-strike ${i < communityStrikes ? 'active' : ''}"></div>
          `).join('')}
        </div>
        <span class="yt-status-value">You have ${communityStrikes} community guidelines strikes</span>
      </div>
    `;
  }

  /**
   * Generate HTML for feature grid
   */
  function generateFeatureGridHTML() {
    const features = [
      {
        title: 'Monetization',
        description: 'You can use ads to monetize your channel',
        status: 'Enabled'
      },
      {
        title: 'Live Streaming',
        description: 'You can use live streaming',
        status: 'Enabled'
      },
      {
        title: 'Embed Videos',
        description: 'You can embed live streams',
        status: 'Enabled'
      },
      {
        title: 'Larger Inbox',
        description: 'You can send up to 50 channel messages. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Unlimited Private Videos',
        description: 'Let you have unlimited and private videos. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Custom Thumbnails',
        description: 'Upload a custom thumbnail for a video by including your own file. Learn more',
        status: 'Enabled'
      },
      {
        title: 'General Annotations',
        description: 'You can use to monetize your annotations. Learn more',
        status: 'Disabled'
      },
      {
        title: 'Super Chat',
        description: 'Let your viewers support with Super Chat. Learn more',
        status: 'Eligible'
      },
      {
        title: 'Custom URL',
        description: 'You have already claimed a custom URL. Personalize it. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Content ID Appeals',
        description: 'Let you appeal against Content ID claims. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Channel Memberships',
        description: 'Let your viewers become channel members by paying a monthly fee. Learn more',
        status: 'Ineligible'
      }
    ];

    return features.map(feature => `
      <div class="yt-feature-card">
        <div class="yt-feature-title">${feature.title}</div>
        <div class="yt-feature-description">${feature.description}</div>
        <span class="yt-feature-status-indicator ${feature.status.toLowerCase()}">
          ${feature.status}
        </span>
      </div>
    `).join('');
  }

  /**
   * Observe page changes and reinject elements if needed
   */
  function observePageChanges() {
    const observer = new MutationObserver(() => {
      // Check if elements were removed and reinject if necessary
      if (!document.querySelector('.yt-feature-status')) {
        injectFeatureElements();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Setup event listeners for feature interactions
   */
  function setupEventListeners() {
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('yt-toggle-button')) {
        handleToggleClick(e.target);
      }
    });
  }

  /**
   * Handle toggle button clicks
   */
  function handleToggleClick(button) {
    button.classList.toggle('active');
    // Store preference or notify background script
    chrome.storage.local.set({
      featureState: {
        feature: button.dataset.feature,
        enabled: button.classList.contains('active')
      }
    });
  }

  /**
   * Listen for messages from other parts of the extension
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'refreshStatus') {
      injectFeatureElements();
      sendResponse({ status: 'refreshed' });
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }
})();
/**
 * YouTube Status and Features 2013-2020 Restorer
 * Restores classic YouTube features and status indicators
 * Author: Tom Leaman
 */

(function() {
  'use strict';

  // Configuration for restored features
  const FEATURES_CONFIG = {
    copyrightStatus: {
      enabled: true,
      selector: '[data-copyright-status]'
    },
    communityGuidelinesStatus: {
      enabled: true,
      selector: '[data-community-guidelines]'
    },
    monetization: {
      enabled: true,
      selector: '[data-monetization-status]'
    },
    liveStreaming: {
      enabled: true,
      selector: '[data-live-streaming]'
    },
    embedAdvance: {
      enabled: true,
      selector: '[data-embed-advance]'
    },
    largerIndbox: {
      enabled: true,
      selector: '[data-larger-inbox]'
    },
    unlimitedPrivateVideos: {
      enabled: true,
      selector: '[data-unlimited-videos]'
    },
    customThumbnails: {
      enabled: true,
      selector: '[data-custom-thumbnails]'
    },
    generalAnnotations: {
      enabled: true,
      selector: '[data-general-annotations]'
    },
    superChat: {
      enabled: true,
      selector: '[data-super-chat]'
    },
    customUrl: {
      enabled: true,
      selector: '[data-custom-url]'
    },
    contentIDAppeals: {
      enabled: true,
      selector: '[data-content-id-appeals]'
    },
    channelMemberships: {
      enabled: true,
      selector: '[data-channel-memberships]'
    }
  };

  /**
   * Initialize the extension and inject styles/functionality
   */
  function initializeExtension() {
    injectStylesheet();
    injectFeatureElements();
    observePageChanges();
    setupEventListeners();
  }

  /**
   * Inject custom CSS for restored features
   */
  function injectStylesheet() {
    const style = document.createElement('style');
    style.textContent = `
      /* YouTube Features 2013-2020 Restorer Styles */
      
      .yt-feature-status {
        display: flex;
        gap: 12px;
        margin: 16px 0;
        padding: 16px;
        background: #f9f9f9;
        border-radius: 4px;
        font-family: "Roboto", sans-serif;
      }

      .yt-status-item {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .yt-status-label {
        font-size: 12px;
        font-weight: 500;
        color: #606060;
        text-transform: uppercase;
      }

      .yt-status-value {
        font-size: 14px;
        font-weight: 500;
        color: #030303;
      }

      .yt-status-enabled {
        color: #065fd4;
        background: #e8f0fe;
        padding: 4px 8px;
        border-radius: 2px;
        font-weight: 500;
      }

      .yt-status-disabled {
        color: #d33b27;
        background: #fce8e6;
        padding: 4px 8px;
        border-radius: 2px;
        font-weight: 500;
      }

      .yt-copyright-strikes {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .yt-strike {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: #f5f5f5;
        border: 1px solid #dadce0;
        border-radius: 2px;
        font-size: 12px;
        font-weight: 500;
        color: #606060;
      }

      .yt-strike.active {
        background: #d33b27;
        color: white;
        border-color: #d33b27;
      }

      .yt-feature-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin: 16px 0;
        padding: 16px;
        background: #fafafa;
        border-radius: 4px;
      }

      .yt-feature-card {
        background: white;
        border: 1px solid #dadce0;
        border-radius: 4px;
        padding: 12px;
      }

      .yt-feature-title {
        font-size: 13px;
        font-weight: 500;
        color: #030303;
        margin-bottom: 8px;
      }

      .yt-feature-description {
        font-size: 12px;
        color: #606060;
        line-height: 1.5;
        margin-bottom: 8px;
      }

      .yt-feature-status-indicator {
        font-size: 12px;
        font-weight: 500;
        padding: 4px 8px;
        border-radius: 2px;
        display: inline-block;
      }

      .yt-feature-status-indicator.enabled {
        background: #e6f4ea;
        color: #137333;
      }

      .yt-feature-status-indicator.disabled {
        background: #fce8e6;
        color: #d33b27;
      }

      .yt-feature-status-indicator.eligible {
        background: #fff3e0;
        color: #e65100;
      }

      .yt-feature-status-indicator.ineligible {
        background: #f3e5f5;
        color: #6a1b9a;
      }

      .yt-annotation-toggle {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .yt-toggle-button {
        padding: 6px 12px;
        border: 1px solid #dadce0;
        border-radius: 2px;
        background: white;
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        color: #3c4043;
        transition: all 0.2s;
      }

      .yt-toggle-button:hover {
        background: #f8f9fa;
        border-color: #aeb0b5;
      }

      .yt-toggle-button.active {
        background: #065fd4;
        color: white;
        border-color: #065fd4;
      }

      @media (max-width: 900px) {
        .yt-feature-grid {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Inject feature status elements into the page
   */
  function injectFeatureElements() {
    const channelPageContent = document.querySelector('[data-channel-tagline-container]') || 
                              document.querySelector('[data-page-container]');
    
    if (!channelPageContent) return;

    const statusContainer = document.createElement('div');
    statusContainer.className = 'yt-feature-status';
    statusContainer.innerHTML = generateStatusHTML();

    // Check if we should insert at the beginning or after existing content
    const existingFeatures = document.querySelector('.yt-feature-status');
    if (!existingFeatures) {
      channelPageContent.insertBefore(statusContainer, channelPageContent.firstChild);
    }

    // Add feature grid
    const gridContainer = document.createElement('div');
    gridContainer.className = 'yt-feature-grid';
    gridContainer.innerHTML = generateFeatureGridHTML();
    channelPageContent.appendChild(gridContainer);
  }

  /**
   * Generate HTML for copyright status section
   */
  function generateStatusHTML() {
    const copyrightStrikes = 0; // This would be fetched from actual data
    const communityStrikes = 0;

    return `
      <div class="yt-status-item">
        <span class="yt-status-label">Copyright Status</span>
        <div class="yt-copyright-strikes">
          ${Array(3).fill(0).map((_, i) => `
            <div class="yt-strike ${i < copyrightStrikes ? 'active' : ''}"></div>
          `).join('')}
        </div>
        <span class="yt-status-value">You have ${copyrightStrikes} copyright strikes</span>
      </div>

      <div class="yt-status-item">
        <span class="yt-status-label">Community Guidelines Status</span>
        <div class="yt-copyright-strikes">
          ${Array(3).fill(0).map((_, i) => `
            <div class="yt-strike ${i < communityStrikes ? 'active' : ''}"></div>
          `).join('')}
        </div>
        <span class="yt-status-value">You have ${communityStrikes} community guidelines strikes</span>
      </div>
    `;
  }

  /**
   * Generate HTML for feature grid
   */
  function generateFeatureGridHTML() {
    const features = [
      {
        title: 'Monetization',
        description: 'You can use ads to monetize your channel',
        status: 'Enabled'
      },
      {
        title: 'Live Streaming',
        description: 'You can use live streaming',
        status: 'Enabled'
      },
      {
        title: 'Embed Videos',
        description: 'You can embed live streams',
        status: 'Enabled'
      },
      {
        title: 'Larger Inbox',
        description: 'You can send up to 50 channel messages. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Unlimited Private Videos',
        description: 'Let you have unlimited and private videos. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Custom Thumbnails',
        description: 'Upload a custom thumbnail for a video by including your own file. Learn more',
        status: 'Enabled'
      },
      {
        title: 'General Annotations',
        description: 'You can use to monetize your annotations. Learn more',
        status: 'Disabled'
      },
      {
        title: 'Super Chat',
        description: 'Let your viewers support with Super Chat. Learn more',
        status: 'Eligible'
      },
      {
        title: 'Custom URL',
        description: 'You have already claimed a custom URL. Personalize it. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Content ID Appeals',
        description: 'Let you appeal against Content ID claims. Learn more',
        status: 'Enabled'
      },
      {
        title: 'Channel Memberships',
        description: 'Let your viewers become channel members by paying a monthly fee. Learn more',
        status: 'Ineligible'
      }
    ];

    return features.map(feature => `
      <div class="yt-feature-card">
        <div class="yt-feature-title">${feature.title}</div>
        <div class="yt-feature-description">${feature.description}</div>
        <span class="yt-feature-status-indicator ${feature.status.toLowerCase()}">
          ${feature.status}
        </span>
      </div>
    `).join('');
  }

  /**
   * Observe page changes and reinject elements if needed
   */
  function observePageChanges() {
    const observer = new MutationObserver(() => {
      // Check if elements were removed and reinject if necessary
      if (!document.querySelector('.yt-feature-status')) {
        injectFeatureElements();
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  /**
   * Setup event listeners for feature interactions
   */
  function setupEventListeners() {
    document.addEventListener('click', function(e) {
      if (e.target.classList.contains('yt-toggle-button')) {
        handleToggleClick(e.target);
      }
    });
  }

  /**
   * Handle toggle button clicks
   */
  function handleToggleClick(button) {
    button.classList.toggle('active');
    // Store preference or notify background script
    chrome.storage.local.set({
      featureState: {
        feature: button.dataset.feature,
        enabled: button.classList.contains('active')
      }
    });
  }

  /**
   * Listen for messages from other parts of the extension
   */
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'refreshStatus') {
      injectFeatureElements();
      sendResponse({ status: 'refreshed' });
    }
  });

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
  } else {
    initializeExtension();
  }
})();
 
