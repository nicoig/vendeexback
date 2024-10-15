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

function getPromptForVoice() {
  return `
  Debes crear una narrativa al estilo Antena 3D, debes abordar primero una problemática o pregunta relacionada al producto, luego presentar de forma persuasiva la solución, beneficios, características del producto,
  debes hacerlo en 50 palabras aprox, agrega algunos emojis relacionados, también debes considerar el contexto entregado, basate en cómo lo hace Antena 3D para vender. Identifica de forma correcta el producto en la imagen que se proporciona.
  `;
}

app.post('/analyze-voice', upload.array('images'), async (req, res) => {
  try {
    const { additionalInfo } = req.body;
    const images = req.files;

    const prompt = getPromptForVoice();

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
    console.error('Error in /analyze-voice:', error);
    res.status(500).json({ error: 'Error al analizar las imágenes para voz' });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Voice Analysis Server running on port ${PORT}`);
});