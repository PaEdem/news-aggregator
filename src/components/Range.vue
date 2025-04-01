<!-- src/components/Range.vue -->
<template>
  <div class="container">
    <div class="range-slider">
      <span
        id="rs-bullet"
        class="rs-label"
        :style="{ left: `${newsStore.articleCount * 36}px` }"
      >
        {{ newsStore.articleCount }}
      </span>
      <input
        id="rs-range-line"
        class="rs-range"
        type="range"
        :value="newsStore.articleCount"
        min="1"
        max="10"
        @input="updateValue"
      />
    </div>
  </div>
</template>

<script>
import { useNewsStore } from '../stores/news';

export default {
  name: 'Range',
  setup() {
    const newsStore = useNewsStore();

    const updateValue = (event) => {
      const newValue = parseInt(event.target.value);
      newsStore.setArticleCount(newValue);
    };

    return {
      newsStore,
      updateValue,
    };
  },
};
</script>

<style scoped>
.container {
  height: 60px;
  width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.range-slider {
  position: relative;
  padding: 8px;
  margin-top: 24px;
}

.rs-range {
  width: 360px;
  appearance: none;
}

.rs-range:focus {
  outline: none;
}

.rs-range::-webkit-slider-runnable-track {
  width: 100%;
  height: 2px;
  cursor: pointer;
  background: var(--white);
}

.rs-range::-webkit-slider-thumb {
  height: 16px;
  width: 16px;
  border-radius: 22px;
  background: var(--white);
  cursor: pointer;
  -webkit-appearance: none;
  margin-top: -8px;
}

.rs-label {
  position: absolute;
  transform-origin: center center;
  display: block;
  width: 28px;
  height: 28px;
  background: transparent;
  border-radius: 50%;
  text-align: center;
  padding-top: 0px;
  box-sizing: border-box;
  border: 2px solid var(--white);
  margin-top: -28px;
  color: var(--white);
  font-size: 16px;
}
</style>
