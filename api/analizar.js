// api/analizar.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

module.exports = async (req, res) => {
  // 1. Configuración CORS (Para que tu HTML pueda hablar con este archivo)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  // Si es una verificación previa (preflight), respondemos OK y salimos
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Solo se permite POST' });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error("Falta la GEMINI_API_KEY en las variables de entorno");

    const { prompt } = req.body;
    if (!prompt) throw new Error("El prompt está vacío");

    // 2. Conexión con Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Usamos 'gemini-pro' porque es el modelo más compatible con la versión 0.12.0
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("ERROR EN SERVER:", error);
    // Devolvemos el error visible para que sepas qué pasó
    return res.status(500).json({ 
        error: error.message || "Error desconocido", 
        details: error.toString() 
    });
  }
};
