// middleware/roleMiddleware.js
function normalizeRole(s) {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}

function authorizeRoles(...roles) {
  const allowed = roles.map(normalizeRole);

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.VaiTro);

    if (!req.user || !allowed.includes(userRole)) {
      return res.status(403).json({ message: "Không đủ quyền truy cập" });
    }
    next();
  };
}

module.exports = authorizeRoles;
