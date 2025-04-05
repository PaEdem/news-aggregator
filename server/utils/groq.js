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
          { role: 'user', content: text },
        ],
        max_tokens: maxTokens,
        n: 1,
      });
      const variant = completion.choices[0].message.content.trim();
      // Разделяем ответ на варианты и берём только первый
      const variantBlocks = variant.split('---').filter((block) => block.trim() !== '');
      const singleVariant = variantBlocks[0] || variant; // Берём только первый вариант
      variants.push(singleVariant);
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
