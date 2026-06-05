const fs = require("fs");
const path = require("path");

// Chemin absolu vers notre fichier JSON de stockage
const filePath = path.join(__dirname, "../data/etudiants.json");

// Fonction utilitaire pour LIRE le fichier JSON
const lireFichierJSON = () => {
    const dataBrute = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(dataBrute); // Transforme le texte JSON en tableau JavaScript
};

// Fonction utilitaire pour ÉCRIRE dans le fichier JSON
const ecrireFichierJSON = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8"); // Transforme le tableau en texte lisible
};

// 1. LIRE TOUS LES ÉTUDIANTS (GET)
module.exports = {
    getAllEtudiants: (req, res) => {
        try {
            const etudiants = lireFichierJSON();
            res.status(200).json(etudiants);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la lecture des données" });
        }
    },

    // 2. CRÉER UN ÉTUDIANT (POST)
    createEtudiant: (req, res) => {
        try {
            const etudiants = lireFichierJSON();
            const { nom, prenom, email, filiere, niveau, matricule } = req.body;

            // Validation simple des champs obligatoires
            if (!nom || !prenom || !email || !matricule) {
                return res.status(400).json({ message: "Veuillez remplir les champs obligatoires (nom, prenom, email, matricule)" });
            }

            // Création du nouvel étudiant avec un ID auto-incrémenté
            const nouvelEtudiant = {
                id: etudiants.length > 0 ? etudiants[etudiants.length - 1].id + 1 : 1,
                nom,
                prenom,
                email,
                filiere,
                niveau,
                matricule
            };

            etudiants.push(nouvelEtudiant); // Ajout dans le tableau temporaire
            ecrireFichierJSON(etudiants);   // Sauvegarde permanente dans le fichier JSON

            res.status(201).json(nouvelEtudiant);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la création de l'étudiant" });
        }
    },

    // 3. MODIFIER UN ÉTUDIANT (PUT)
    updateEtudiant: (req, res) => {
        try {
            const etudiants = lireFichierJSON();
            const idRecherche = parseInt(req.params.id); // On convertit l'ID de l'URL en nombre

            // On cherche l'index de l'étudiant dans le tableau
            const index = etudiants.findIndex(e => e.id === idRecherche);

            if (index === -1) {
                return res.status(404).json({ message: "Étudiant non trouvé" });
            }

            // On fusionne les anciennes données avec les nouvelles reçues dans le req.body
            etudiants[index] = { ...etudiants[index], ...req.body, id: idRecherche };

            ecrireFichierJSON(etudiants); // Sauvegarde dans le fichier

            res.status(200).json(etudiants[index]);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la modification" });
        }
    },

    // 4. SUPPRIMER UN ÉTUDIANT (DELETE)
    deleteEtudiant: (req, res) => {
        try {
            let etudiants = lireFichierJSON();
            const idRecherche = parseInt(req.params.id);

            const etudiantExiste = etudiants.some(e => e.id === idRecherche);
            if (!etudiantExiste) {
                return res.status(404).json({ message: "Étudiant non trouvé" });
            }

            // On filtre le tableau pour exclure l'étudiant à supprimer
            etudiants = etudiants.filter(e => e.id !== idRecherche);

            ecrireFichierJSON(etudiants); // Sauvegarde du nouveau tableau épuré

            res.status(200).json({ message: `L'étudiant avec l'ID ${idRecherche} a été supprimé` });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la suppression" });
        }
    }
};