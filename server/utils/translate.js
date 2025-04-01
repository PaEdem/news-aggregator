// server/utils/translate.js
const axios = require('axios');

const LIBRE_TRANSLATE_URL = 'http://localhost:5000/translate';

async function translateText(text, sourceLang = 'en', targetLang = 'ru') {
  try {
    const response = await axios.post(
      LIBRE_TRANSLATE_URL,
      {
        q: text,
        source: sourceLang,
        target: targetLang,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.translatedText || text; // Возвращаем переведенный текст или исходный, если перевода нет
  } catch (error) {
    console.error(`Error translating text "${text}":`, error.message);
    return text; // В случае ошибки возвращаем исходный текст
  }
}

module.exports = { translateText };
