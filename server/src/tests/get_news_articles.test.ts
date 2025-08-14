import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { newsArticlesTable } from '../db/schema';
import { getNewsArticles } from '../handlers/get_news_articles';
import { type CreateNewsArticleInput } from '../schema';

// Test data for creating news articles
const testArticle1: CreateNewsArticleInput = {
  title: 'First News Article',
  content: 'This is the content of the first news article.',
  author: 'John Doe',
  published: true
};

const testArticle2: CreateNewsArticleInput = {
  title: 'Second News Article',
  content: 'This is the content of the second news article.',
  author: 'Jane Smith',
  published: false
};

const testArticle3: CreateNewsArticleInput = {
  title: 'Third News Article',
  content: 'This is the content of the third news article.',
  author: 'Bob Johnson',
  published: true
};

describe('getNewsArticles', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return an empty array when no articles exist', async () => {
    const result = await getNewsArticles();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all news articles', async () => {
    // Create test articles
    await db.insert(newsArticlesTable)
      .values([testArticle1, testArticle2, testArticle3])
      .execute();

    const result = await getNewsArticles();

    expect(result).toHaveLength(3);
    
    // Verify all articles are returned
    const titles = result.map(article => article.title);
    expect(titles).toContain('First News Article');
    expect(titles).toContain('Second News Article');
    expect(titles).toContain('Third News Article');
  });

  it('should return articles ordered by creation date (newest first)', async () => {
    // Insert articles with slight delay to ensure different timestamps
    await db.insert(newsArticlesTable)
      .values(testArticle1)
      .execute();
    
    // Add small delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(newsArticlesTable)
      .values(testArticle2)
      .execute();
    
    // Add small delay
    await new Promise(resolve => setTimeout(resolve, 10));
    
    await db.insert(newsArticlesTable)
      .values(testArticle3)
      .execute();

    const result = await getNewsArticles();

    expect(result).toHaveLength(3);
    
    // Verify ordering (newest first)
    expect(result[0].title).toEqual('Third News Article');
    expect(result[1].title).toEqual('Second News Article');
    expect(result[2].title).toEqual('First News Article');
    
    // Verify timestamps are in descending order
    expect(result[0].created_at >= result[1].created_at).toBe(true);
    expect(result[1].created_at >= result[2].created_at).toBe(true);
  });

  it('should return articles with all required fields', async () => {
    await db.insert(newsArticlesTable)
      .values(testArticle1)
      .execute();

    const result = await getNewsArticles();

    expect(result).toHaveLength(1);
    
    const article = result[0];
    expect(article.id).toBeDefined();
    expect(typeof article.id).toBe('number');
    expect(article.title).toEqual('First News Article');
    expect(article.content).toEqual('This is the content of the first news article.');
    expect(article.author).toEqual('John Doe');
    expect(article.published).toBe(true);
    expect(article.created_at).toBeInstanceOf(Date);
    expect(article.updated_at).toBeInstanceOf(Date);
  });

  it('should return both published and unpublished articles', async () => {
    await db.insert(newsArticlesTable)
      .values([testArticle1, testArticle2]) // One published, one unpublished
      .execute();

    const result = await getNewsArticles();

    expect(result).toHaveLength(2);
    
    // Find published and unpublished articles
    const publishedArticle = result.find(article => article.published);
    const unpublishedArticle = result.find(article => !article.published);
    
    expect(publishedArticle).toBeDefined();
    expect(unpublishedArticle).toBeDefined();
    expect(publishedArticle?.title).toEqual('First News Article');
    expect(unpublishedArticle?.title).toEqual('Second News Article');
  });

  it('should handle articles with default published value', async () => {
    // Create article without specifying published field (should default to false)
    const articleWithDefaults = {
      title: 'Article with Defaults',
      content: 'Content with default values.',
      author: 'Default Author'
      // published field omitted to test default behavior
    };

    await db.insert(newsArticlesTable)
      .values(articleWithDefaults)
      .execute();

    const result = await getNewsArticles();

    expect(result).toHaveLength(1);
    expect(result[0].published).toBe(false); // Should use default value
    expect(result[0].title).toEqual('Article with Defaults');
  });
});