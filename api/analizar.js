// api/analizar.js
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // 1. Manejo de CORS (Opcional pero recomendado si tienes problemas de origen)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Validar método
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3. Obtener API Key
  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    console.error("API Key no encontrada en variables de entorno");
    return res.status(500).json({ error: 'Configuración del servidor incompleta (Falta API Key)' });
  }

  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'El prompt está vacío' });
    }

    // 4. Invocar a Gemini
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Error detallado en Gemini API:", error);
    return res.status(500).json({ 
        error: 'Error interno al procesar con IA', 
        details: error.message 
    });
  }
}



