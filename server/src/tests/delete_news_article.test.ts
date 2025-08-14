import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type DeleteNewsArticleInput } from '../schema';
import { deleteNewsArticle } from '../handlers/delete_news_article';
import { eq } from 'drizzle-orm';

// Test input
const testDeleteInput: DeleteNewsArticleInput = {
  id: 1
};

describe('deleteNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should delete an existing news article and return true', async () => {
    // Create a test news article first
    const insertResult = await db.insert(newsArticlesTable)
      .values({
        title: 'Test Article',
        content: 'Test content for deletion',
        author: 'Test Author',
        published: false
      })
      .returning()
      .execute();

    const articleId = insertResult[0].id;

    // Delete the article
    const result = await deleteNewsArticle({ id: articleId });

    // Should return true indicating successful deletion
    expect(result).toBe(true);

    // Verify the article no longer exists in the database
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, articleId))
      .execute();

    expect(articles).toHaveLength(0);
  });

  it('should return false when trying to delete non-existent article', async () => {
    // Try to delete an article that doesn't exist
    const result = await deleteNewsArticle({ id: 9999 });

    // Should return false indicating no article was deleted
    expect(result).toBe(false);
  });

  it('should not affect other articles when deleting one article', async () => {
    // Create multiple test articles
    const insertResults = await db.insert(newsArticlesTable)
      .values([
        {
          title: 'Article 1',
          content: 'Content 1',
          author: 'Author 1',
          published: true
        },
        {
          title: 'Article 2',
          content: 'Content 2',
          author: 'Author 2',
          published: false
        },
        {
          title: 'Article 3',
          content: 'Content 3',
          author: 'Author 3',
          published: true
        }
      ])
      .returning()
      .execute();

    // Delete the middle article
    const articleToDelete = insertResults[1].id;
    const result = await deleteNewsArticle({ id: articleToDelete });

    expect(result).toBe(true);

    // Verify only the specified article was deleted
    const remainingArticles = await db.select()
      .from(newsArticlesTable)
      .execute();

    expect(remainingArticles).toHaveLength(2);
    
    // Verify the correct articles remain
    const remainingIds = remainingArticles.map(article => article.id).sort();
    const expectedIds = [insertResults[0].id, insertResults[2].id].sort();
    expect(remainingIds).toEqual(expectedIds);

    // Verify deleted article is gone
    const deletedArticle = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, articleToDelete))
      .execute();

    expect(deletedArticle).toHaveLength(0);
  });

  it('should handle deletion of published and unpublished articles', async () => {
    // Create both published and unpublished articles
    const insertResults = await db.insert(newsArticlesTable)
      .values([
        {
          title: 'Published Article',
          content: 'Published content',
          author: 'Publisher',
          published: true
        },
        {
          title: 'Draft Article',
          content: 'Draft content',
          author: 'Author',
          published: false
        }
      ])
      .returning()
      .execute();

    // Delete the published article
    const publishedResult = await deleteNewsArticle({ id: insertResults[0].id });
    expect(publishedResult).toBe(true);

    // Delete the draft article
    const draftResult = await deleteNewsArticle({ id: insertResults[1].id });
    expect(draftResult).toBe(true);

    // Verify both articles are deleted
    const remainingArticles = await db.select()
      .from(newsArticlesTable)
      .execute();

    expect(remainingArticles).toHaveLength(0);
  });
});