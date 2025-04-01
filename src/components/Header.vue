<!-- src/components/Header.vue -->
<template>
  <header>
    <div class="header-left">
      <Range />
    </div>
    <div class="header-right">
      <button @click="getTitles">TITLES</button>
      <button
        @click="modify"
        :disabled="!newsStore.selectedNews"
      >
        MODIFY
      </button>
      <button
        @click="ssml"
        :disabled="!newsStore.modifiedArticle"
      >
        SSML
      </button>
      <button
        @click="save"
        :disabled="!newsStore.selectedNews"
      >
        SAVE
      </button>
    </div>
  </header>
</template>

<script>
import { useNewsStore } from '../stores/news';
import axios from 'axios';
import Range from './Range.vue';

export default {
  name: 'Header',
  components: {
    Range,
  },
  setup() {
    const newsStore = useNewsStore();
    return { newsStore };
  },
  methods: {
    async getTitles() {
      this.newsStore.setLoading(true);
      try {
        // Запрос к бэкенду
        const response = await axios.get('http://localhost:3000/scrape', {
          params: { count: this.newsStore.articleCount },
        });
        const articles = response.data.map((article, index) => ({
          id: index + 1, // Генерируем ID
          siteName: article.siteName,
          title: article.title,
          link: article.link,
          time: article.time,
          translation: 'Перевод пока не реализован', // Заглушка для перевода
          article: 'Текст статьи пока не загружается', // Заглушка для текста статьи
          isSaved: false,
        }));
        this.newsStore.setNewsList(articles);

        // Сохранение в LocalStorage после GET TITLES
        const titlesToSave = articles.map((article) => ({
          title: article.title,
          link: article.link,
          time: article.time,
        }));
        localStorage.setItem('titles', JSON.stringify(titlesToSave));
      } catch (error) {
        console.error('Error fetching titles:', error.message);
        alert('Failed to fetch titles. Please try again.');
      } finally {
        this.newsStore.setLoading(false);
      }
    },
    async modify() {
      this.newsStore.setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация задержки
        const modified = {
          modifyTitle: 'Modified: ' + this.newsStore.selectedNews.title,
          modifyArticle: 'Modified article text...',
          modifyTitleRus: 'Перевод: ' + this.newsStore.selectedNews.translation,
          modifyArticleRus: 'Перевод статьи...',
        };
        this.newsStore.setModifiedArticle(modified);

        // Сохранение в LocalStorage после MODIFY
        const articleToSave = {
          modTitleEn: modified.modifyTitle,
          modTextEn: modified.modifyArticle,
          modTitleRu: modified.modifyTitleRus,
          modTextRu: modified.modifyArticleRus,
          ssmlTitle: '',
          ssmlText: '',
        };
        const existingArticles = JSON.parse(localStorage.getItem('articles') || '[]');
        const updatedArticles = [
          ...existingArticles.filter((a) => a.id !== this.newsStore.selectedNews.id),
          { id: this.newsStore.selectedNews.id, ...articleToSave },
        ];
        localStorage.setItem('articles', JSON.stringify(updatedArticles));
      } finally {
        this.newsStore.setLoading(false);
      }
    },
    async ssml() {
      this.newsStore.setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация задержки
        const ssml = {
          modifyTitleSsml: '<speak>' + this.newsStore.modifiedArticle.modifyTitle + '</speak>',
          modifyArticleSsml: '<speak>' + this.newsStore.modifiedArticle.modifyArticle + '</speak>',
        };
        this.newsStore.setSsmlArticle(ssml);

        // Обновление данных в LocalStorage после SSML
        const existingArticles = JSON.parse(localStorage.getItem('articles') || '[]');
        const articleIndex = existingArticles.findIndex((a) => a.id === this.newsStore.selectedNews.id);
        if (articleIndex !== -1) {
          existingArticles[articleIndex] = {
            ...existingArticles[articleIndex],
            ssmlTitle: ssml.modifyTitleSsml,
            ssmlText: ssml.modifyArticleSsml,
          };
          localStorage.setItem('articles', JSON.stringify(existingArticles));
        }
      } finally {
        this.newsStore.setLoading(false);
      }
    },
    async save() {
      this.newsStore.setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Имитация задержки

        // Формируем данные для сохранения
        const dataToSave = {
          modifyTitle: this.newsStore.modifiedArticle?.modifyTitle || '',
          modifyArticle: this.newsStore.modifiedArticle?.modifyArticle || '',
          modifyTitleRus: this.newsStore.modifiedArticle?.modifyTitleRus || '',
          modifyArticleRus: this.newsStore.modifiedArticle?.modifyArticleRus || '',
          modifyTitleSsml: this.newsStore.ssmlArticle?.modifyTitleSsml || '',
          modifyArticleSsml: this.newsStore.ssmlArticle?.modifyArticleSsml || '',
        };

        // Сохранение в LocalStorage
        const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
        savedArticles.push({
          id: this.newsStore.selectedNews.id,
          ...dataToSave,
        });
        localStorage.setItem('savedArticles', JSON.stringify(savedArticles));

        // Сохранение в текстовый файл
        const blob = new Blob([JSON.stringify(dataToSave, null, 2)], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `article_${this.newsStore.selectedNews.id}.txt`;
        link.click();
        URL.revokeObjectURL(url);

        // Обновляем состояние карточки
        this.newsStore.saveNews(this.newsStore.selectedNews.id);
      } finally {
        this.newsStore.setLoading(false);
      }
    },
  },
};
</script>

<style scoped>
header {
  background-color: var(--blue);
  color: var(--beige);
  box-shadow: 0 2px 4px var(--black);
  padding: 10px;
  height: 80px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  gap: 10px;
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  gap: 10px;
}

button {
  background-color: var(--green);
  border: 1px solid var(--lightgrey);
  border-radius: 41px;
  padding: 12px 20px;
  cursor: pointer;
  color: var(--beige);
  font-weight: bold;
}

button:disabled {
  background-color: var(--grey);
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: var(--beige);
  color: var(--blue);
}
</style>
