<!-- src/components/ModifyArticle.vue -->
<template>
  <div class="modify-article">
    <div class="variants-section">
      <ModifyNews
        v-for="(variant, index) in newsStore.modifiedArticle?.variants"
        :key="index"
        :variant="variant"
        :is-selected="selectedVariant === variant"
        @select="selectVariant"
      />
    </div>
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';
import ModifyNews from './ModifyNews.vue';

export default {
  name: 'ModifyArticle',
  components: { ModifyNews },
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
  data() {
    return {
      selectedVariant: null,
    };
  },
  watch: {
    'newsStore.modifiedArticle'() {
      this.selectedVariant = this.newsStore.selectedVariant;
    },
  },
  methods: {
    selectVariant(variant) {
      this.selectedVariant = variant;
      this.newsStore.setSelectedVariant(variant);
    },
  },
};
</script>

<style scoped>
.modify-article {
  background-color: var(--white);
  border: 1px solid var(--green);
  border-radius: 4px;
  padding: 8px 8px;
}
.variants-section {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
</style>
