// backend/sites/beincrypto.js
const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
  name: 'BeInCrypto',
  url: 'https://beincrypto.com/news/',
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
      $('div[data-el="bic-c-news-big"]').each((i, element) => {
        const title = $(element).find('h5.s2 a').text().trim();
        const link = $(element).find('h5.s2 a').attr('href');
        const time = $(element).find('time.date').text().trim();

        if (title && link && time) {
          articles.push({
            siteName: this.name,
            title,
            link: link.startsWith('http') ? link : `https://beincrypto.com${link}`,
            time,
          });
        }
      });

      // Возвращаем только первые 10 заголовков
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
      let foundDisclaimer = false;

      $('div.entry-content-inner p').each((i, el) => {
        // Проверяем, не является ли текущий <p> началом дисклеймера
        if ($(el).hasClass('h8') && $(el).text().trim() === 'Disclaimer') {
          foundDisclaimer = true; // Нашли дисклеймер, дальше текст не собираем
          return false; // Прерываем цикл
        }

        // Если дисклеймер еще не найден, добавляем текст
        if (!foundDisclaimer) {
          const text = $(el).text().trim();
          if (text.length > 0) {
            const isQuote = $(el).closest('blockquote').length > 0;
            paragraphs.push(isQuote ? `[Quote] ${text}` : text);
          }
        }
      });

      return paragraphs.join('\n');
    } catch (error) {
      console.error(`Error scraping article from ${link}:`, error.message);
      return 'Failed to load article content.';
    }
  },
};
