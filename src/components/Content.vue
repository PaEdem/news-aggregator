<!-- src/components/Content.vue -->
<template>
  <div class="content">
    <Article v-if="!newsStore.modifiedArticle" />
    <ModifyArticle v-if="newsStore.modifiedArticle" />
    <ArticleSSML v-if="newsStore.ssmlArticle" />
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';
import Article from './Article.vue';
import ModifyArticle from './ModifyArticle.vue';
import ArticleSSML from './ArticleSSML.vue';

export default {
  name: 'Content',
  components: {
    Article,
    ModifyArticle,
    ArticleSSML,
  },
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
};
</script>

<style scoped>
.content {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  height: 100%;
  background-color: var(--white);
}
</style>
