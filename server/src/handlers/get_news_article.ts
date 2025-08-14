import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type GetNewsArticleInput, type NewsArticle } from '../schema';

export const getNewsArticle = async (input: GetNewsArticleInput): Promise<NewsArticle | null> => {
  try {
    // Query for the news article by ID
    const results = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, input.id))
      .execute();

    // Return null if no article found
    if (results.length === 0) {
      return null;
    }

    // Return the found article
    const article = results[0];
    return {
      ...article
    };
  } catch (error) {
    console.error('Failed to get news article:', error);
    throw error;
  }
};