const express = require("express");
const router = express.Router();
const { 
    getAllEtudiants, 
    createEtudiant, 
    updateEtudiant, 
    deleteEtudiant 
} = require("../controllers/etudiantController");
const { protect } = require("../middlewares/authMiddleware");

// Route pour récupérer tous les étudiants (Public)
router.get("/", getAllEtudiants);

// Routes protégées (Nécessitent un token)
router.post("/", protect, createEtudiant);
router.put("/:id", protect, updateEtudiant);
router.delete("/:id", protect, deleteEtudiant);

module.exports = router;