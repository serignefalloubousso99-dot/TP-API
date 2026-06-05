const express = require("express");
const router = express.Router();
const { 
    getAllEtudiants, 
    createEtudiant, 
    updateEtudiant, 
    deleteEtudiant 
} = require("../controllers/etudiantController");

// Route pour récupérer tous les étudiants et en ajouter un
router.get("/", getAllEtudiants);
router.post("/", createEtudiant);

// Route pour modifier et supprimer un étudiant via son ID dans l'URL
router.put("/:id", updateEtudiant);
router.delete("/:id", deleteEtudiant);

module.exports = router;