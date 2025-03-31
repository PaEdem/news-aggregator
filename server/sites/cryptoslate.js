// backend/sites/cryptoslate.js
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  name: 'CryptoSlate',
  url: 'https://cryptoslate.com/news/',
  async scrape() {
    try {
      const response = await axios.get(this.url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      const $ = cheerio.load(response.data);

      const articles = [];
      $('div.list-post').each((i, element) => {
        const title = $(element).find('div.title h2').text().trim();
        const link = $(element).find('a').attr('href');
        const time = $(element).find('div.post-meta span:nth-child(2)').text().trim();

        if (title && link && time) {
          articles.push({
            siteName: this.name,
            title,
            link: link.startsWith('http') ? link : `https://cryptoslate.com${link}`,
            time,
          });
        }
      });

      return articles.slice(0, 10);
    } catch (error) {
      console.error(`Error scraping ${this.name}:`, error.message);
      return [];
    }
  },
  async scrapeArticle(link) {
    try {
      const response = await axios.get(link, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
      });
      const $ = cheerio.load(response.data);

      const paragraphs = [];
      // Первый вариант структуры: текст внутри div.post-box
      const postBox = $('div.post-box');
      if (postBox.length > 0) {
        postBox.find('p:not(.disclaimer p):not(.footer-disclaimer p):not(.related-articles p)').each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 0) {
            const isQuote = $(el).closest('blockquote').length > 0;
            paragraphs.push(isQuote ? `[Quote] ${text}` : text);
          }
        });
      }
      // Второй вариант структуры: текст внутри article.full-article
      else if ($('article.full-article').length > 0) {
        $(
          'article.full-article p:not(.footer-disclaimer p):not(.hypelab-container p):not(.code-block p):not(.unit-widgets p):not(.podcast-box p):not(.post-meta-flex p):not(.related-articles p)'
        ).each((i, el) => {
          const text = $(el).text().trim();
          if (text.length > 0) {
            const isQuote = $(el).closest('blockquote').length > 0;
            paragraphs.push(isQuote ? `[Quote] ${text}` : text);
          }
        });
      } else {
        return 'No supported article structure found.';
      }

      return paragraphs.length > 0 ? paragraphs.join('') : 'No article content found.';
    } catch (error) {
      console.error(`Error scraping article from ${link}:`, error.message);
      return 'Failed to load article content.';
    }
  },
};
