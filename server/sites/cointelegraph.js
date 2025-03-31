// backend/sites/cointelegraph.js
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

module.exports = {
  name: 'Cointelegraph',
  url: 'https://cointelegraph.com/category/latest-news',
  async scrape() {
    let browser;
    try {
      // Запускаем Puppeteer
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      // Устанавливаем User-Agent
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );

      // Переходим на страницу
      await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Ждем, пока карточки новостей загрузятся
      await page.waitForSelector('li[data-testid="posts-listing__item"]', { timeout: 10000 });

      // Извлекаем данные
      const articles = await page.evaluate(() => {
        const items = document.querySelectorAll('li[data-testid="posts-listing__item"]');
        const results = [];

        items.forEach((item) => {
          const titleElement = item.querySelector('span.post-card-inline__title');
          const linkElement = item.querySelector('a.post-card-inline__title-link');
          const timeElement = item.querySelector('time.post-card-inline__date');

          const title = titleElement ? titleElement.innerText.trim() : '';
          const link = linkElement ? linkElement.getAttribute('href') : '';
          const time = timeElement ? timeElement.innerText.trim() : '';

          if (title && link && time) {
            results.push({
              siteName: 'Cointelegraph',
              title,
              link: link.startsWith('http') ? link : `https://cointelegraph.com${link}`,
              time,
            });
          }
        });

        return results.slice(0, 10);
      });

      return articles;
    } catch (error) {
      console.error(`Error scraping ${this.name}:`, error.message);
      return [];
    } finally {
      if (browser) {
        await browser.close();
      }
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
      const articleBody = $('div.post-content');

      if (articleBody.length > 0) {
        // Удаляем нежелательные элементы
        articleBody.find('div.text-banner').remove(); // Реклама
        articleBody.find('div.related-list').remove(); // Связанные статьи
        articleBody.find('form.newsletter-subscription-form_k9oQq').remove(); // Форма подписки
        articleBody.find('div.tags-list').remove(); // Теги
        articleBody.find('div.reactions_3eiuR').remove(); // Реакции
        articleBody.find('iframe').remove(); // Видео
        articleBody.find('figure').remove(); // Изображения

        // Извлекаем заголовки, абзацы и цитаты
        articleBody.children().each((i, el) => {
          const tagName = el.tagName.toLowerCase();

          if (tagName === 'h2') {
            const heading = $(el).text().trim();
            if (heading) {
              paragraphs.push(`**${heading}**`);
            }
          } else if (tagName === 'p') {
            // Проверяем, содержит ли параграф ссылку <a> с <em><strong> внутри
            const hasLinkWithEmStrong = $(el).find('a').length > 0 && $(el).find('a em strong').length > 0;
            if (!hasLinkWithEmStrong) {
              const text = $(el).text().trim();
              if (text.length > 0) {
                paragraphs.push(text);
              }
            }
          } else if (tagName === 'blockquote') {
            const quote = $(el).text().trim();
            if (quote.length > 0) {
              paragraphs.push(`[Quote] ${quote}`);
            }
          }
        });
      }

      return paragraphs.length > 0 ? paragraphs.join('') : 'No article content found.';
    } catch (error) {
      console.error(`Error scraping article from ${link}:`, error.message);
      return 'Failed to load article content.';
    }
  },
};
