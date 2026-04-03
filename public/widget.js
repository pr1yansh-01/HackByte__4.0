(function () {
  // --- CONFIGURATION ---
  // If the host site passes a data-api-url in the script tag, we use it, otherwise fallback to local/prod
  const scriptTag = document.currentScript;
  let apiUrl = scriptTag ? scriptTag.getAttribute('data-api-url') : null;
  
  if (!apiUrl) {
    // Attempt to guess the script's origin or default to localhost for development
    const scriptSrc = scriptTag ? scriptTag.src : '';
    const url = new URL(scriptSrc || 'http://localhost:3000');
    apiUrl = `${url.origin}/api/feedback`;
  }

  // --- STYLES ---
  // Injecting styles dynamically into the host page
  const styles = `
    #hbyte-feedback-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    #hbyte-feedback-button {
      background-color: #3b82f6; /* Tailwind blue-500 */
      color: white;
      border: none;
      border-radius: 9999px;
      padding: 16px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease-in-out;
      font-weight: 500;
      font-size: 16px;
    }

    #hbyte-feedback-button:hover {
      background-color: #2563eb; /* Tailwind blue-600 */
      transform: scale(1.05);
    }

    #hbyte-feedback-modal {
      display: none;
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 384px; /* w-96 */
      background: white;
      border-radius: 8px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #e5e7eb;
      padding: 24px;
      box-sizing: border-box;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
    }

    #hbyte-feedback-modal.hbyte-show {
      display: block;
      opacity: 1;
      transform: translateY(0);
    }

    .hbyte-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .hbyte-modal-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .hbyte-close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s;
    }

    .hbyte-close-btn:hover {
      color: #4b5563;
    }

    .hbyte-form-group {
      margin-bottom: 16px;
      text-align: left;
    }

    .hbyte-label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      margin-bottom: 4px;
    }

    .hbyte-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 14px;
      box-sizing: border-box;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
    }

    .hbyte-input:focus {
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .hbyte-textarea {
      resize: none;
    }

    .hbyte-submit-btn {
      width: 100%;
      background-color: #3b82f6;
      color: white;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
      font-size: 16px;
    }

    .hbyte-submit-btn:hover {
      background-color: #2563eb;
    }

    .hbyte-submit-btn:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
      
    .hbyte-status-msg {
       font-size: 14px;
       margin-top: 12px;
       text-align: center;
       display: none;
    }
    .hbyte-status-msg.success { color: #10b981; display: block; }
    .hbyte-status-msg.error { color: #ef4444; display: block; }

    @media (max-width: 640px) {
      #hbyte-feedback-modal {
        width: calc(100vw - 48px);
        position: fixed;
        bottom: 80px;
        right: 24px;
      }
    }
  `;

  // --- HTML TEMPLATE ---
  const htmlTemplate = `
    <div id="hbyte-feedback-modal">
      <div class="hbyte-modal-header">
        <h3 class="hbyte-modal-title">Submit Feature Request</h3>
        <button class="hbyte-close-btn" id="hbyte-close-btn" aria-label="Close">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>

      <form id="hbyte-feedback-form">
        <div class="hbyte-form-group">
          <label class="hbyte-label">Feature Title</label>
          <input type="text" id="hbyte-title" class="hbyte-input" placeholder="Enter feature title" required>
        </div>

        <div class="hbyte-form-group">
          <label class="hbyte-label">Description</label>
          <textarea id="hbyte-description" class="hbyte-input hbyte-textarea" rows="3" placeholder="Describe the feature you'd like to see..." required></textarea>
        </div>

        <div class="hbyte-form-group">
          <label class="hbyte-label">Enter your Email ID</label>
          <input type="email" id="hbyte-email" class="hbyte-input" placeholder="Please enter your email ID" required>
        </div>

        <button type="submit" id="hbyte-submit-btn" class="hbyte-submit-btn">Submit Request</button>
        <div id="hbyte-status-msg" class="hbyte-status-msg"></div>
      </form>
    </div>

    <button id="hbyte-feedback-button">
      <svg id="hbyte-icon-chat" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      <svg id="hbyte-icon-close" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: none;">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
      <span id="hbyte-button-text">Request Feature</span>
    </button>
  `;

  // --- INITIALIZATION ---
  function initWidget() {
    // 1. Inject Styles
    const styleElement = document.createElement('style');
    styleElement.innerHTML = styles;
    document.head.appendChild(styleElement);

    // 2. Inject HTML
    const container = document.createElement('div');
    container.id = 'hbyte-feedback-container';
    container.innerHTML = htmlTemplate;
    document.body.appendChild(container);

    // 3. Attach Event Listeners
    attachEvents();
  }

  function attachEvents() {
    const button = document.getElementById('hbyte-feedback-button');
    const modal = document.getElementById('hbyte-feedback-modal');
    const closeBtn = document.getElementById('hbyte-close-btn');
    const form = document.getElementById('hbyte-feedback-form');
    
    const iconChat = document.getElementById('hbyte-icon-chat');
    const iconClose = document.getElementById('hbyte-icon-close');
    const buttonText = document.getElementById('hbyte-button-text');
    const statusMsg = document.getElementById('hbyte-status-msg');
    const submitBtn = document.getElementById('hbyte-submit-btn');

    let isOpen = false;

    function toggleModal() {
      isOpen = !isOpen;
      if (isOpen) {
        modal.classList.add('hbyte-show');
        iconChat.style.display = 'none';
        iconClose.style.display = 'block';
        buttonText.style.display = 'none';
        
        // Reset state
        statusMsg.className = 'hbyte-status-msg';
        statusMsg.textContent = '';
      } else {
        modal.classList.remove('hbyte-show');
        setTimeout(() => {
          if (!isOpen) modal.style.display = 'none';
        }, 300); // Wait for transition
        
        iconChat.style.display = 'block';
        iconClose.style.display = 'none';
        buttonText.style.display = 'inline';
      }
      
      if (isOpen) modal.style.display = 'block';
    }

    button.addEventListener('click', toggleModal);
    closeBtn.addEventListener('click', toggleModal);

    // Handle form submission
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('hbyte-title').value;
      const description = document.getElementById('hbyte-description').value;
      const email = document.getElementById('hbyte-email').value;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting...';
      statusMsg.className = 'hbyte-status-msg';
      statusMsg.textContent = '';

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, description, email }),
        });

        if (response.ok) {
          statusMsg.textContent = 'Thank you for your feedback!';
          statusMsg.classList.add('success');
          form.reset();
          
          // Auto close after 2 seconds
          setTimeout(() => {
             toggleModal();
          }, 2000);
        } else {
          statusMsg.textContent = 'Something went wrong. Please try again.';
          statusMsg.classList.add('error');
        }
      } catch (error) {
        console.error('Feedback Widget Error:', error);
        statusMsg.textContent = 'Network error. Please try again.';
        statusMsg.classList.add('error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Request';
      }
    });
  }

  // Run initialization
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }
})();
