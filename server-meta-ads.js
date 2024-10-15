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

function getPromptForMetaAds() {
  return `
  Crea una campaña de Meta Ads detallada basada en la información proporcionada. Asegúrate de incluir los siguientes elementos:

  1. **Objetivo de la Campaña**: 
     - Define el objetivo principal (Reconocimiento, Consideración, Conversión).
     - Explica brevemente por qué este objetivo es el más adecuado para la campaña.

  2. **Configuración del Conjunto de Anuncios**:
     - **Audiencia**:
       - **Ubicación Geográfica**: Especifica los países o regiones donde se mostrarán los anuncios.
       - **Edad y Género**: Define el rango de edad y el género de la audiencia objetivo.
       - **Segmentación Detallada**: Incluye intereses, comportamientos y datos demográficos relevantes.
     - **Presupuesto**: Sugiere un presupuesto diario o total para la campaña.
     - **Duración**: Recomienda la duración óptima de la campaña.

  3. **Mercado Objetivo**: 
     - Indica el mercado objetivo específico para la campaña.
     - Describe brevemente las características clave de este mercado.

  4. **Ubicaciones de los Anuncios**: 
     - **Automáticas**: Explica cómo Meta optimizará la colocación de anuncios.
     - **Manual**: Especifica dónde se mostrarán los anuncios (Facebook, Instagram, Messenger, Audience Network) y por qué.

  5. **Formato de Anuncios**:
     - Recomienda los mejores formatos de anuncios para esta campaña (imagen única, carrusel, video, etc.).
     - Explica por qué estos formatos son los más adecuados.

  6. **Texto del Anuncio**:
     - Proporciona un titular atractivo (máximo 40 caracteres).
     - Escribe un texto principal persuasivo (máximo 125 caracteres).
     - Sugiere una descripción adicional si es necesario (máximo 30 caracteres).

  7. **Llamada a la Acción (CTA)**:
     - Recomienda un CTA efectivo y relevante para el objetivo de la campaña.

  8. **Optimización y Entrega**:
     - Sugiere la mejor estrategia de optimización (clics en el enlace, conversiones, etc.).
     - Recomienda un método de entrega (estándar o acelerado).

  La descripción debe ser clara, persuasiva y orientada a resultados. Utiliza emojis donde sea apropiado para mejorar la legibilidad y el atractivo visual. La longitud total debe ser de aproximadamente 250-300 palabras. 📊🎯✨
  `;
}

app.post('/analyze-meta-ads', upload.array('images'), async (req, res) => {
  try {
    const { additionalInfo, targetMarket } = req.body;
    const images = req.files;

    const prompt = getPromptForMetaAds();

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'text', text: additionalInfo },
          { type: 'text', text: `Mercado objetivo: ${targetMarket}` },
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
    console.error('Error in /analyze-meta-ads:', error);
    res.status(500).json({ error: 'Error al analizar las imágenes para Meta Ads' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Meta Ads Analysis Server running on port ${PORT}`);
});