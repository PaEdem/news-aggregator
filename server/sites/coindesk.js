// server/sites/coindesk.js
const cheerio = require('cheerio');

module.exports = {
  name: 'CoinDesk',
  url: 'https://www.coindesk.com/latest-crypto-news',
  async scrape(count = 10, browser) {
    let page;
    try {
      page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('div.bg-white.flex.gap-6.w-full.shrink.justify-between', { timeout: 5000 });

      const articles = await page.evaluate((count) => {
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
        return results.slice(0, count);
      }, count);
      return articles;
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
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      await page.goto(link, { waitUntil: 'domcontentloaded', timeout: 30000 });

      const html = await page.content();
      const $ = cheerio.load(html);

      const paragraphs = [];
      const articleBody = $('div.document-body.font-body-lg');
      if (articleBody.length > 0) {
        articleBody.find('div.container-jwp').remove();
        articleBody.find('div[data-module-name="newsletter-article-sign-up-module"]').remove();
        articleBody.find('div.article-ad.ad-desktop').remove();
        articleBody.find('div.flex.justify-center.gap-4').remove();
        articleBody.children().each((i, el) => {
          if (el.tagName.toLowerCase() === 'p') {
            const text = $(el).text().trim();
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
    } finally {
      if (page) await page.close();
    }
  },
};
