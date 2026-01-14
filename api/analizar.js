import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    
    // --- DIAGNÓSTICO ---
    if (!API_KEY) {
        throw new Error("La API Key es undefined (Vacía)");
    }
    // Imprimimos el inicio de la llave en los logs de Vercel para verificar
    console.log("Intentando conectar con Key que inicia en:", API_KEY.substring(0, 5) + "...");
    
    // Inicializar
    const genAI = new GoogleGenerativeAI(API_KEY);
    // Usamos flash, que es el más rápido
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const { prompt } = req.body;
    if (!prompt) throw new Error("Prompt vacío");

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("ERROR GRAVE:", error);
    // Devolvemos el error al frontend para verlo en la alerta
    return res.status(500).json({ 
        error: error.message,
        details: "Revisa los Logs de Vercel para ver el inicio de la Key."
    });
  }
}
