// Check which page we're on and initialize accordingly
document.addEventListener("DOMContentLoaded", function () {
  if (window.location.pathname === "/SignIn.html") {
    initializeLoginPage();
  }
  if (window.location.pathname === "/SignUp.html") {
    initializeSignupPage();
  }
  if(window.location.pathname === "/lapor.html"){
    initializeReportPage();
  }
  if(window.location.pathname === "/index.html" || window.location.pathname === "/"){
    initializeHomePage();
  }
  if(window.location.pathname === "/konsulULT.html"){
    initializeCounselingPage("https://awarely-be-flask-app.onrender.com/ultksp_counseling");
  }
  if(window.location.pathname === "/konsulKonselor.html"){
    initializeCounselingPage("https://awarely-be-flask-app.onrender.com/rm_counseling");
  }
  checkLoginStatus();
});

function initializeReportPage() {
  const reportForm = document.getElementById("reportForm");
  if (reportForm) {
    reportForm.addEventListener("submit", function (e) {
      e.preventDefault();
      sendReport();
    });
  }
}

function initializeCounselingPage(url) {
  const counselingForm = document.getElementById("counselingForm");
  if (counselingForm) {
    counselingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      createCounseling(url);
    });
  }
}
function initializeHomePage(){
  document.getElementById("ult").addEventListener("click", function () {
      window.location.href = "konsulULT.html";
    });

    document.getElementById("rekan").addEventListener("click", function () {
      window.location.href = "konsulKonselor.html";
    });

}
// ==================== LOGIN PAGE FUNCTIONALITY ====================
function initializeLoginPage() {
  const signupLink = document.getElementById("signup-link");
  const forgotPasswordLink = document.querySelector(".lupaPassword");
  const loginForm = document.querySelector(".form-container");

  // Signup link click handler
  if (signupLink) {
    signupLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "SignUp.html";
    });
  }

  // Forgot password link click handler
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "forgot-password.html";
    });
  }

  // Login form submission handler
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value.trim();

      // Basic validation
      if (!email) {
        alert("Email tidak boleh kosong");
        return;
      }

      if (!password) {
        alert("Password tidak boleh kosong");
        return;
      }

      if (email && password) {
        // Redirect to dashboard after successful login
        loginUser(email, password);
      }
    });

  }

  // Google login button (if exists)
  const googleLoginBtn = document.querySelector("#login-lain button");
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", function (e) {
      e.preventDefault();
      // For now, redirect to dashboard (replace with actual Google OAuth)
      window.location.href = "dashboard.html";
    });
  }
}
function redirectTo(url) {
  showLoader();
  window.location.href = url;
}


async function checkLoginStatus() {
    try {
    const res = await fetch("https://awarely-be-flask-app.onrender.com/me", {
      method: "GET",
      credentials: "include" // Required for session cookies (Flask-Login)
    });

    if (res.ok) {
      const user = await res.json();
      console.log("Logged in user:", user);
      handleAuthUI(true, user);
    } else if (res.status === 401) {
      if(window.location.pathname === "/lapor.html" || window.location.pathname === "/konsulULT.html" || window.location.pathname === "/konsulKonselor.html"){
        console.warn("User not authenticated, redirecting to login page.");

        redirectTo("/SignIn.html");
      }
      console.log("User not logged in.");
      handleAuthUI(false);
    } else {
      console.warn("Unexpected response:", res.status);
      handleAuthUI(false);
    }
  } catch (err) {
    console.error("Network or server error:", err);
    handleAuthUI(false);
  }
}

