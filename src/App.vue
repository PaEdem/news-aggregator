<!-- src/App.vue -->
<template>
  <div id="app">
    <Header />
    <div class="main-layout">
      <SideBar />
      <Content />
    </div>
    <Loader :is-visible="newsStore.isLoading" />
  </div>
</template>

<script>
import { useNewsStore } from './stores/news';
import Header from './components/Header.vue';
import SideBar from './components/SideBar.vue';
import Content from './components/Content.vue';
import Loader from './components/Loader.vue';

export default {
  name: 'App',
  components: {
    Header,
    SideBar,
    Content,
    Loader,
  },
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
  mounted() {
    // Очистка LocalStorage при завершении сеанса
    window.addEventListener('beforeunload', () => {
      localStorage.removeItem('titles');
      localStorage.removeItem('articles');
      localStorage.removeItem('savedArticles');
    });
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: calc(100vh - 80px);
}
</style>
