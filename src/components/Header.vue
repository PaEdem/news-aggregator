<!-- src/components/Header.vue -->
<template>
  <header>
    <div class="header-left">
      <span>{{ currentDate }}</span>
    </div>
    <div class="header-center">
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
  data() {
    return {
      currentDate: new Date().toLocaleDateString('ru-RU'),
    };
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
          translation: article.translatedTitle || 'Перевод недоступен',
          article: 'Текст статьи пока не загружается', // Заглушка
          isSaved: false,
        }));
        this.newsStore.setNewsList(articles);
        this.newsStore.setViewArticle(true);

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
        if (
          !this.newsStore.selectedNews.article ||
          this.newsStore.selectedNews.article === 'Текст статьи пока не загружается'
        ) {
          const response = await axios.get('http://localhost:3000/scrape-article', {
            params: {
              siteName: this.newsStore.selectedNews.siteName,
              link: this.newsStore.selectedNews.link,
            },
          });
          this.newsStore.selectedNews.article = response.data.article;
          this.newsStore.selectedNews.translatedArticle = response.data.translatedArticle;
        }

        const modifyResponse = await axios.post('http://localhost:3000/modify', {
          title: this.newsStore.selectedNews.title,
          article: this.newsStore.selectedNews.article,
        });

        const modified = {
          variants: modifyResponse.data.variants.map((variant) => {
            // Проверяем длину на фронтенде
            console.log(
              `Frontend check - Variant: Title length: ${variant.modifyTitle.length}, Text length: ${variant.modifyArticle.length}`
            );
            if (variant.modifyTitle.length < 25 || variant.modifyTitle.length > 35) {
              console.warn(`Title length out of range (25-35): ${variant.modifyTitle}`);
            }
            if (variant.modifyArticle.length < 450 || variant.modifyArticle.length > 500) {
              console.warn(`Text length out of range (450-500): ${variant.modifyArticle}`);
            }
            return variant;
          }),
        };
        this.newsStore.setModifiedArticle(modified);
        this.newsStore.setSelectedVariant(null);

        // Сохранение в LocalStorage после MODIFY
        const articleToSave = {
          variants: modified.variants.map((variant) => ({
            modTitleEn: variant.modifyTitle,
            modTextEn: variant.modifyArticle,
            modTitleRu: variant.modifyTitleRus,
            modTextRu: variant.modifyArticleRus,
          })),
          ssmlTitle: '',
          ssmlText: '',
        };
        const existingArticles = JSON.parse(localStorage.getItem('articles') || '[]');
        const updatedArticles = [
          ...existingArticles.filter((a) => a.id !== this.newsStore.selectedNews.id),
          { id: this.newsStore.selectedNews.id, ...articleToSave },
        ];
        localStorage.setItem('articles', JSON.stringify(updatedArticles));
      } catch (error) {
        console.error('Error modifying article:', error.message);
        alert('Failed to modify article.');
      } finally {
        this.newsStore.setLoading(false);
      }
    },
    async ssml() {
      this.newsStore.setLoading(true);
      try {
        const response = await axios.post('http://localhost:3000/ssml', {
          title: this.newsStore.selectedVariant.modifyTitle,
          text: this.newsStore.selectedVariant.modifyArticle,
        });

        const ssml = {
          modifyTitleSsml: response.data.modifyTitleSsml,
          modifyArticleSsml: response.data.modifyArticleSsml,
        };
        this.newsStore.setSsmlArticle(ssml);

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
      } catch (error) {
        console.error('Error generating SSML:', error.message);
        alert('Failed to generate SSML.');
      } finally {
        this.newsStore.setLoading(false);
      }
    },
    async save() {
      this.newsStore.setLoading(true);
      try {
        const dataToSave = {
          modifyTitle: this.newsStore.selectedVariant?.modifyTitle || '',
          modifyArticle: this.newsStore.selectedVariant?.modifyArticle || '',
          modifyTitleRus: this.newsStore.selectedVariant?.modifyTitleRus || '',
          modifyArticleRus: this.newsStore.selectedVariant?.modifyArticleRus || '',
          modifyTitleSsml: this.newsStore.ssmlArticle?.modifyTitleSsml || '',
          modifyArticleSsml: this.newsStore.ssmlArticle?.modifyArticleSsml || '',
        };

        // Сохраняем в localStorage для резервного хранения
        const savedArticles = JSON.parse(localStorage.getItem('savedArticles') || '[]');
        savedArticles.push({
          id: this.newsStore.selectedNews.id,
          ...dataToSave,
        });
        localStorage.setItem('savedArticles', JSON.stringify(savedArticles));

        // Отправляем запрос на сервер для сохранения файла
        const response = await axios.post('http://localhost:3000/save', dataToSave);

        // Обновляем статус сохранения в сторе
        this.newsStore.saveNews(this.newsStore.selectedNews.id);

        // Уведомляем пользователя об успешном сохранении
        alert(`File saved successfully to ${response.data.filePath}`);
      } catch (error) {
        console.error('Error saving file:', error.message);
        alert('Failed to save file. Please try again.');
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
  font-size: 18px;
  font-weight: bold;
}

.header-center {
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