function handleAuthUI(isLoggedIn, user = null) {
  if(window.location.pathname === "/index.html" || window.location.pathname === "/"){
    const authSection = document.querySelector(".auth-section");
    const profileSection = document.querySelector(".profile-info");  
    const profileName = profileSection.querySelector(".profile-info-name");
    const profileEmail = profileSection.querySelector(".profile-info-email");
    const userProfile = JSON.parse(localStorage.getItem("userProfile"));
    profileEmail.textContent = isLoggedIn ? userProfile.email : "Not logged in";
    profileName.textContent = isLoggedIn ? userProfile.username: "Guest User";
    const exitButton = document.querySelector(".exit-button");
    if (exitButton) {
      exitButton.addEventListener("click", function () {
        logoutUser();
      });
    }
    
    if (isLoggedIn) {
      exitButton.style.display = "block"; // Show exit button if logged in
      // Hide Sign Up / Sign In buttons
      if (authSection) authSection.style.display = "none";
  
      // Optionally: show a welcome message or logout button
      const profileSection = document.createElement("div");
      profileSection.className = "profile-section";
      profileSection.innerHTML = `
              <button class="profile-button" id="profileButton">
                  <div class="profile-icon" id="profileIcon">U</div>
                  <span id="profileName">Loading...</span>
                  <span class="dropdown-arrow">▼</span>
              </button>
              
              <div class="profile-dropdown" id="profileDropdown">
                  <a href="#profile" class="dropdown-item">
                      <span class="dropdown-icon">👤</span>
                      <span>Profile</span>
                  </a>
                  <a href="#settings" class="dropdown-item">
                      <span class="dropdown-icon">⚙️</span>
                      <span>Settings</span>
                  </a>
                  <a href="#logout" class="dropdown-item logout">
                      <span class="dropdown-icon">🚪</span>
                      <span>Log Out</span>
                  </a>
              </div>
      `;
  
      if (authSection) {
        authSection.replaceWith(profileSection);
      }
      initializeProfileDropdown();
    }
    else{
      exitButton.style.display = "none"; // Hide exit button if not logged in
    }
  }
}
function logoutUser() {
  fetch("https://awarely-be-flask-app.onrender.com/logout", {
    method: "POST",
    credentials: "include"
  })
    .then(res => res.json())
    .then(data => {
      console.log("User logged out successfully."); 
      location.reload();
    })
    .catch(err => {
      console.error("Logout failed:", err);
    });
    handleAuthUI(false); // Update UI to reflect logout
}


async function loginUser(email, password) {
  showLoader();

  try {
    const response = await fetch("https://awarely-be-flask-app.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok) {
      // On success, show loader & redirect
      localStorage.setItem("userProfile", JSON.stringify({"email":email, "username": result.username}));
      console.log("Login successful:", result);
      redirectTo("/index.html");  // or whatever page you want
    } 
    else {
      alert("Login failed: " + (result.error || "Unknown error"));
    }
  } catch (error) {
    alert("Network error");
  }
  finally{
    hideLoader(); // Ensure loader is hidden after operation
  }
}

function showLoader() {
  document.getElementById("loading-overlay").style.display = "flex";
}

function hideLoader() {
  document.getElementById("loading-overlay").style.display = "none";
}
window.addEventListener("load", () => {
  hideLoader();
});


// ==================== SIGNUP PAGE FUNCTIONALITY ====================
async function registerUser(email, username, password) {
  fetch("https://awarely-be-flask-app.onrender.com/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include", // important for Flask-Login sessions
    body: JSON.stringify({ email, username, password })
  })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        alert("Registration successful!");
        redirectTo("/SignIn.html"); // Redirect to login page
        console.log(data);
      } else {
        const error = await response.json();
        alert("Registration failed: " + (error.error || response.statusText));
      }
    })
    .catch((error) => {
      console.error("Network error during registration:", error);
      alert("Network error. Check the console.");
    }).finally(() => {
      hideLoader();
    });
  }
