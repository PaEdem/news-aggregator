// server/sites/cryptonews.js
const cheerio = require('cheerio');

module.exports = {
  name: 'CryptoNews',
  url: 'https://crypto.news/news/',
  async scrape(count = 10, browser) {
    let page;
    try {
      page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      );
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('div.post-loop', { timeout: 5000 });

      const html = await page.content();
      const $ = cheerio.load(html);
      const articles = [];
      $('div.post-loop').each((i, element) => {
        const title = $(element).find('p.post-loop__title a.post-loop__link').text().trim();
        const link = $(element).find('p.post-loop__title a.post-loop__link').attr('href');
        const time = $(element).find('time.post-loop__date').text().trim();
        if (title && link && time) {
          articles.push({ siteName: this.name, title, link, time });
        }
      });
      return articles.slice(0, count);
    } catch (error) {
      console.error(`Error scraping ${this.name}:`, error.message);
      return [];
    } finally {
      if (page) await page.close();
    }
  },
  async scrapeArticle(link, browser) {
    let page;
    try {
      page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36'
      );
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const html = await page.content();
      const $ = cheerio.load(html);

      const paragraphs = [];
      $('div.post-detail__content.blocks p').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 0) {
          const isQuote = $(el).closest('blockquote').length > 0;
          paragraphs.push(isQuote ? `[Quote] ${text}` : text);
        }
      });

      return paragraphs.join('\n');
    } catch (error) {
      console.error(`Error scraping article from ${link}:`, error.message);
      return 'Failed to load article content.';
    } finally {
      if (page) await page.close();
    }
  },
};
