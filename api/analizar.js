// api/analizar.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

export default async function handler(req, res) {
  // Solo permitimos peticiones POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Obtenemos la API Key desde las variables de entorno (seguro)
  const API_KEY = process.env.GEMINI_API_KEY;
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Configuración del servidor incompleta (Falta API Key)' });
  }

  try {
    const { prompt } = req.body;
    
    // Configurar Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Generar contenido
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Devolver el texto al frontend
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Error en Gemini API:", error);
    return res.status(500).json({ error: 'Error al procesar la solicitud con IA' });
  }
}