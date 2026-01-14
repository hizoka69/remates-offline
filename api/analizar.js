// api/analizar.js
export default async function handler(req, res) {
  // 1. Configuración CORS (Igual que antes)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) throw new Error("Falta la API Key en Vercel");

    const { prompt } = req.body;
    if (!prompt) throw new Error("El prompt está vacío");

    // 2. CONEXIÓN DIRECTA (Sin librería)
    // Usamos el endpoint REST oficial de Google
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }]
      })
    });

    const data = await response.json();

    // 3. Manejo de Errores de Google
    if (!response.ok) {
      console.error("Error de Google:", data);
      throw new Error(data.error?.message || "Error desconocido de Google API");
    }

    // 4. Extraer el texto
    const text = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
