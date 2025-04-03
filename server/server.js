// server/server.js
const express = require('express');
const cors = require('cors');
const puppeteer = require('puppeteer');
const { translateText } = require('./utils/translate');

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

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});

// Закрытие браузера при остановке сервера
process.on('SIGINT', async () => {
  if (browser) await browser.close();
  process.exit();
});
