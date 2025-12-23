const API = '/api';

function checkPassword() {
  const password = document.getElementById("password").value;
  const msg = document.getElementById("password-msg");

  const regex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!$%])[A-Za-z\d@#!$%]{6,}$/;

  if (regex.test(password)) {
    if (msg) {
      msg.textContent = "Strong password ✔";
      msg.className = "valid";
    }
    return true;
  } else {
    if (msg) {
      msg.textContent =
        "Min 6 characters, uppercase, lowercase, number & special characters";
      msg.className = "";
    }
    return false;
  }
}
function togglePassword() {
  const input = document.getElementById("password");

  if (input.type === "password") {
    input.type = "text";
  } else {
    input.type = "password";
  }
}



function register() {
  if (!checkPassword()) {
    alert("Please enter a valid password");
    return;
  }

  fetch(`${API}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
    .then(res => res.json())
    .then(data => {
      alert(data.message);
      if (data.message.toLowerCase().includes('success')) {
        window.location.href = "login.html";
      }
    })
    .catch(() => alert("Server error"));
}



function login() {
  fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById("email").value,
      password: document.getElementById("password").value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.userId) {
        alert(data.message || "Login failed");
        return;
      }

      localStorage.setItem('userId', data.userId);

   
      window.location.assign("otp.html");
    })
    .catch(() => alert("Server error"));
}



function verifyOTP() {
  fetch(`${API}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: localStorage.getItem('userId'),
      otp: document.getElementById("otp").value
    })
  })
    .then(res => res.json())
    .then(data => {
      if (data.message === 'Access granted') {
     
        window.location.href = "dashboard.html";
      } else {
        alert(data.message);
      }
    })
    .catch(() => alert("Server error"));
}


function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}



let otpTime = 300; 
let otpInterval;

function startOtpTimer() {
  const text = document.getElementById("timer-text");
  const bar = document.getElementById("progress-bar");

  if (!text || !bar) return;

  otpInterval = setInterval(() => {
    const min = Math.floor(otpTime / 60);
    const sec = otpTime % 60;

    text.textContent =
      `OTP expires in ${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;

    bar.style.width = `${(otpTime / 300) * 100}%`;

    otpTime--;

    if (otpTime < 0) {
      clearInterval(otpInterval);
      text.textContent = "OTP expired. Please login again.";
      text.style.color = "#ef4444";
      bar.style.width = "0%";
    }
  }, 1000);
}
