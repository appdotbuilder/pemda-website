import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type GetNewsArticleInput } from '../schema';
import { getNewsArticle } from '../handlers/get_news_article';
import { eq } from 'drizzle-orm';

describe('getNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a news article when it exists', async () => {
    // Create a test news article
    const testArticle = {
      title: 'Test Article',
      content: 'This is test content for the article.',
      author: 'Test Author',
      published: true
    };

    const insertResult = await db.insert(newsArticlesTable)
      .values(testArticle)
      .returning()
      .execute();

    const createdArticle = insertResult[0];

    // Test input
    const input: GetNewsArticleInput = {
      id: createdArticle.id
    };

    // Get the article
    const result = await getNewsArticle(input);

    // Verify the result
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdArticle.id);
    expect(result!.title).toEqual('Test Article');
    expect(result!.content).toEqual('This is test content for the article.');
    expect(result!.author).toEqual('Test Author');
    expect(result!.published).toEqual(true);
    expect(result!.created_at).toBeInstanceOf(Date);
    expect(result!.updated_at).toBeInstanceOf(Date);
  });

  it('should return null when article does not exist', async () => {
    // Test with non-existent ID
    const input: GetNewsArticleInput = {
      id: 99999
    };

    const result = await getNewsArticle(input);

    expect(result).toBeNull();
  });

  it('should return the correct article when multiple articles exist', async () => {
    // Create multiple test articles
    const articles = [
      {
        title: 'First Article',
        content: 'Content of first article',
        author: 'Author One',
        published: false
      },
      {
        title: 'Second Article',
        content: 'Content of second article',
        author: 'Author Two',
        published: true
      },
      {
        title: 'Third Article',
        content: 'Content of third article',
        author: 'Author Three',
        published: false
      }
    ];

    // Insert all articles
    const insertResults = await db.insert(newsArticlesTable)
      .values(articles)
      .returning()
      .execute();

    // Get the second article
    const targetArticle = insertResults[1];
    const input: GetNewsArticleInput = {
      id: targetArticle.id
    };

    const result = await getNewsArticle(input);

    // Verify we get the correct article
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(targetArticle.id);
    expect(result!.title).toEqual('Second Article');
    expect(result!.content).toEqual('Content of second article');
    expect(result!.author).toEqual('Author Two');
    expect(result!.published).toEqual(true);
  });

  it('should handle articles with different published states', async () => {
    // Create an unpublished article
    const unpublishedArticle = {
      title: 'Draft Article',
      content: 'This article is not published yet.',
      author: 'Draft Author',
      published: false
    };

    const insertResult = await db.insert(newsArticlesTable)
      .values(unpublishedArticle)
      .returning()
      .execute();

    const createdArticle = insertResult[0];

    const input: GetNewsArticleInput = {
      id: createdArticle.id
    };

    const result = await getNewsArticle(input);

    expect(result).not.toBeNull();
    expect(result!.published).toEqual(false);
    expect(result!.title).toEqual('Draft Article');
  });

  it('should verify article is saved correctly in database', async () => {
    // Create and retrieve an article
    const testArticle = {
      title: 'Database Test Article',
      content: 'Testing database persistence.',
      author: 'DB Test Author',
      published: true
    };

    const insertResult = await db.insert(newsArticlesTable)
      .values(testArticle)
      .returning()
      .execute();

    const createdArticle = insertResult[0];

    // Use handler to get the article
    const handlerResult = await getNewsArticle({ id: createdArticle.id });

    // Direct database query to verify
    const dbResult = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, createdArticle.id))
      .execute();

    // Both should return the same data
    expect(handlerResult).not.toBeNull();
    expect(dbResult).toHaveLength(1);
    expect(handlerResult!.id).toEqual(dbResult[0].id);
    expect(handlerResult!.title).toEqual(dbResult[0].title);
    expect(handlerResult!.content).toEqual(dbResult[0].content);
    expect(handlerResult!.author).toEqual(dbResult[0].author);
    expect(handlerResult!.published).toEqual(dbResult[0].published);
  });
});