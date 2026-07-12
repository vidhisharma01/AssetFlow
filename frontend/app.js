const API_BASE = "/api/v1/identity";

let currentUser = null;

// DOM Elements
const authView = document.getElementById("authView");
const dashboardView = document.getElementById("dashboardView");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");

const navUserName = document.getElementById("navUserName");
const navUserAvatar = document.getElementById("navUserAvatar");
const navUserRole = document.getElementById("navUserRole");
const btnLogout = document.getElementById("btnLogout");

const kpiEmployeesCount = document.getElementById("kpiEmployeesCount");
const kpiDeptsCount = document.getElementById("kpiDeptsCount");
const kpiAdminStatus = document.getElementById("kpiAdminStatus");

const deptTableBody = document.getElementById("deptTableBody");
const employeeTableBody = document.getElementById("employeeTableBody");
const btnOpenCreateDept = document.getElementById("btnOpenCreateDept");
const createDeptModal = document.getElementById("createDeptModal");
const createDeptForm = document.getElementById("createDeptForm");
const btnCloseDeptModal = document.getElementById("btnCloseDeptModal");

// Toast utility
function showToast(message, type = "success") {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = `show ${type}`;
  setTimeout(() => {
    toast.className = "";
  }, 3500);
}

// Check session on page load
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("assetflow_token");
  if (token) {
    await fetchUserProfile();
  } else {
    showAuth();
  }
});

// Tab switching
tabLogin.addEventListener("click", () => {
  tabLogin.classList.add("active");
  tabSignup.classList.remove("active");
  loginForm.classList.remove("hidden");
  signupForm.classList.add("hidden");
});

tabSignup.addEventListener("click", () => {
  tabSignup.classList.add("active");
  tabLogin.classList.remove("active");
  signupForm.classList.remove("hidden");
  loginForm.classList.add("hidden");
});

// LOGIN SUBMIT
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Login failed");
    }

    localStorage.setItem("assetflow_token", data.access_token);
    showToast("Successfully logged in!");
    await fetchUserProfile();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// SIGNUP SUBMIT
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    email: document.getElementById("signupEmail").value,
    password: document.getElementById("signupPassword").value,
    first_name: document.getElementById("signupFirstName").value,
    last_name: document.getElementById("signupLastName").value,
    employee_id: document.getElementById("signupEmpId").value,
  };

  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.detail || "Signup failed");
    }

    showToast("Employee Account Created! Please log in.");
    tabLogin.click();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// LOGOUT
btnLogout.addEventListener("click", () => {
  localStorage.removeItem("assetflow_token");
  currentUser = null;
  showAuth();
  showToast("Logged out");
});

// PROFILE FETCH
async function fetchUserProfile() {
  const token = localStorage.getItem("assetflow_token");
  try {
    const response = await fetch(`${API_BASE}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error("Session expired");
    }
    currentUser = await response.json();
    showDashboard();
    await loadDirectoryAndOrg();
  } catch (err) {
    localStorage.removeItem("assetflow_token");
    showAuth();
  }
}

function showAuth() {
  authView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
}

function showDashboard() {
  authView.classList.add("hidden");
  dashboardView.classList.remove("hidden");

  navUserName.textContent = `${currentUser.first_name} ${currentUser.last_name}`;
  navUserAvatar.textContent = currentUser.first_name[0] + currentUser.last_name[0];
  navUserRole.textContent = currentUser.role;

  if (currentUser.role === "admin") {
    navUserRole.classList.add("admin");
    btnOpenCreateDept.classList.remove("hidden");
    kpiAdminStatus.textContent = "Full Access";
  } else {
    navUserRole.classList.remove("admin");
    btnOpenCreateDept.classList.add("hidden");
    kpiAdminStatus.textContent = "Standard Access";
  }
}

// LOAD DATA
async function loadDirectoryAndOrg() {
  const token = localStorage.getItem("assetflow_token");
  try {
    const [usersRes, deptsRes] = await Promise.all([
      fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${API_BASE}/departments`, { headers: { Authorization: `Bearer ${token}` } }),
    ]);

    const users = await usersRes.json();
    const depts = await deptsRes.json();

    kpiEmployeesCount.textContent = users.length || 0;
    kpiDeptsCount.textContent = depts.length || 0;

    renderDepartments(depts);
    renderEmployees(users);
  } catch (err) {
    console.error("Error loading directory", err);
  }
}

function renderDepartments(depts) {
  deptTableBody.innerHTML = depts.map(d => `
    <tr>
      <td><strong>${d.name}</strong></td>
      <td><code>${d.code}</code></td>
      <td>${d.description || "—"}</td>
    </tr>
  `).join("");
}

function renderEmployees(users) {
  const isAdmin = currentUser && currentUser.role === "admin";
  employeeTableBody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${u.employee_id}</strong></td>
      <td>${u.first_name} ${u.last_name}</td>
      <td>${u.email}</td>
      <td>
        ${isAdmin ? `
          <select onchange="promoteEmployee(${u.id}, this.value)" style="padding: 0.3rem 0.6rem; width: auto;">
            <option value="employee" ${u.role === "employee" ? "selected" : ""}>EMPLOYEE</option>
            <option value="dept_head" ${u.role === "dept_head" ? "selected" : ""}>DEPT_HEAD</option>
            <option value="asset_manager" ${u.role === "asset_manager" ? "selected" : ""}>ASSET_MANAGER</option>
            <option value="admin" ${u.role === "admin" ? "selected" : ""}>ADMIN</option>
          </select>
        ` : `<span class="role-tag ${u.role === 'admin' ? 'admin' : ''}">${u.role}</span>`}
      </td>
      <td><span class="status-badge ${u.status}">${u.status}</span></td>
    </tr>
  `).join("");
}

// PROMOTE EMPLOYEE (GLOBAL EXPORT)
window.promoteEmployee = async (userId, newRole) => {
  const token = localStorage.getItem("assetflow_token");
  try {
    const response = await fetch(`${API_BASE}/users/${userId}/promote`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ role: newRole }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Promotion failed");
    }
    showToast("Role updated successfully!");
    await loadDirectoryAndOrg();
  } catch (err) {
    showToast(err.message, "error");
    await loadDirectoryAndOrg();
  }
};

// CREATE DEPARTMENT MODAL
btnOpenCreateDept.addEventListener("click", () => {
  createDeptModal.classList.add("active");
});

btnCloseDeptModal.addEventListener("click", () => {
  createDeptModal.classList.remove("active");
});

createDeptForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("assetflow_token");
  const payload = {
    name: document.getElementById("deptName").value,
    code: document.getElementById("deptCode").value,
    description: document.getElementById("deptDesc").value,
  };

  try {
    const response = await fetch(`${API_BASE}/departments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Department creation failed");
    }

    showToast("Department created successfully!");
    createDeptModal.classList.remove("active");
    createDeptForm.reset();
    await loadDirectoryAndOrg();
  } catch (err) {
    showToast(err.message, "error");
  }
});
