// server/server.js
const express = require('express');
const cors = require('cors');
const { translateText } = require('./utils/translate');

// Импортируем конфигурации сайтов
const beincrypto = require('./sites/beincrypto');
const cryptoslate = require('./sites/cryptoslate');
const cointelegraph = require('./sites/cointelegraph');
const coindesk = require('./sites/coindesk');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// Список сайтов для парсинга
const sites = [beincrypto, cryptoslate, cointelegraph, coindesk];

// Эндпоинт для парсинга заголовков новостей
app.get('/scrape', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;

    const allArticles = [];
    for (const site of sites) {
      const articles = await site.scrape(count);
      // Переводим заголовки
      for (const article of articles) {
        article.translatedTitle = await translateText(article.title, 'en', 'ru');
        console.log(`Translated "${article.title}" to "${article.translatedTitle}"`);
      }
      allArticles.push(...articles);
    }

    res.json(allArticles);
  } catch (error) {
    console.error('Error scraping news:', error.message);
    res.status(500).json({ error: 'Failed to scrape news' });
  }
});

// Эндпоинт для парсинга текста статьи
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

    const articleText = await site.scrapeArticle(link);
    res.json({ article: articleText });
  } catch (error) {
    console.error(`Error scraping article from ${link}:`, error.message);
    res.status(500).json({ error: 'Failed to scrape article' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
