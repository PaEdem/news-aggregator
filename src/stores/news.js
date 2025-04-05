// src/stores/news.js
import { defineStore } from 'pinia';

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [],
    selectedNews: null,
    modifiedArticle: null, // Теперь будет { variants: [{ modifyTitle, modifyArticle, modifyTitleRus, modifyArticleRus }, ...] }
    selectedVariant: null, // Храним выбранный вариант
    ssmlArticle: null,
    isLoading: false,
    articleCount: 1,
    isViewArticle: false,
  }),
  actions: {
    selectNews(news) {
      this.selectedNews = {
        ...news,
        translatedArticle: news.translatedArticle || 'Перевод недоступен',
      };
      this.modifiedArticle = null;
      this.ssmlArticle = null;
      this.selectedVariant = null;
    },
    saveNews(id) {
      const news = this.newsList.find((item) => item.id === id);
      if (news) {
        news.isSaved = true;
      }
    },
    setNewsList(news) {
      this.newsList = news;
    },
    setModifiedArticle(modified) {
      this.modifiedArticle = modified;
    },
    setSelectedVariant(variant) {
      this.selectedVariant = variant;
    },
    setSsmlArticle(ssml) {
      this.ssmlArticle = ssml;
    },
    setLoading(loading) {
      this.isLoading = loading;
    },
    setArticleCount(count) {
      this.articleCount = count;
    },
    setViewArticle(view) {
      this.isViewArticle = view;
    },
  },
});
