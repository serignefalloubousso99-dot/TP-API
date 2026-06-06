const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../data/administrateurs.json");

const lireFichierJSON = () => {
    if (!fs.existsSync(filePath)) {
        return [];
    }
    const dataBrute = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(dataBrute || "[]");
};

const ecrireFichierJSON = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
};

module.exports = {
    getAllAdmins: (req, res) => {
        try {
            const admins = lireFichierJSON();
            // On ne renvoie pas les mots de passe pour des raisons de sécurité
            const adminsSansPass = admins.map(({ password, ...reste }) => reste);
            res.status(200).json(adminsSansPass);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la lecture des administrateurs" });
        }
    },

    createAdmin: (req, res) => {
        try {
            const admins = lireFichierJSON();
            const { nom, prenom, tel, email, password } = req.body;

            if (!nom || !prenom || !email || !password) {
                return res.status(400).json({ message: "Champs obligatoires manquants" });
            }

            // Vérification de l'unicité (Email et Tel)
            const existeDeja = admins.find(a => a.email === email || a.tel === tel);
            if (existeDeja) {
                return res.status(400).json({ 
                    message: "Un administrateur avec cet email ou ce numéro de téléphone existe déjà" 
                });
            }

            const nouvelAdmin = {
                id: admins.length > 0 ? admins[admins.length - 1].id + 1 : 1,
                nom,
                prenom,
                tel,
                email,
                password
            };

            admins.push(nouvelAdmin);
            ecrireFichierJSON(admins);

            const { password: _, ...adminSansPass } = nouvelAdmin;
            res.status(201).json(adminSansPass);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la création" });
        }
    },

    updateAdmin: (req, res) => {
        try {
            const admins = lireFichierJSON();
            const idRecherche = parseInt(req.params.id);
            const index = admins.findIndex(a => a.id === idRecherche);

            if (index === -1) {
                return res.status(404).json({ message: "Administrateur non trouvé" });
            }

            const { email, tel } = req.body;

            // Vérification de l'unicité si l'email ou le tel est modifié
            const doublon = admins.find(a => 
                a.id !== idRecherche && (a.email === email || a.tel === tel)
            );

            if (doublon) {
                return res.status(400).json({ 
                    message: "Cet email ou ce numéro de téléphone est déjà utilisé par un autre administrateur" 
                });
            }

            admins[index] = { ...admins[index], ...req.body, id: idRecherche };
            ecrireFichierJSON(admins);

            const { password, ...adminSansPass } = admins[index];
            res.status(200).json(adminSansPass);
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la modification" });
        }
    },

    deleteAdmin: (req, res) => {
        try {
            let admins = lireFichierJSON();
            const idRecherche = parseInt(req.params.id);

            if (!admins.some(a => a.id === idRecherche)) {
                return res.status(404).json({ message: "Administrateur non trouvé" });
            }

            admins = admins.filter(a => a.id !== idRecherche);
            ecrireFichierJSON(admins);

            res.status(200).json({ message: "Administrateur supprimé" });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la suppression" });
        }
    },

    // 5. CONNEXION (LOGIN)
    loginAdmin: (req, res) => {
        try {
            const admins = lireFichierJSON();
            const { email, password } = req.body;

            const admin = admins.find(a => a.email === email && a.password === password);

            if (!admin) {
                return res.status(401).json({ message: "Email ou mot de passe incorrect" });
            }

            const { password: _, ...adminSansPass } = admin;
            res.status(200).json({
                message: "Connexion réussie",
                admin: adminSansPass
            });
        } catch (error) {
            res.status(500).json({ message: "Erreur lors de la connexion" });
        }
    }
};
