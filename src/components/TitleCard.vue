<!-- src/components/TitleCard.vue -->
<template>
  <div
    class="news-card"
    :class="{ saved: isSaved }"
    @click="!isSaved && selectCard()"
  >
    <div class="header">
      <span class="site-name">{{ siteName }}</span>
      <span class="time">{{ time }}</span>
    </div>
    <h3 class="title">{{ title }}</h3>
    <p class="translation">{{ translation }}</p>
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';
import axios from 'axios';

export default {
  name: 'TitleCard',
  props: {
    id: Number,
    siteName: String,
    time: String,
    title: String,
    translation: String,
    isSaved: Boolean,
  },
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
  methods: {
    async selectCard() {
      const news = {
        id: this.id,
        siteName: this.siteName,
        time: this.time,
        title: this.title,
        translation: this.translation,
        link: this.newsStore.newsList.find((item) => item.id === this.id).link,
        article: 'Loading article...',
        isSaved: this.isSaved,
      };
      this.newsStore.selectNews(news);

      // Запрос на парсинг текста статьи
      try {
        this.newsStore.setLoading(true);
        const response = await axios.get('http://localhost:3000/scrape-article', {
          params: {
            siteName: this.siteName,
            link: news.link,
          },
        });
        this.newsStore.selectedNews.article = response.data.article;
      } catch (error) {
        console.error('Error fetching article:', error.message);
        this.newsStore.selectedNews.article = 'Failed to load article content.';
      } finally {
        this.newsStore.setLoading(false);
      }
    },
  },
};
</script>

<style scoped>
.news-card {
  background-color: var(--beige);
  border: 1px solid var(--green);
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
}

.news-card:hover {
  background-color: var(--white);
  border: 1px solid var(--red);
}

.news-card.saved {
  background-color: var(--lightgrey);
  cursor: not-allowed;
}

.header {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--grey);
}
.time {
  text-transform: lowercase;
}

.title {
  margin: 4px 0;
  font-size: 14px;
  color: var(--blue);
}

.translation {
  font-style: italic;
  color: var(--green);
  font-size: 12px;
}
</style>
