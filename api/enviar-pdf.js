// api/enviar-pdf.js
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
    // 1. Configurar CORS (Igual que en tu analizar.js)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    try {
        const { pdfBase64, nombreArchivo, destinatario } = req.body;

        if (!pdfBase64) throw new Error("No se recibió el PDF");

        // 2. Configurar el transporte (Aquí usaremos variables de entorno por seguridad)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER, // Tu correo Gmail
                pass: process.env.EMAIL_PASS  // Tu contraseña de aplicación (App Password)
            }
        });

        // 3. Configurar el correo
        const mailOptions = {
            from: `"Gestor Remates" <${process.env.EMAIL_USER}>`,
            to: destinatario || process.env.EMAIL_DESTINO_DEFAULT, // Correo preseleccionado
            subject: `📄 Ficha de Remate: ${nombreArchivo}`,
            text: `Adjunto encontrarás la ficha de evaluación para la oportunidad: ${nombreArchivo}.`,
            attachments: [
                {
                    filename: `${nombreArchivo}.pdf`,
                    content: pdfBase64.split("base64,")[1], // Limpiar el encabezado data:uri
                    encoding: 'base64'
                }
            ]
        };

        // 4. Enviar
        await transporter.sendMail(mailOptions);
        
        return res.status(200).json({ message: 'Correo enviado con éxito' });

    } catch (error) {
        console.error("Error enviando correo:", error);
        return res.status(500).json({ error: error.message });
    }
};