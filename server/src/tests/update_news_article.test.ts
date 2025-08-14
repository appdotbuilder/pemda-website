import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type UpdateNewsArticleInput, type CreateNewsArticleInput } from '../schema';
import { updateNewsArticle } from '../handlers/update_news_article';
import { eq } from 'drizzle-orm';

// Helper function to create a test article
const createTestArticle = async (data: Partial<CreateNewsArticleInput> = {}) => {
  const articleData = {
    title: 'Original Title',
    content: 'Original content for testing',
    author: 'Original Author',
    published: false,
    ...data
  };

  const result = await db.insert(newsArticlesTable)
    .values(articleData)
    .returning()
    .execute();

  return result[0];
};

describe('updateNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should update title only', async () => {
    const original = await createTestArticle();
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      title: 'Updated Title'
    };

    const result = await updateNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(original.id);
    expect(result!.title).toEqual('Updated Title');
    expect(result!.content).toEqual('Original content for testing');
    expect(result!.author).toEqual('Original Author');
    expect(result!.published).toEqual(false);
    expect(result!.created_at).toEqual(original.created_at);
    expect(result!.updated_at).not.toEqual(original.updated_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should update content only', async () => {
    const original = await createTestArticle();
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      content: 'Updated content with new information'
    };

    const result = await updateNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.content).toEqual('Updated content with new information');
    expect(result!.title).toEqual('Original Title');
    expect(result!.author).toEqual('Original Author');
    expect(result!.published).toEqual(false);
    expect(result!.updated_at).not.toEqual(original.updated_at);
  });

  it('should update author only', async () => {
    const original = await createTestArticle();
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      author: 'New Author Name'
    };

    const result = await updateNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.author).toEqual('New Author Name');
    expect(result!.title).toEqual('Original Title');
    expect(result!.content).toEqual('Original content for testing');
    expect(result!.published).toEqual(false);
    expect(result!.updated_at).not.toEqual(original.updated_at);
  });

  it('should update published status only', async () => {
    const original = await createTestArticle({ published: false });
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      published: true
    };

    const result = await updateNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.published).toEqual(true);
    expect(result!.title).toEqual('Original Title');
    expect(result!.content).toEqual('Original content for testing');
    expect(result!.author).toEqual('Original Author');
    expect(result!.updated_at).not.toEqual(original.updated_at);
  });

  it('should update multiple fields at once', async () => {
    const original = await createTestArticle();
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      title: 'New Title',
      content: 'New content here',
      author: 'New Author',
      published: true
    };

    const result = await updateNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.id).toEqual(original.id);
    expect(result!.title).toEqual('New Title');
    expect(result!.content).toEqual('New content here');
    expect(result!.author).toEqual('New Author');
    expect(result!.published).toEqual(true);
    expect(result!.created_at).toEqual(original.created_at);
    expect(result!.updated_at).not.toEqual(original.updated_at);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent article ID', async () => {
    const input: UpdateNewsArticleInput = {
      id: 99999, // Non-existent ID
      title: 'Updated Title'
    };

    const result = await updateNewsArticle(input);

    expect(result).toBeNull();
  });

  it('should persist changes in database', async () => {
    const original = await createTestArticle();
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      title: 'Database Test Title',
      published: true
    };

    await updateNewsArticle(input);

    // Verify changes persisted in database
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, original.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toEqual('Database Test Title');
    expect(articles[0].published).toEqual(true);
    expect(articles[0].content).toEqual('Original content for testing');
    expect(articles[0].author).toEqual('Original Author');
    expect(articles[0].updated_at).not.toEqual(original.updated_at);
  });

  it('should handle empty update gracefully', async () => {
    const original = await createTestArticle();
    
    const input: UpdateNewsArticleInput = {
      id: original.id
      // No update fields provided
    };

    const result = await updateNewsArticle(input);

    // Should return null when no fields to update
    expect(result).toBeNull();
  });

  it('should update published status from true to false', async () => {
    const original = await createTestArticle({ published: true });
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      published: false
    };

    const result = await updateNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.published).toEqual(false);
    expect(result!.updated_at).not.toEqual(original.updated_at);
  });

  it('should maintain referential integrity with original timestamps', async () => {
    const original = await createTestArticle();
    const originalCreatedAt = original.created_at;
    
    // Wait a small amount to ensure timestamp difference
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const input: UpdateNewsArticleInput = {
      id: original.id,
      title: 'Timestamp Test'
    };

    const result = await updateNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.created_at).toEqual(originalCreatedAt);
    expect(result!.updated_at.getTime()).toBeGreaterThan(originalCreatedAt.getTime());
  });
});