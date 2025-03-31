<!-- src/components/ModifyArticle.vue -->
<template>
  <div class="modify-article">
    <div>
      <p class="engTitle">{{ newsStore.modifiedArticle.modifyTitle }}</p>
      <p class="engArticle">{{ newsStore.modifiedArticle.modifyArticle }}</p>
      <p class="rusTitle">{{ newsStore.modifiedArticle.modifyTitleRus }}</p>
      <p class="rusArticle">{{ newsStore.modifiedArticle.modifyArticleRus }}</p>
    </div>
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';

export default {
  name: 'ModifyArticle',
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
};
</script>

<style scoped>
.modify-article {
  background-color: var(--beige);
  border: 1px solid var(--green);
  border-radius: 4px;
  padding: 16px 10px;
  /* flex: 1; */
}
.engTitle {
  color: var(--blue);
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 4px;
}
.engArticle {
  color: var(--black);
  margin-bottom: 10px;
}
.rusTitle {
  color: var(--blue);
  font-size: 16px;
  font-weight: bold;
  font-style: italic;
  margin-bottom: 4px;
}
.rusArticle {
  color: var(--black);
  font-style: italic;
}
</style>
