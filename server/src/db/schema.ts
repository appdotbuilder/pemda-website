import { serial, text, pgTable, timestamp, boolean } from 'drizzle-orm/pg-core';

export const newsArticlesTable = pgTable('news_articles', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  author: text('author').notNull(),
  published: boolean('published').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type NewsArticle = typeof newsArticlesTable.$inferSelect; // For SELECT operations
export type NewNewsArticle = typeof newsArticlesTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { newsArticles: newsArticlesTable };