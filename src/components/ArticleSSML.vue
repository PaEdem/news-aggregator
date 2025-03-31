<!-- src/components/ArticleSSML.vue -->
<template>
  <div class="article-ssml">
    <div>
      <p class="ssmlTitle">{{ newsStore.ssmlArticle.modifyTitleSsml }}</p>
      <p class="ssmlArticle">{{ newsStore.ssmlArticle.modifyArticleSsml }}</p>
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
  background-color: var(--beige);
  border: 1px solid var(--green);
  border-radius: 4px;
  padding: 16px 10px;
  /* flex: 1; */
}
.ssmlTitle {
  color: var(--blue);
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 8px;
}
.ssmlArticle {
  color: var(--black);
}
</style>
