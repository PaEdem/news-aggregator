<!-- src/components/Article.vue -->
<template>
  <div class="article">
    <div v-if="selectedNews">
      <p class="article-title">{{ selectedNews.title }}</p>
      <p class="article-text">{{ selectedNews.article }}</p>
    </div>
    <div v-else>
      <p class="alt-text">Select a news card to view the article.</p>
    </div>
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';

export default {
  name: 'Article',
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
  computed: {
    selectedNews() {
      return this.newsStore.selectedNews;
    },
  },
};
</script>

<style scoped>
.article {
  background-color: var(--white);
  border: 1px solid var(--grey);
  border-radius: 4px;
  padding: 10px;
  overflow-y: auto;
}
.article-title {
  color: var(--blue);
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
}
.article-text {
  color: var(--black);
  font-size: 14px;
  white-space: pre-wrap;
}
.alt-text {
  color: var(--grey);
  font-size: 14px;
  text-align: center;
}
</style>
