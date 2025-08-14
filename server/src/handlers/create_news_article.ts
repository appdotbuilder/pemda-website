import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type CreateNewsArticleInput, type NewsArticle } from '../schema';

export const createNewsArticle = async (input: CreateNewsArticleInput): Promise<NewsArticle> => {
  try {
    // Insert news article record
    const result = await db.insert(newsArticlesTable)
      .values({
        title: input.title,
        content: input.content,
        author: input.author,
        published: input.published
        // created_at and updated_at are set automatically by the database
      })
      .returning()
      .execute();

    const newsArticle = result[0];
    return newsArticle;
  } catch (error) {
    console.error('News article creation failed:', error);
    throw error;
  }
};