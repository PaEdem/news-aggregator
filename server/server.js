// server/server.js
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { translateText } = require('./utils/translate');
const { generateText } = require('./utils/groq');
const { modifyPrompt, ssmlPrompt } = require('./utils/prompts');

const cryptoslate = require('./sites/cryptoslate');
const cointelegraph = require('./sites/cointelegraph');
const coindesk = require('./sites/coindesk');
const cryptonews = require('./sites/cryptonews');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const sites = [cryptoslate, cointelegraph, coindesk, cryptonews];

// Глобальный экземпляр браузера
let browser;

(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
})();

app.get('/scrape', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const articlePromises = sites.map(async (site) => {
      const articles = await site.scrape(count, browser);
      for (const article of articles) {
        article.translatedTitle = await translateText(article.title, 'en', 'ru');
      }
      return articles;
    });
    const allArticles = (await Promise.all(articlePromises)).flat();
    res.json(allArticles);
  } catch (error) {
    console.error('Error scraping news:', error.message);
    res.status(500).json({ error: 'Failed to scrape news' });
  }
});

app.get('/scrape-article', async (req, res) => {
  const { siteName, link } = req.query;
  if (!siteName || !link) {
    return res.status(400).json({ error: 'siteName and link are required' });
  }
  try {
    const site = sites.find((s) => s.name === siteName);
    if (!site) {
      return res.status(404).json({ error: `Site ${siteName} not found` });
    }
    const articleText = await site.scrapeArticle(link, browser);
    const translatedArticle = await translateText(articleText, 'en', 'ru');
    res.json({ article: articleText, translatedArticle });
  } catch (error) {
    console.error(`Error scraping article from ${link}:`, error.message);
    res.status(500).json({ error: 'Failed to scrape article' });
  }
});

app.post('/modify', async (req, res) => {
  const { title, article } = req.body;
  if (!title || !article) {
    return res.status(400).json({ error: 'Title and article text are required' });
  }
  try {
    const inputText = `Title: ${title}\nArticle: ${article}`;
    console.log('Sending request to Groq with input:', inputText);
    const variantsText = await generateText(modifyPrompt, inputText, 200);

    console.log('Groq response variants:', variantsText);

    // Разделяем варианты по разделителю ---
    const variantBlocks = variantsText.split('---').filter((block) => block.trim() !== '');

    // Ограничиваем количество вариантов до трёх
    const limitedVariantBlocks = variantBlocks.slice(0, 3);

    if (limitedVariantBlocks.length !== 3) {
      throw new Error(`Expected exactly 3 variants, but got ${limitedVariantBlocks.length}`);
    }

    const parsedVariants = limitedVariantBlocks.map((block, index) => {
      const lines = block.split('\n').filter((line) => line.trim() !== '');
      const titleLine = lines.find((line) => line.startsWith('Title: ')) || '';
      const textLine = lines.find((line) => line.startsWith('Text: ')) || '';
      const modifyTitle = titleLine.replace('Title: ', '').trim();
      const modifyArticle = textLine.replace('Text: ', '').trim();

      console.log(`Variant ${index + 1}: Title length: ${modifyTitle.length}, Text length: ${modifyArticle.length}`);

      if (!modifyTitle || !modifyArticle) {
        throw new Error('Title or article text is empty in variant ' + (index + 1));
      }

      return { modifyTitle, modifyArticle };
    });

    const translatedVariants = await Promise.all(
      parsedVariants.map(async (variant) => ({
        modifyTitleRus: await translateText(variant.modifyTitle, 'en', 'ru'),
        modifyArticleRus: await translateText(variant.modifyArticle, 'en', 'ru'),
      }))
    );

    const result = parsedVariants.map((variant, index) => ({
      modifyTitle: variant.modifyTitle,
      modifyArticle: variant.modifyArticle,
      modifyTitleRus: translatedVariants[index].modifyTitleRus,
      modifyArticleRus: translatedVariants[index].modifyArticleRus,
    }));

    res.json({ variants: result });
  } catch (error) {
    console.error('Error modifying article:', error.message);
    res.status(500).json({ error: 'Failed to modify article' });
  }
});

app.post('/ssml', async (req, res) => {
  const { title, text } = req.body;
  if (!title || !text) {
    return res.status(400).json({ error: 'Title and text are required' });
  }
  try {
    const inputText = `Title: ${title}\nText: ${text}`;
    const ssmlResult = await generateText(ssmlPrompt, inputText, 300);
    const ssmlVariant = ssmlResult.split('---')[0]; // Берем только первый вариант

    const lines = ssmlVariant.split('\n').filter((line) => line.trim() !== '');
    let titleLine = '';
    let textLine = '';
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('Title: ')) {
        titleLine = lines[i];
        textLine = lines[i + 1].startsWith('Text: ') ? lines[i + 1] : '';
        break;
      }
    }
    const modifyTitleSsml = titleLine.replace('Title: ', '').trim();
    const modifyArticleSsml = textLine.replace('Text: ', '').trim();

    res.json({ modifyTitleSsml, modifyArticleSsml });
  } catch (error) {
    console.error('Error generating SSML:', error.message);
    res.status(500).json({ error: 'Failed to generate SSML' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

// Закрытие браузера при остановке сервера
process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});
