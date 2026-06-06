const express = require("express");
const router = express.Router();
const { 
    getAllAdmins, 
    createAdmin, 
    updateAdmin, 
    deleteAdmin,
    loginAdmin,
    logoutAdmin
} = require("../controllers/adminController");
const { protect } = require("../middlewares/authMiddleware");

// Routes publiques
router.post("/login", loginAdmin);
router.post("/logout", logoutAdmin);

// Routes protégées
router.get("/", protect, getAllAdmins);
router.post("/", protect, createAdmin);
router.put("/:id", protect, updateAdmin);
router.delete("/:id", protect, deleteAdmin);

module.exports = router;
