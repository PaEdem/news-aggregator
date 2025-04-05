<!-- src/components/TitleCardList.vue -->
<template>
  <div class="title-card-list">
    <div v-if="sortedNewsList.length === 0">
      <p>Select the amount of news. Click "TITLES" to fetch news.</p>
    </div>
    <TitleCard
      v-else
      v-for="news in sortedNewsList"
      :key="news.id"
      :id="news.id"
      :site-name="news.siteName"
      :time="news.time"
      :title="news.title"
      :translation="news.translation"
      :is-saved="news.isSaved"
    />
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';
import TitleCard from './TitleCard.vue';

export default {
  name: 'TitleCardList',
  components: {
    TitleCard,
  },
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
  computed: {
    sortedNewsList() {
      return [...this.newsStore.newsList].sort((a, b) => {
        const timeA = parseInt(a.time);
        const timeB = parseInt(b.time);
        return timeA - timeB;
      });
    },
  },
};
</script>

<style scoped>
.title-card-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
}

p {
  text-align: center;
  font-size: 1.2rem;
  font-style: italic;
  white-space: nowrap;
  color: var(--grey);
}
</style>
