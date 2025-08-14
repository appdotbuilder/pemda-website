import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type NewsArticle } from '../schema';
import { desc } from 'drizzle-orm';

export const getNewsArticles = async (): Promise<NewsArticle[]> => {
  try {
    // Fetch all news articles ordered by creation date (newest first)
    const results = await db.select()
      .from(newsArticlesTable)
      .orderBy(desc(newsArticlesTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch news articles:', error);
    throw error;
  }
};