const express = require("express");
const app = express();
const port = 5000;

// Middlewares pour lire le JSON dans le corps des requêtes (req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Aiguillage vers le fichier de routes
app.use("/api/etudiants", require("./routes/etudiantRoutes"));
app.use("/api/admins", require("./routes/adminRoutes"));

// Lancement du serveur
app.listen(port, () => {
    console.log(`Le serveur de gestion des étudiants tourne sur le port ${port}`);
});