function initializeSignupPage() {
  // Form elements
  const form = document.getElementById("signupForm");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const loginLink = document.getElementById("login-link");

  // Error elements
  const usernameError = document.getElementById("username-error");
  const emailError = document.getElementById("email-error");
  const passwordError = document.getElementById("password-error");
  const confirmPasswordError = document.getElementById(
    "confirm-password-error"
  );

  // Password strength elements
  const passwordStrength = document.getElementById("password-strength");
  const strengthFill = document.getElementById("strength-fill");
  const strengthText = document.getElementById("strength-text");

  // Validation functions
  function validateUsername(username) {
    if (!username || username.length < 3) {
      return "Username harus minimal 3 karakter";
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username hanya boleh berisi huruf, angka, dan underscore";
    }
    return "";
  }

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return "Email tidak boleh kosong";
    }
    if (!emailRegex.test(email)) {
      return "Format email tidak valid";
    }
    return "";
  }

  function validatePassword(password) {
    if (!password) {
      return "Password tidak boleh kosong";
    }
    if (password.length < 8) {
      return "Password harus minimal 8 karakter";
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return "Password harus mengandung huruf besar, kecil, dan angka";
    }
    return "";
  }

  function calculatePasswordStrength(password) {
    let strength = 0;
    const checks = [
      password.length >= 8, // Length check
      /[a-z]/.test(password), // Lowercase
      /[A-Z]/.test(password), // Uppercase
      /\d/.test(password), // Numbers
      /[^a-zA-Z\d]/.test(password), // Special characters
    ];

    checks.forEach((check) => {
      if (check) strength += 20;
    });

    return Math.min(strength, 100);
  }

  function showError(input, errorElement, message) {
    if (input && errorElement) {
      input.classList.add("error");
      errorElement.textContent = message;
      errorElement.style.display = "block";
    }
  }

  function hideError(input, errorElement) {
    if (input && errorElement) {
      input.classList.remove("error");
      errorElement.textContent = "";
      errorElement.style.display = "none";
    }
  }

  // Real-time validation event listeners
  if (usernameInput && usernameError) {
    usernameInput.addEventListener("input", function () {
      const error = validateUsername(this.value.trim());
      if (error) {
        showError(this, usernameError, error);
      } else {
        hideError(this, usernameError);
      }
    });

    usernameInput.addEventListener("blur", function () {
      const error = validateUsername(this.value.trim());
      if (error) {
        showError(this, usernameError, error);
      } else {
        hideError(this, usernameError);
      }
    });
  }

  if (emailInput && emailError) {
    emailInput.addEventListener("input", function () {
      const error = validateEmail(this.value.trim());
      if (error) {
        showError(this, emailError, error);
      } else {
        hideError(this, emailError);
      }
    });

    emailInput.addEventListener("blur", function () {
      const error = validateEmail(this.value.trim());
      if (error) {
        showError(this, emailError, error);
      } else {
        hideError(this, emailError);
      }
    });
  }

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      const password = this.value;

      // Show/hide strength indicator
      if (passwordStrength) {
        if (password.length > 0) {
          passwordStrength.style.display = "block";

          // Calculate strength
          const strength = calculatePasswordStrength(password);

          if (strengthFill) {
            strengthFill.style.width = strength + "%";

            // Remove all strength classes
            strengthFill.classList.remove(
              "strength-weak",
              "strength-medium",
              "strength-strong"
            );

            // Update colors and text based on strength
            if (strengthText) {
              if (strength < 40) {
                strengthFill.classList.add("strength-weak");
                strengthText.textContent = "Password strength: Lemah";
              } else if (strength < 80) {
                strengthFill.classList.add("strength-medium");
                strengthText.textContent = "Password strength: Sedang";
              } else {
                strengthFill.classList.add("strength-strong");
                strengthText.textContent = "Password strength: Kuat";
              }
            }
          }
        } else {
          passwordStrength.style.display = "none";
        }
      }

      // Validate password
      const error = validatePassword(password);
      if (error && passwordError) {
        showError(this, passwordError, error);
      } else if (passwordError) {
        hideError(this, passwordError);
      }

      // Revalidate confirm password if it has value
      if (confirmPasswordInput && confirmPasswordInput.value) {
        validateConfirmPassword();
      }
    });
  }

  function validateConfirmPassword() {
    if (!confirmPasswordInput || !passwordInput) return false;

    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!confirmPassword) {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Konfirmasi password tidak boleh kosong"
      );
      return false;
    }

    if (password !== confirmPassword) {
      showError(
        confirmPasswordInput,
        confirmPasswordError,
        "Password tidak cocok"
      );
      return false;
    } else {
      hideError(confirmPasswordInput, confirmPasswordError);
      return true;
    }
  }

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener("input", validateConfirmPassword);
    confirmPasswordInput.addEventListener("blur", validateConfirmPassword);
  }

  // Form submission handler
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get values and trim whitespace
      const username = usernameInput ? usernameInput.value.trim() : "";
      const email = emailInput ? emailInput.value.trim() : "";
      const password = passwordInput ? passwordInput.value : "";
      const confirmPassword = confirmPasswordInput
        ? confirmPasswordInput.value
        : "";

      // Validate all fields
      const usernameValid = !validateUsername(username);
      const emailValid = !validateEmail(email);
      const passwordValid = !validatePassword(password);
      const confirmPasswordValid = validateConfirmPassword();

      // Show errors for invalid fields
      if (!usernameValid) {
        showError(usernameInput, usernameError, validateUsername(username));
      }
      if (!emailValid) {
        showError(emailInput, emailError, validateEmail(email));
      }
      if (!passwordValid) {
        showError(passwordInput, passwordError, validatePassword(password));
      }

      if (
        usernameValid &&
        emailValid &&
        passwordValid &&
        confirmPasswordValid
      ) {
        registerUser(email,username,password);
      } 
    });
  }

  // Login link handler
  if (loginLink) {
    loginLink.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "SignIn.html";
    });
  }
}

