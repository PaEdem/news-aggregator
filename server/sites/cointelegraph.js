// server/sites/cointelegraph.js
const cheerio = require('cheerio');

module.exports = {
  name: 'Cointelegraph',
  url: 'https://cointelegraph.com/category/latest-news',
  async scrape(count = 10, browser) {
    let page;
    try {
      page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      );
      await page.goto(this.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForSelector('li[data-testid="posts-listing__item"]', { timeout: 5000 });

      const articles = await page.evaluate((count) => {
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
      const articleBody = $('div.post-content');
      if (articleBody.length > 0) {
        articleBody.find('div.text-banner').remove();
        articleBody.find('div.related-list').remove();
        articleBody.find('form.newsletter-subscription-form_k9oQq').remove();
        articleBody.find('div.tags-list').remove();
        articleBody.find('div.reactions_3eiuR').remove();
        articleBody.find('iframe').remove();
        articleBody.find('figure').remove();
        articleBody.children().each((i, el) => {
          const tagName = el.tagName.toLowerCase();
          if (tagName === 'h2') {
            const heading = $(el).text().trim();
            if (heading) paragraphs.push(`**${heading}**`);
          } else if (tagName === 'p') {
            const hasLinkWithEmStrong = $(el).find('a').length > 0 && $(el).find('a em strong').length > 0;
            if (!hasLinkWithEmStrong) {
              const text = $(el).text().trim();
              if (text.length > 0) paragraphs.push(text);
            }
          } else if (tagName === 'blockquote') {
            const quote = $(el).text().trim();
            if (quote.length > 0) paragraphs.push(`[Quote] ${quote}`);
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
