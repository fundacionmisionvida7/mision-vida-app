/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Función para generar una URL de descarga con Content-Disposition
exports.generateDownloadUrl = functions.https.onCall(async (data, context) => {
  const filePath = data.filePath;

  if (!filePath) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "El campo 'filePath' es obligatorio."
    );
  }

  try {
    // Referencia al archivo en Firebase Storage
    const fileRef = admin.storage().bucket().file(filePath);

    // Generar una URL firmada con el encabezado Content-Disposition
    const [url] = await fileRef.getSignedUrl({
      action: "read",
      expires: Date.now() + 15 * 60 * 1000, // URL válida por 15 minutos
      responseDisposition: "attachment", // Fuerza la descarga
    });

    return { downloadUrl: url };
  } catch (error) {
    console.error("Error al generar la URL de descarga:", error);
    throw new functions.https.HttpsError("internal", "No se pudo generar la URL.");
  }
});