// ==================== UTILITY FUNCTIONS ====================

// Function to handle navigation (can be customized)
function navigateTo(page) {
  // Actual navigation implementation
  switch (page) {
    case "login":
      window.location.href = "SignIn.html";
      break;
    case "signup":
      window.location.href = "signup.html";
      break;
    case "forgot-password":
      window.location.href = "forgot-password.html";
      break;
    case "dashboard":
      window.location.href = "dashboard.html";
      break;
    case "home":
      window.location.href = "index.html";
      break;
    default:
      console.log("Unknown page: " + page);
  }
}

function getCurrentUser(){
  return JSON.parse(localStorage.getItem("userProfile")) || null;
}
// ==================== NAVBAR'S PROFILE FUNCTIONALITY ==================== //
// Elements
function initializeProfileDropdown() {
  const profileName = document.getElementById("profileName");
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");
  
  const userJson = localStorage.getItem('userProfile');  // this is a string

  if (userJson) {
    const userObj = JSON.parse(userJson);   // convert string back to object
    profileName.textContent = userObj.username || "Guest User"; // Set profile name
  } else {
    console.log("No user data in localStorage");
  }
  profileButton.addEventListener("click", function (e) {
    e.stopPropagation();
    profileButton.classList.toggle("active");
    profileDropdown.classList.toggle("show");
  });
  
  // Close dropdown when clicking outside
  document.addEventListener("click", function (e) {
    if (!document.querySelector(".profile-section").contains(e.target)) {
      profileButton.classList.remove("active");
      profileDropdown.classList.remove("show");
    }
  });
  // Handle dropdown item clicks
  document.querySelectorAll(".dropdown-item").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const href = this.getAttribute("href");
  
      if (href === "#logout") {
        localStorage.removeItem("userProfile"); // Clear user data
        handleLogout();
      } else if (href === "#profile") {
        alert("Redirect ke halaman Profile");
      } else if (href === "#settings") {
        alert("Redirect ke halaman Settings");
      }
  
      // Close dropdown
      profileButton.classList.remove("active");
      profileDropdown.classList.remove("show");
    });
  });
}

// Handle logout
function handleLogout() {
  if (confirm("Apakah Anda yakin ingin logout?")) {
    logoutUser();
  }
}




function getInitials(name) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
}

/* ==================== REPORT FUNCTIONALITY ====================*/
async function sendReport() {
    const availability = document.querySelector('input[name="availability"]:checked')?.value;
    const contact = document.getElementById("contact").value;
    const incident = document.getElementById("incident").value;
    const date = document.getElementById("appointmentDate").value;
    const time = document.getElementById("appointmentTime").value;

    const payload = {
      contact: contact,
      incident: incident,
      availability: availability,
      date: date,
      time: time
    };

    showLoader();

    try {
      const response = await fetch("https://awarely-be-flask-app.onrender.com/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        credentials: "include" // Include cookies for session management
      });

      const result = await response.json();

      if (response.ok) {
        alertMessage.style.display = "block";
        alert("Laporan berhasil dikirim!");
        redirectTo("/index.html"); // Redirect to home page after successful report
      } else {
        alert(result.error || "Terjadi kesalahan saat mengirim laporan.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      hideLoader();
    }
  }

async function createCounseling(url){
  const availability= document.querySelector('input[name="availability"]:checked')?.value;
  const contact = document.getElementById("contact").value;
  const incident = document.getElementById("incident").value;
  const counselor = document.getElementById("counselorSelect").value;
  const date = document.getElementById("appointmentDate").value;
  const time = document.getElementById("appointmentTime").value;

  const payload = {
    counselor: counselor,
    contact: contact,
    availability: availability,
    incident: incident,
    date: date,
    time: time
  };

  showLoader();
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      credentials: "include" // Include cookies for session management
    });

    const result = await response.json();

    if (response.ok) {
      alertMessage.style.display = "block";
      alert("Konseling berhasil dibuat!");
      redirectTo("/index.html"); // Redirect to home page after successful counseling creation
    } else {
      alert(result.error || "Terjadi kesalahan saat membuat konseling.");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Terjadi kesalahan jaringan.");
  } finally {
    hideLoader();
  }
}
