// api/analizar.js
const Groq = require("groq-sdk");

module.exports = async (req, res) => {
  // Configuración CORS estándar
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // 1. Obtener la Key de Groq
    const API_KEY = process.env.GROQ_API_KEY; 
    if (!API_KEY) throw new Error("Falta la GROQ_API_KEY en Vercel");

    const { prompt } = req.body;

    // 2. Iniciar Groq
    const groq = new Groq({ apiKey: API_KEY });

    // 3. Pedir el análisis a Llama 3
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192", // Modelo rápido y gratuito
      temperature: 0.5,
    });

    const text = chatCompletion.choices[0]?.message?.content || "";

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("Error Groq:", error);
    return res.status(500).json({ error: error.message });
  }
};
