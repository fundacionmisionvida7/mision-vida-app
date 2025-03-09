require = require('esm')(module);
const express = require('express');
const fetch = require('node-fetch'); // Para hacer solicitudes HTTP
const app = express();
const PORT = 4000;

// Configuración de la API de PDT
const bibleAPIs = {
  PDT: {
    apiKey: '7b2ef0fa2742b7543e0799041ce7f8e0',
    baseUrl: 'https://api.scripture.api.bible/v1/bibles/48acedcf8595c754-01/verses/random'
  }
};

// Endpoint para obtener el versículo diario (PDT)
app.get('/api/versiculo-pdt', async (req, res) => {
  try {
    const response = await fetch(bibleAPIs.PDT.baseUrl, {
      headers: {
        'api-key': bibleAPIs.PDT.apiKey
      }
    });
    if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
    const data = await response.json();
    const verseText = `${data.data.content} (${data.data.reference})`;
    res.send(verseText); // Envía el versículo al frontend
  } catch (error) {
    console.error('Error al cargar el versículo PDT:', error.message);
    res.status(500).send('No se pudo cargar el versículo. Intenta nuevamente más tarde.');
  }
});

// Inicia el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend en http://localhost:${PORT}`);
});