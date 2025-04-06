<!-- src/components/ModifyNews.vue -->
<template>
  <div
    class="modify-news"
    :class="{ selected: isSelected }"
    @click="selectVariant"
  >
    <p class="engTitle">{{ variant.modifyTitle }}</p>
    <p class="engArticle">{{ variant.modifyArticle }}</p>
    <p class="rusTitle">{{ variant.modifyTitleRus }}</p>
    <p class="rusArticle">{{ variant.modifyArticleRus }}</p>
  </div>
</template>

<script>
export default {
  name: 'ModifyNews',
  props: {
    variant: {
      type: Object,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    selectVariant() {
      this.$emit('select', this.variant);
    },
  },
};
</script>

<style scoped>
.modify-news {
  background-color: var(--beige);
  border: 1px solid var(--grey);
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
}
.modify-news:hover {
  background-color: var(--white);
}
.selected {
  border-color: var(--red);
  background-color: var(--mint);
}
.engTitle {
  font-size: 12px;
  color: var(--blue);
  font-weight: bold;
}

.rusTitle {
  font-size: 12px;
  color: var(--black);
  font-weight: bold;
  font-style: italic;
}
.rusArticle {
  font-size: 12px;
  color: var(--black);
  font-style: italic;
}
.engArticle {
  font-size: 12px;
  color: var(--blue);
}
</style>
