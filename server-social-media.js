const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const { Configuration, OpenAIApi } = require("openai");

dotenv.config();

const app = express();
const upload = multer();

app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

function getPromptForSocialMedia(socialMedia) {
  switch (socialMedia) {
    case 'Instagram':
      return 'Genera una descripción persuasiva y breve para Instagram, comenzando con una pregunta retórica que conecte con las frustraciones del cliente. Presenta el producto de forma emocionante usando emojis. Describe el beneficio principal de manera clara y emocional, e incluye de 3 a 4 beneficios clave con emojis. Termina con un fuerte llamado a la acción y hashtags relevantes. La descripción debe tener alrededor de 150 palabras. 📸✨';
    case 'Shopify':
      return 'Crea una descripción detallada y completa para Shopify, comenzando con una pregunta retórica que conecte con las frustraciones del cliente. Presenta el producto de forma emocionante, usando emojis. Describe el beneficio principal de manera clara y emocional, e incluye de 5 a 7 beneficios clave con emojis. Agrega detalles sobre textura, ingredientes y características especiales. Termina con un fuerte llamado a la acción, destacando opciones de pago y conveniencia. La descripción debe tener alrededor de 300 palabras. 🛍️💻';
    case 'TikTok':
      return 'Crea una descripción corta y atractiva para TikTok, comenzando con una frase impactante o una pregunta intrigante. Presenta el producto de forma emocionante y concisa, usando emojis. Menciona 2-3 beneficios clave con emojis. Incluye un llamado a la acción relacionado con el contenido de TikTok (como "Mira el video para ver cómo funciona"). Termina con hashtags relevantes y tendencias. La descripción debe tener alrededor de 100 palabras. 🎵📱';
    case 'Facebook':
      return 'Crea una descripción atractiva y compartible para Facebook, comenzando con una pregunta intrigante o un dato sorprendente sobre el producto. Presenta el producto de forma emocionante y relatable, usando emojis. Describe el beneficio principal de manera clara y convincente. Incluye 3-5 beneficios clave con emojis. Agrega un elemento de urgencia o exclusividad. Termina con un fuerte llamado a la acción que invite a la interacción (likes, comentarios, compartir). Incluye 2-3 hashtags relevantes. La descripción debe tener alrededor de 200 palabras. 👍💬';
    default:
      return 'Genera una descripción persuasiva para un producto de Ecommerce, adaptada a la plataforma seleccionada por el usuario. Comienza con una pregunta retórica que conecte con las frustraciones del cliente y presenta el producto de forma emocionante, usando emojis. Describe el beneficio principal de manera clara y emocional, e incluye beneficios clave con emojis que sean específicos y relevantes. Agrega detalles sobre textura, ingredientes y características especiales cuando sea apropiado. Termina con un fuerte llamado a la acción que motive al cliente a comprar. Adapta la longitud y el estilo según la plataforma elegida. 🛒📱💻';
  }
}

app.post('/analyze', upload.array('images'), async (req, res) => {
  try {
    const { additionalInfo, socialMedia } = req.body;
    const images = req.files;

    const prompt = getPromptForSocialMedia(socialMedia);

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'text', text: additionalInfo },
          ...images.map(image => ({
            type: 'image_url',
            image_url: {
              url: `data:${image.mimetype};base64,${image.buffer.toString('base64')}`,
            }
          }))
        ]
      }
    ];

    const response = await openai.createChatCompletion({
      model: "gpt-4-vision-preview",
      messages: messages,
      max_tokens: 1024,
    });

    res.json({ analysis: response.data.choices[0].message.content });
  } catch (error) {
    console.error('Error in /analyze:', error);
    res.status(500).json({ error: 'Error al analizar las imágenes' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Social Media Analysis Server running on port ${PORT}`);
});