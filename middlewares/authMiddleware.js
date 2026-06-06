const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

/**
 * Middleware pour vérifier la validité du JWT Token
 */
const protect = (req, res, next) => {
    let token;

    // Vérifier si le token est présent dans les headers (Authorization: Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extraire le token
            token = req.headers.authorization.split(" ")[1];

            // --- VÉRIFICATION DE LA BLACKLIST ---
            const blacklistPath = path.join(__dirname, "../data/blacklist.json");
            const blacklist = JSON.parse(fs.readFileSync(blacklistPath, "utf-8") || "[]");

            if (blacklist.includes(token)) {
                return res.status(401).json({ message: "Non autorisé, ce token a été révoqué (déconnexion)" });
            }
            // ------------------------------------

            // Vérifier et décoder le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ajouter les infos de l'admin à l'objet requête (pour utilisation ultérieure)
            req.admin = decoded;

            next(); // Passer au contrôleur suivant
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Non autorisé, token invalide" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Non autorisé, aucun token fourni" });
    }
};

module.exports = { protect };
