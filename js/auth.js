import { auth, db } from './firebase-config.js';
import { 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  onAuthStateChanged,
  signOut 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

let confirmationResult = null;

export function initRecaptcha() {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'normal',
      callback: () => console.log('reCAPTCHA verified'),
      'expired-callback': () => console.log('reCAPTCHA expired'),
      'error-callback': (error) => {
        console.error('reCAPTCHA error:', error);
        showError('reCAPTCHA failed. Please try again.');
      }
    });
  }
  return window.recaptchaVerifier;
}

export async function sendOTP() {
  try {
    const phoneInput = document.getElementById('phoneInput').value.trim();
    
    if (!phoneInput) {
      showError('Please enter a phone number');
      return;
    }

    let phone = phoneInput;
    if (!phone.startsWith('+')) {
      if (phone.startsWith('0')) phone = phone.slice(1);
      phone = '+880' + phone;
    }

    if (!/^\+88[01]\d{8}$/.test(phone)) {
      showError('Invalid format. Use: 01234567890 or +8801234567890');
      return;
    }

    showSuccess('Sending OTP...');

    const recaptchaVerifier = initRecaptcha();
    if (!recaptchaVerifier) return;

    const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
    confirmationResult = result;

    document.getElementById('phoneSection').style.display = 'none';
    document.getElementById('otpSection').style.display = 'block';
    
    showSuccess('OTP sent to ' + phone);

  } catch (error) {
    console.error('Error:', error);
    if (error.code === 'auth/invalid-phone-number') {
      showError('Invalid phone number');
    } else if (error.code === 'auth/too-many-requests') {
      showError('Too many attempts. Try again later.');
    } else {
      showError('Error: ' + error.message);
    }

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  }
}

export async function verifyOTP() {
  try {
    const otpInput = document.getElementById('otpInput').value.trim();
    
    if (!otpInput || otpInput.length !== 6) {
      showError('Enter 6-digit OTP');
      return;
    }

    if (!confirmationResult) {
      showError('OTP expired. Request new OTP.');
      return;
    }

    const verifyBtn = document.querySelector('[onclick="verifyOTP()"]');
    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Verifying...';

    const result = await confirmationResult.confirm(otpInput);
    const user = result.user;

    showSuccess('Login successful!');
    
    // Redirect after 1 second
    setTimeout(() => {
      window.location.href = 'home.html';
    }, 1000);

  } catch (error) {
    console.error('Error:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      showError('Wrong OTP. Try again.');
    } else if (error.code === 'auth/code-expired') {
      showError('OTP expired. Request new OTP.');
      backToPhone();
    } else {
      showError('Error: ' + error.message);
    }

    const verifyBtn = document.querySelector('[onclick="verifyOTP()"]');
    if (verifyBtn) {
      verifyBtn.disabled = false;
      verifyBtn.textContent = 'Verify OTP';
    }
  }
}

export function backToPhone() {
  document.getElementById('phoneSection').style.display = 'block';
  document.getElementById('otpSection').style.display = 'none';
  document.getElementById('otpInput').value = '';
  confirmationResult = null;
}

export async function logout() {
  try {
    await signOut(auth);
    window.location.href = 'index.html';
  } catch (error) {
    console.error('Error:', error);
    showError('Error logging out');
  }
}

export function checkAuthState() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = 'home.html';
    }
  });
}

function showError(message) {
  const errorDiv = document.getElementById('errorMessage');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => { errorDiv.style.display = 'none'; }, 5000);
  }
}

function showSuccess(message) {
  const successDiv = document.getElementById('successMessage');
  if (successDiv) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => { successDiv.style.display = 'none'; }, 3000);
  }
}
