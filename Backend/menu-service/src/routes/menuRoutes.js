// routes/menuRoutes.js
const express = require("express");
const router = express.Router();

const menuController = require("../controller/menuController");
const authMiddleware = require("../middleware/authMiddleware");
// const authorizeRoles = require("../middleware/roleMiddleware"); // nếu cần phân quyền thì bật lại

router.use(authMiddleware);

// GET /monan
router.get("/", menuController.getAllMonAn);

// POST /monan
router.post("/", menuController.createMonAn);

// PUT /monan/:id
router.put("/:id", menuController.updateMonAn);

// DELETE /monan/:id
router.delete("/:id", menuController.deleteMonAn);

router.get("/_health", (req, res) => res.send("✅ Menu route OK"));

module.exports = router;
