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
  // ... (mantén el código existente para esta función)
}

function getPromptForMetaAds() {
  // ... (mantén el código existente para esta función)
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});