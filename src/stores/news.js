// src/stores/news.js
import { defineStore } from 'pinia';

export const useNewsStore = defineStore('news', {
  state: () => ({
    newsList: [],
    selectedNews: null,
    modifiedArticle: null,
    ssmlArticle: null,
    isLoading: false,
    articleCount: 1,
    isViewArticle: false,
  }),
  actions: {
    selectNews(news) {
      this.selectedNews = news;
      this.modifiedArticle = null;
      this.ssmlArticle = null;
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
