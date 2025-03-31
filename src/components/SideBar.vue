<!-- src/components/SideBar.vue -->
<template>
  <div class="sidebar">
    <TitleCardList />
  </div>
</template>

<script>
import TitleCardList from './TitleCardList.vue';

export default {
  name: 'SideBar',
  components: {
    TitleCardList,
  },
};
</script>

<style scoped>
.sidebar {
  background-color: #fefefe;
  padding: 10px;
  overflow-y: auto;
}
</style>
