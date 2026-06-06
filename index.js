require("dotenv").config();
const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");
const app = express();
const port = process.env.PORT || 5000;

// Configuration de Swagger
const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Gestion des Étudiants",
            version: "1.0.0",
            description: "Une API REST pour gérer les étudiants et les administrateurs avec authentification JWT",
            contact: {
                name: "Support API",
            },
        },
        servers: [
            {
                url: `http://localhost:${port}`,
                description: "Serveur local",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },
    apis: ["./controllers/*.js"], // Chemin vers les fichiers contenant les annotations Swagger
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

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