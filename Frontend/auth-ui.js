/* =========================
   auth-ui.js (dùng chung)
   ========================= */

// Chuẩn hoá VaiTro tiếng Việt: "Quản lý" -> "quanly", "Nhân viên" -> "nhanvien", "Bếp/bếp" -> "bep"
function normalizeRole(s) {
  return (s || "")
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // bỏ dấu
    .replace(/\s+/g, "");            // bỏ khoảng trắng
}

function getUser() {
  try { return JSON.parse(localStorage.getItem("user") || "null"); }
  catch { return null; }
}

function getToken() {
  return localStorage.getItem("token");
}

function getRole() {
  return normalizeRole(getUser()?.VaiTro);
}

function showMsg(text) {
  const box = document.getElementById("accessDeniedBox");
  if (box) {
    box.style.display = "block";
    box.innerHTML = `
      <div style="padding:12px;border:1px solid #f5c2c7;background:#f8d7da;color:#842029;border-radius:8px;">
        <strong>Thông báo:</strong> ${text}
      </div>`;
  } else {
    alert(text);
  }
}

// MỨC 1: Bắt buộc đăng nhập
function requireLogin(redirect = "gdlogin.html") {
  if (!getToken() || !getUser()) {
    showMsg("Bạn cần đăng nhập để truy cập trang này.");
    setTimeout(() => (window.location.href = redirect), 800);
    return false;
  }
  return true;
}

// MỨC 2: Bắt buộc đúng vai trò
function requireRoles(allowedRoles, redirect = "gdtrangchu.html") {
  if (!requireLogin()) return false;

  const role = getRole();
  const allowed = (allowedRoles || []).map(normalizeRole);

  if (!allowed.includes(role)) {
    showMsg("Trang này chỉ dành cho: " + (allowedRoles || []).join(", "));
    setTimeout(() => (window.location.href = redirect), 800);
    return false;
  }
  return true;
}

// Helper: chặn riêng vai trò Bếp (dùng cho yêu cầu “không cho bếp vào”)
function blockRoleBep(redirect = "gdtrangchu.html") {
  if (!requireLogin()) return false;

  if (getRole() === "bep") {
    showMsg("Trang này không dành cho vai trò Bếp.");
    setTimeout(() => (window.location.href = redirect), 800);
    return false;
  }
  return true;
}

// Fetch có Bearer token
function authHeaders(extra = {}) {
  return { ...extra, Authorization: `Bearer ${getToken()}` };
}

// Logout chuẩn
function logoutToLogin() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
  window.location.href = "gdlogin.html";
}
