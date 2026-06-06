const express = require("express");
const router = express.Router();
const { 
    getAllAdmins, 
    createAdmin, 
    updateAdmin, 
    deleteAdmin,
    loginAdmin
} = require("../controllers/adminController");

router.get("/", getAllAdmins);
router.post("/", createAdmin);
router.post("/login", loginAdmin);
router.put("/:id", updateAdmin);
router.delete("/:id", deleteAdmin);

module.exports = router;
