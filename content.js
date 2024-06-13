// Example function to fill form fields with test data
function fillForm() {
    document.querySelectorAll('input, select, textarea').forEach(field => {
      if (field.type === 'text') {
        field.value = 'Test Data';
      } else if (field.type === 'email') {
        field.value = 'test@example.com';
      } else if (field.type === 'number') {
        field.value = '12345';
      }
      // Add more field types as needed
    });
  }
  
  // Example function to validate form fields
  function validateForm() {
    let isValid = true;
    document.querySelectorAll('input, select, textarea').forEach(field => {
      if (field.required && !field.value) {
        isValid = false;
        field.style.border = '2px solid red';
      } else {
        field.style.border = '';
      }
    });
    return isValid;
  }
  
  // Listen for messages from the popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fillForm') {
      fillForm();
      sendResponse({status: 'Form filled'});
    } else if (request.action === 'validateForm') {
      const isValid = validateForm();
      sendResponse({status: isValid ? 'Form is valid' : 'Form is invalid'});
    }
  });
  