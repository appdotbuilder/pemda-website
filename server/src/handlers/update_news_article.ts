import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type UpdateNewsArticleInput, type NewsArticle } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function updateNewsArticle(input: UpdateNewsArticleInput): Promise<NewsArticle | null> {
  try {
    // Destructure the input to separate ID from update fields
    const { id, ...updateFields } = input;

    // Build the update object dynamically, only including provided fields
    const updateData: Partial<typeof newsArticlesTable.$inferInsert> = {};
    
    if (updateFields.title !== undefined) {
      updateData.title = updateFields.title;
    }
    
    if (updateFields.content !== undefined) {
      updateData.content = updateFields.content;
    }
    
    if (updateFields.author !== undefined) {
      updateData.author = updateFields.author;
    }
    
    if (updateFields.published !== undefined) {
      updateData.published = updateFields.published;
    }

    // If no fields to update, return null
    if (Object.keys(updateData).length === 0) {
      return null;
    }

    // Update the article and return the updated record, with updated_at automatically set
    const result = await db.update(newsArticlesTable)
      .set({
        ...updateData,
        updated_at: sql`now()`
      })
      .where(eq(newsArticlesTable.id, id))
      .returning()
      .execute();

    // Return null if no record was found/updated
    if (result.length === 0) {
      return null;
    }

    return result[0];
  } catch (error) {
    console.error('News article update failed:', error);
    throw error;
  }
}