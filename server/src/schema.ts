import { z } from 'zod';

// News article schema
export const newsArticleSchema = z.object({
  id: z.number(),
  title: z.string(),
  content: z.string(),
  author: z.string(),
  published: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type NewsArticle = z.infer<typeof newsArticleSchema>;

// Input schema for creating news articles
export const createNewsArticleInputSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  published: z.boolean().default(false)
});

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleInputSchema>;

// Input schema for updating news articles
export const updateNewsArticleInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1, "Title is required").optional(),
  content: z.string().min(1, "Content is required").optional(),
  author: z.string().min(1, "Author is required").optional(),
  published: z.boolean().optional()
});

export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleInputSchema>;

// Schema for getting a single news article by ID
export const getNewsArticleInputSchema = z.object({
  id: z.number()
});

export type GetNewsArticleInput = z.infer<typeof getNewsArticleInputSchema>;

// Schema for deleting a news article
export const deleteNewsArticleInputSchema = z.object({
  id: z.number()
});

export type DeleteNewsArticleInput = z.infer<typeof deleteNewsArticleInputSchema>;