// api/analizar.js
export default async function handler(req, res) {
  // 1. Configuración CORS
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

    // 2. CAMBIO CLAVE: Usamos 'gemini-pro' (Estándar) en lugar de 'flash'
    // Esto asegura compatibilidad total.
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`;

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
      console.error("Error de Google:", JSON.stringify(data, null, 2));
      
      // Si falla incluso con gemini-pro, el problema es 100% la API Key
      throw new Error(data.error?.message || "Error al conectar con Google");
    }

    // 4. Extraer el texto
    // (A veces gemini-pro devuelve estructura ligeramente distinta si hay bloqueo de seguridad, pero esto debería funcionar)
    if (!data.candidates || data.candidates.length === 0) {
        throw new Error("Google no devolvió texto (Posible bloqueo de seguridad)");
    }

    const text = data.candidates[0].content.parts[0].text;
    
    return res.status(200).json({ result: text });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: error.message });
  }
}
