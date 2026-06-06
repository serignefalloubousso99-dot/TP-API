
// GESTION DES ADMINISTRATEURS

// Importation des modules nécessaires
const fs = require("fs");  // Manipulation de fichiers
const path = require("path");  // Gestion des chemins
const jwt = require("jsonwebtoken"); // Pour la gestion des tokens

// Fonction pour générer un JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d", // Le token expire dans 30 jours
    });
};

// Chemin complet vers le fichier JSON qui stocke les administrateurs
const filePath = path.join(__dirname, "../data/administrateurs.json");


// FONCTIONS UTILITAIRES

// LIRE le fichier JSON des administrateurs
const lireFichierJSON = () => {
    // Vérifier si le fichier existe (au cas où il n'existerait pas)
    if (!fs.existsSync(filePath)) {
        return [];  // Retourner un tableau vide s'il n'existe pas
    }
    // Lire le fichier en tant que texte (UTF-8)
    const dataBrute = fs.readFileSync(filePath, "utf-8");
    // Convertir le texte JSON en objet JavaScript
    return JSON.parse(dataBrute || "[]");
};

// ÉCRIRE dans le fichier JSON des administrateurs
const ecrireFichierJSON = (data) => {
    // Convertir l'objet JavaScript en texte JSON lisible (avec indentation)
    // Le "null, 2" signifie : indentation de 2 espaces pour la lisibilité
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
    // ========================================
    // 1️RÉCUPÉRER TOUS LES ADMINISTRATEURS (GET)
    // Endpoint: GET http://localhost:5000/api/admins
    getAllAdmins: (req, res) => {
        try {
            // Lire tous les administrateurs depuis le fichier JSON
            const admins = lireFichierJSON();
            
            // Supprimer les mots de passe avant de les renvoyer au client
            const adminsSansPass = admins.map(({ password, ...reste }) => reste);
            
            res.status(200).json(adminsSansPass);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la lecture des administrateurs" });
        }
    },

    // ========================================
    // CRÉER UN NOUVEL ADMINISTRATEUR (POST)
    // Endpoint: POST http://localhost:5000/api/admins

    createAdmin: (req, res) => {
        try {
            // Lire les administrateurs existants
            const admins = lireFichierJSON();
            
            // Extraire les données du corps de la requête (req.body)
            const { nom, prenom, tel, email, password } = req.body;

            // VALIDATION: Vérifier que tous les champs obligatoires sont présents
            if (!nom || !prenom || !email || !password) {
                // Retourner le code 400 (requête invalide)
                return res.status(400).json({ message: "Champs obligatoires manquants" });
            }
            // VÉRIFICATION D'UNICITÉ:
            const existeDeja = admins.find(a => a.email === email || a.tel === tel);
            if (existeDeja) {
                return res.status(400).json({ 
                    message: "Un administrateur avec cet email ou ce numéro de téléphone existe déjà" 
                });
            }

            // CRÉATION: Créer le nouvel administrateur
            const nouvelAdmin = {
                // Auto-incrémenter l'ID: prendre le dernier ID + 1, ou 1 si aucun admin
                id: admins.length > 0 ? admins[admins.length - 1].id + 1 : 1,
                nom,
                prenom,
                tel,
                email,
                password
            };

            // Ajouter le nouvel admin à la liste
            admins.push(nouvelAdmin);
            // Sauvegarder la liste mise à jour dans le fichier JSON
            ecrireFichierJSON(admins);

            // Ne pas renvoyer le mot de passe au client
            const { password: _, ...adminSansPass } = nouvelAdmin;
            res.status(201).json(adminSansPass);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la création" });
        }
    },

    // ========================================
    //MODIFIER UN ADMINISTRATEUR (PUT)
    // Endpoint: PUT http://localhost:5000/api/admins/:id
    updateAdmin: (req, res) => {
        try {
            // Lire tous les administrateurs
            const admins = lireFichierJSON();
            
            // Récupérer l'ID depuis l'URL et le convertir en nombre
            const idRecherche = parseInt(req.params.id);
            
            // Trouver l'index (position) de l'admin à modifier dans le tableau
            const index = admins.findIndex(a => a.id === idRecherche);

            // Vérifier que l'admin existe
            if (index === -1) {
                return res.status(404).json({ message: "Administrateur non trouvé" });
            }

            // Extraire l'email et le tel du corps de la requête 
            const { email, tel } = req.body;

            // VÉRIFICATION D'UNICITÉ
            const doublon = admins.find(a => 
                a.id !== idRecherche &&  // Vérifier que ce n'est pas le même admin
                (a.email === email || a.tel === tel)  // Et que email/tel n'existe pas ailleurs
            );

            if (doublon) {
                return res.status(400).json({ 
                    message: "Cet email ou ce numéro de téléphone est déjà utilisé par un autre administrateur" 
                });
            }

            // MISE À JOUR: Fusionner les anciennes données avec les nouvelles
            // On garde l'ID (immuable) et on met à jour le reste avec req.body
            admins[index] = { ...admins[index], ...req.body, id: idRecherche };
            
            // Sauvegarder les changements dans le fichier
            ecrireFichierJSON(admins);

            const { password, ...adminSansPass } = admins[index];
            // Code 200 = succès
            res.status(200).json(adminSansPass);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la modification" });
        }
    },

    // ========================================
    //SUPPRIMER UN ADMINISTRATEUR (DELETE)
    // Endpoint: DELETE http://localhost:5000/api/admins/:id
    deleteAdmin: (req, res) => {
        try {
            // Lire tous les administrateurs
            let admins = lireFichierJSON();
            
            // Récupérer l'ID depuis l'URL et le convertir en nombre
            const idRecherche = parseInt(req.params.id);

            // .some() retourne true si au moins un élément correspond à la condition
            if (!admins.some(a => a.id === idRecherche)) {
                return res.status(404).json({ message: "Administrateur non trouvé" });
            }

            // SUPPRESSION: Créer un nouveau tableau sans l'admin à supprimer
            // .filter() garde seulement les admins dont l'ID ne correspond pas
            admins = admins.filter(a => a.id !== idRecherche);
            
            // Sauvegarder la liste mise à jour (sans l'admin supprimé)
            ecrireFichierJSON(admins);

            res.status(200).json({ message: "Administrateur supprimé" });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la suppression" });
        }
    },
    // ========================================
    //CONNEXION ADMINISTRATEUR (LOGIN) SPÉCIFIQUE AUX ADMINS
    // Endpoint: POST http://localhost:5000/api/admins/login
    // Body JSON attendu: { email, password }
    loginAdmin: (req, res) => {
        try {
            // Lire tous les administrateurs
            const admins = lireFichierJSON();
            
            // Extraire l'email et le mot de passe du corps de la requête
            const { email, password } = req.body;

            // AUTHENTIFICATION: Trouver un admin avec cet email ET ce mot de passe
            const admin = admins.find(a => a.email === email && a.password === password);

            // Vérifier que l'admin a été trouvé
            if (!admin) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            const { password: _, ...adminSansPass } = admin;
            
            res.status(200).json({
                message: "Connexion réussie",
                admin: adminSansPass,
                token: generateToken(admin.id)
            });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la connexion" });
        }
    },

    // ========================================
    // DÉCONNEXION (Côté serveur avec Blacklist)
    // Endpoint: POST http://localhost:5000/api/admins/logout
    logoutAdmin: (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                return res.status(400).json({ message: "Aucun token fourni pour la déconnexion" });
            }

            const token = authHeader.split(" ")[1];
            const blacklistPath = path.join(__dirname, "../data/blacklist.json");

            // Lire la blacklist actuelle
            const blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf-8") || "[]");

            // Ajouter le token s'il n'y est pas déjà
            if (!blacklist.includes(token)) {
                blacklist.push(token);
                fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2), "utf-8");
            }

            res.status(200).json({ message: "Déconnexion réussie. Le token a été révoqué." });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la déconnexion" });
        }
    }
};
