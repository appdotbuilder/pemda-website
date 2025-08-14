import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';

// Import schema types
import { 
  createNewsArticleInputSchema, 
  updateNewsArticleInputSchema,
  getNewsArticleInputSchema,
  deleteNewsArticleInputSchema
} from './schema';

// Import handlers
import { createNewsArticle } from './handlers/create_news_article';
import { getNewsArticles } from './handlers/get_news_articles';
import { getNewsArticle } from './handlers/get_news_article';
import { updateNewsArticle } from './handlers/update_news_article';
import { deleteNewsArticle } from './handlers/delete_news_article';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Create a new news article
  createNewsArticle: publicProcedure
    .input(createNewsArticleInputSchema)
    .mutation(({ input }) => createNewsArticle(input)),
  
  // Get all news articles
  getNewsArticles: publicProcedure
    .query(() => getNewsArticles()),
  
  // Get a single news article by ID
  getNewsArticle: publicProcedure
    .input(getNewsArticleInputSchema)
    .query(({ input }) => getNewsArticle(input)),
  
  // Update an existing news article
  updateNewsArticle: publicProcedure
    .input(updateNewsArticleInputSchema)
    .mutation(({ input }) => updateNewsArticle(input)),
  
  // Delete a news article by ID
  deleteNewsArticle: publicProcedure
    .input(deleteNewsArticleInputSchema)
    .mutation(({ input }) => deleteNewsArticle(input)),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();