// server/utils/groq.js
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: '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' });

// Функция для создания задержки
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const generateText = async (prompt, text, maxTokens = 200) => {
  try {
    const variants = [];
    for (let i = 0; i < 3; i++) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: text }, // Убрали лишнее "Text: "
        ],
        max_tokens: maxTokens,
        n: 1,
      });
      const variant = completion.choices[0].message.content.trim();
      variants.push(variant);
      if (i < 2) await delay(500);
    }
    // Объединяем варианты с разделителем ---
    return variants.join('\n---\n');
  } catch (error) {
    console.error('Error generating text with Groq:', error.message);
    throw new Error('Failed to generate text');
  }
};

module.exports = { generateText };
