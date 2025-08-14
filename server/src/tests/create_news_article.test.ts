import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { type CreateNewsArticleInput } from '../schema';
import { createNewsArticle } from '../handlers/create_news_article';
import { eq } from 'drizzle-orm';

// Complete test input with all required fields
const testInput: CreateNewsArticleInput = {
  title: 'Breaking News: Test Article',
  content: 'This is the content of our test news article. It contains important information about testing.',
  author: 'Test Reporter',
  published: true
};

// Test input with default published value
const unpublishedTestInput: CreateNewsArticleInput = {
  title: 'Draft Article',
  content: 'This is a draft article that is not yet published.',
  author: 'Draft Author',
  published: false
};

describe('createNewsArticle', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a published news article', async () => {
    const result = await createNewsArticle(testInput);

    // Basic field validation
    expect(result.title).toEqual('Breaking News: Test Article');
    expect(result.content).toEqual(testInput.content);
    expect(result.author).toEqual('Test Reporter');
    expect(result.published).toEqual(true);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create an unpublished news article', async () => {
    const result = await createNewsArticle(unpublishedTestInput);

    expect(result.title).toEqual('Draft Article');
    expect(result.content).toEqual(unpublishedTestInput.content);
    expect(result.author).toEqual('Draft Author');
    expect(result.published).toEqual(false);
    expect(result.id).toBeDefined();
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save news article to database', async () => {
    const result = await createNewsArticle(testInput);

    // Query using proper drizzle syntax
    const articles = await db.select()
      .from(newsArticlesTable)
      .where(eq(newsArticlesTable.id, result.id))
      .execute();

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toEqual('Breaking News: Test Article');
    expect(articles[0].content).toEqual(testInput.content);
    expect(articles[0].author).toEqual('Test Reporter');
    expect(articles[0].published).toEqual(true);
    expect(articles[0].created_at).toBeInstanceOf(Date);
    expect(articles[0].updated_at).toBeInstanceOf(Date);
  });

  it('should set timestamps automatically', async () => {
    const beforeCreation = new Date();
    const result = await createNewsArticle(testInput);
    const afterCreation = new Date();

    // Check that timestamps are set within reasonable bounds
    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.updated_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());
    expect(result.updated_at.getTime()).toBeGreaterThanOrEqual(beforeCreation.getTime());
    expect(result.updated_at.getTime()).toBeLessThanOrEqual(afterCreation.getTime());

    // Initially, created_at and updated_at should be the same
    expect(result.created_at.getTime()).toEqual(result.updated_at.getTime());
  });

  it('should handle published default value correctly', async () => {
    // Test input with explicit false value (testing the default behavior)
    const inputWithDefault: CreateNewsArticleInput = {
      title: 'Default Published Article',
      content: 'This article should use the default published value.',
      author: 'Default Author',
      published: false // Explicitly set to false (same as Zod default)
    };

    const result = await createNewsArticle(inputWithDefault);

    expect(result.published).toEqual(false);
    expect(result.title).toEqual('Default Published Article');
    expect(result.content).toEqual(inputWithDefault.content);
    expect(result.author).toEqual('Default Author');
  });

  it('should create multiple articles with unique IDs', async () => {
    const firstArticle = await createNewsArticle({
      title: 'First Article',
      content: 'Content of first article',
      author: 'Author One',
      published: true
    });

    const secondArticle = await createNewsArticle({
      title: 'Second Article',
      content: 'Content of second article',
      author: 'Author Two',
      published: false
    });

    expect(firstArticle.id).toBeDefined();
    expect(secondArticle.id).toBeDefined();
    expect(firstArticle.id).not.toEqual(secondArticle.id);

    // Verify both articles exist in database
    const allArticles = await db.select()
      .from(newsArticlesTable)
      .execute();

    expect(allArticles).toHaveLength(2);
    expect(allArticles.some(article => article.title === 'First Article')).toBe(true);
    expect(allArticles.some(article => article.title === 'Second Article')).toBe(true);
  });
});