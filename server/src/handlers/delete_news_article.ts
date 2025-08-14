import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type DeleteNewsArticleInput } from '../schema';
import { eq } from 'drizzle-orm';

export async function deleteNewsArticle(input: DeleteNewsArticleInput): Promise<boolean> {
  try {
    // Delete the news article by ID
    const result = await db.delete(newsArticlesTable)
      .where(eq(newsArticlesTable.id, input.id))
      .execute();

    // Check if any rows were affected (deleted)
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error('News article deletion failed:', error);
    throw error;
  }
}