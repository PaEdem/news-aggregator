<!-- src/components/ArticleSSML.vue -->
<template>
  <div class="article-ssml">
    <div>
      <p class="ssmlTitle">{{ newsStore.ssmlArticle?.modifyTitleSsml || 'Нет данных' }}</p>
      <p class="ssmlArticle">{{ newsStore.ssmlArticle?.modifyArticleSsml || 'Нет данных' }}</p>
    </div>
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';

export default {
  name: 'ArticleSSML',
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
};
</script>

<style scoped>
.article-ssml {
  background-color: var(--mint);
  border: 1px solid var(--red);
  border-radius: 4px;
  padding: 8px;
}
.ssmlTitle {
  color: var(--blue);
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
}
.ssmlArticle {
  color: var(--blue);
  font-size: 12px;
}
</style>
