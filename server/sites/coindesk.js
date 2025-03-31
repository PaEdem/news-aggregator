// backend/sites/coindesk.js
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

module.exports = {
  name: 'CoinDesk',
  url: 'https://www.coindesk.com/latest-crypto-news',
  async scrape() {
    let browser;
    try {
      console.log(`[CoinDesk] Starting scrape for ${this.url}`);
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      await page.goto(this.url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Ждем, пока карточки новостей загрузятся
      await page.waitForSelector('div.bg-white.flex.gap-6.w-full.shrink.justify-between', { timeout: 15000 });

      const articles = await page.evaluate(() => {
        const items = document.querySelectorAll('div.bg-white.flex.gap-6.w-full.shrink.justify-between');
        const results = [];
        items.forEach((item) => {
          const titleElement = item.querySelector('h2.font-headline-xs.font-normal');
          const linkElement = item.querySelector('a.text-color-charcoal-900.mb-4.hover\\:underline');
          const timeElement = item.querySelector('span.font-metadata.text-color-charcoal-600.uppercase');

          const title = titleElement ? titleElement.innerText.trim() : '';
          const link = linkElement ? linkElement.getAttribute('href') : '';
          const time = timeElement ? timeElement.innerText.trim() : '';

          if (title && link && time) {
            results.push({
              siteName: 'CoinDesk',
              title,
              link: link.startsWith('http') ? link : `https://www.coindesk.com${link}`,
              time,
            });
          }
        });
        return results.slice(0, 10); // Ограничиваем 10 статьями
      });
      return articles;
    } catch (error) {
      console.error(`Error scraping ${this.name}:`, error.message);
      return [];
    } finally {
      if (browser) await browser.close();
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
      const articleBody = $('div.document-body.font-body-lg');

      if (articleBody.length > 0) {
        // Удаляем нежелательные элементы
        articleBody.find('div.container-jwp').remove(); // Видео
        articleBody.find('div[data-module-name="newsletter-article-sign-up-module"]').remove(); // Форма подписки
        articleBody.find('div.article-ad.ad-desktop').remove(); // Реклама
        articleBody.find('div.flex.justify-center.gap-4').remove(); // "STORY CONTINUES BELOW"

        // Извлекаем абзацы
        articleBody.children().each((i, el) => {
          const tagName = el.tagName.toLowerCase();

          if (tagName === 'p') {
            const text = $(el).text().trim();
            // Пропускаем дисклеймер, начинающийся с "Disclaimer:"
            if (text.length > 0 && !text.startsWith('Disclaimer:')) {
              paragraphs.push(text);
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
