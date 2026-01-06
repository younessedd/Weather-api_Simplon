////nave bar///////
 const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('nav');

  toggle.addEventListener('click', () => {
    nav.classList.toggle('show');
  });

  ///////////////////////////////////////////////////



  /////////EMAILJS//////////////

// Check if EmailJS is loaded
function checkEmailJS() {
  if (typeof emailjs === 'undefined') {
    console.error('EmailJS is not loaded!');
    showToast('❌ Email service not available. Please check your connection.', 'error');
    return false;
  }
  console.log('EmailJS is loaded:', emailjs);
  return true;
}

// Toast Notification Function
function showToast(message, type = 'success') {
  console.log('Showing toast:', message, type);
  const toastContainer = document.getElementById('toast-container');
  
  if (!toastContainer) {
    console.error('Toast container not found!');
    return;
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Create toast content
  const icon = type === 'success' ? '✅' : '❌';
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  
  // Add toast to container
  toastContainer.appendChild(toast);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

// تهيئة EmailJS
(function() {
  console.log('Initializing EmailJS...');
  if (checkEmailJS()) {
    emailjs.init("IbbG69TuO-Uyx_4I8"); // استبدل بمفتاحك العام من EmailJS
    console.log('EmailJS initialized successfully');
  } else {
    console.error('Failed to initialize EmailJS');
  }
})();

// انتظر تحميل DOM بالكامل
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, setting up form listener');
  
  // Test toast on load
  setTimeout(() => {
    showToast('🔧 Contact form ready!', 'success');
  }, 1000);
  
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    console.log('Form found, attaching submit listener');
    
    // إرسال النموذج عبر EmailJS
    contactForm.addEventListener("submit", function(e) {
      console.log('Form submitted');
      e.preventDefault();
      e.stopPropagation();

      // Check EmailJS again before sending
      if (!checkEmailJS()) {
        showToast('❌ Email service not available. Please refresh the page.', 'error');
        return;
      }

      // إضافة الوقت الحالي
      const currentTime = new Date().toLocaleString();
      
      // إنشاء بيانات النموذج مع الوقت
      const formData = new FormData(contactForm);
      formData.append('time', currentTime);
      
      // تحويل FormData إلى كائن عادي مع حقول EmailJS الصحيحة
      const templateParams = {
        user_name: formData.get('name') || '',
        user_email: formData.get('email') || '',
        user_phone: formData.get('phone') || '',
        message: formData.get('message') || '',
        time: currentTime
      };
      
      console.log('Form data collected:', templateParams);
      console.log('Raw FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }
      
      // Add WETHER MESSAGE title to the message content
      if (templateParams.message) {
        templateParams.message = "WETHER MESSAGE: " + templateParams.message;
      }

      console.log('Sending email with params:', templateParams);
      console.log('Service ID: service_9a47m0s');
      console.log('Template ID: template_vlo4ub3');

      // Show loading toast
      showToast('📧 Sending message...', 'success');

      emailjs.send("service_9a47m0s", "template_vlo4ub3", templateParams)
        .then(function(response) {
          console.log("SUCCESS!", response.status, response.text);
          
          // Show success toast
          showToast("🎉 Message sent! Redirecting to home page...", 'success');
          
          // Update status message as backup
          const statusElement = document.getElementById("status-message");
          if (statusElement) {
            statusElement.textContent = "✅ Message sent successfully!";
            statusElement.style.color = "#28a745";
          }
          
          // Close modal after success
          setTimeout(() => {
            const modal = document.getElementById('contactModal');
            if (modal) {
              modal.style.display = 'none';
            }
          }, 2000);
          
          // Redirect to home page after 3 seconds
          setTimeout(() => {
            window.location.href = '../home/home.html';
          }, 3000);
          
        }, function(error) {
          console.log("FAILED...", error);
          console.log('Error details:', error.text, error.status);
          
          // Show error toast
          showToast(`❌ Failed to send message: ${error.text || 'Unknown error'}`, 'error');
          
          // Update status message as backup
          const statusElement = document.getElementById("status-message");
          if (statusElement) {
            statusElement.textContent = `❌ Failed to send message: ${error.text || 'Please try again.'}`;
            statusElement.style.color = "#dc3545";
          }
        });

      contactForm.reset();
    });
  } else {
    console.error('Contact form not found!');
  }
})();

// تهيئة EmailJS
(function() {
  emailjs.init("IbbG69TuO-Uyx_4I8"); // استبدل بمفتاحك العام من EmailJS
})();


// تعريف المتغيرات لعناصر المودال والزر
const contactBtn = document.getElementById('contactBtn');
const contactModal = document.getElementById('contactModal');
const closeBtn = document.querySelector('.close');

// فتح المودال عند الضغط على زر الاتصال (إذا موجود)
if(contactBtn){
  contactBtn.addEventListener('click', () => {
    contactModal.style.display = 'flex';
  });
}

// غلق المودال عند الضغط على زر الإغلاق
closeBtn.addEventListener('click', () => {
  contactModal.style.display = 'none';
});

// غلق المودال عند الضغط خارج نافذة المودال
window.addEventListener('click', (event) => {
  if (event.target === contactModal) {
    contactModal.style.display = 'none';
  }
});
