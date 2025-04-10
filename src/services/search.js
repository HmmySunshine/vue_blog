import algoliasearch from "algoliasearch";

const ALGOLIA_APP_ID = "Y66RW22AX0";
const ALGOLIA_SEARCH_KEY = "def7570d0b483c891c0c8fb8ccb14376";
const ALGOLIA_INDEX_NAME = "articles";

export const searchService = {
  async searchArticles(query) {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_KEY);
    const index = client.initIndex(ALGOLIA_INDEX_NAME);
    
    try {
      const { hits } = await index.search(query);
      return hits;
    } catch (error) {
      console.error("Algolia search error:", error);
      throw error;
    }
  }
};