import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, CreateNewsArticleInput, UpdateNewsArticleInput } from '../../server/src/schema';

function App() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState<NewsArticle | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating articles
  const [createFormData, setCreateFormData] = useState<CreateNewsArticleInput>({
    title: '',
    content: '',
    author: '',
    published: false
  });

  // Form state for editing articles
  const [editFormData, setEditFormData] = useState<Partial<UpdateNewsArticleInput>>({
    title: '',
    content: '',
    author: '',
    published: false
  });

  const loadArticles = useCallback(async () => {
    try {
      const result = await trpc.getNewsArticles.query();
      setArticles(result);
    } catch (error) {
      console.error('Failed to load articles:', error);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await trpc.createNewsArticle.mutate(createFormData);
      setArticles((prev: NewsArticle[]) => [response, ...prev]);
      setCreateFormData({
        title: '',
        content: '',
        author: '',
        published: false
      });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArticle) return;
    
    setIsLoading(true);
    try {
      const updateData: UpdateNewsArticleInput = {
        id: editingArticle.id,
        ...editFormData
      };
      const response = await trpc.updateNewsArticle.mutate(updateData);
      if (response) {
        setArticles((prev: NewsArticle[]) =>
          prev.map((article: NewsArticle) => 
            article.id === response.id ? response : article
          )
        );
        setIsEditDialogOpen(false);
        setEditingArticle(null);
      }
    } catch (error) {
      console.error('Failed to update article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const success = await trpc.deleteNewsArticle.mutate({ id });
      if (success) {
        setArticles((prev: NewsArticle[]) =>
          prev.filter((article: NewsArticle) => article.id !== id)
        );
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (article: NewsArticle) => {
    setEditingArticle(article);
    setEditFormData({
      title: article.title,
      content: article.content,
      author: article.author,
      published: article.published
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📰 News Management</h1>
            <p className="text-gray-600">Create, manage, and publish your news articles</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white mt-4 md:mt-0">
                ✨ Create New Article
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Article</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="create-title">Title</Label>
                  <Input
                    id="create-title"
                    value={createFormData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateNewsArticleInput) => ({ 
                        ...prev, 
                        title: e.target.value 
                      }))
                    }
                    placeholder="Enter article title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-author">Author</Label>
                  <Input
                    id="create-author"
                    value={createFormData.author}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setCreateFormData((prev: CreateNewsArticleInput) => ({ 
                        ...prev, 
                        author: e.target.value 
                      }))
                    }
                    placeholder="Enter author name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="create-content">Content</Label>
                  <Textarea
                    id="create-content"
                    value={createFormData.content}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setCreateFormData((prev: CreateNewsArticleInput) => ({ 
                        ...prev, 
                        content: e.target.value 
                      }))
                    }
                    placeholder="Write your article content here..."
                    rows={8}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="create-published"
                    checked={createFormData.published}
                    onCheckedChange={(checked: boolean) =>
                      setCreateFormData((prev: CreateNewsArticleInput) => ({ 
                        ...prev, 
                        published: checked 
                      }))
                    }
                  />
                  <Label htmlFor="create-published">Publish immediately</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? '⏳ Creating...' : '📝 Create Article'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Articles Grid */}
        {articles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No articles yet</h3>
              <p className="text-gray-500">Create your first news article to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article: NewsArticle) => (
              <Card key={article.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant={article.published ? "default" : "secondary"}>
                      {article.published ? "📢 Published" : "📝 Draft"}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
                  <p className="text-sm text-gray-600">
                    By {article.author} • {article.created_at.toLocaleDateString()}
                  </p>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-700 text-sm line-clamp-3">
                    {article.content.length > 150 
                      ? `${article.content.substring(0, 150)}...` 
                      : article.content
                    }
                  </p>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditDialog(article)}
                    disabled={isLoading}
                  >
                    ✏️ Edit
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" disabled={isLoading}>
                        🗑️ Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Article</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{article.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleDelete(article.id)}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Article</DialogTitle>
            </DialogHeader>
            {editingArticle && (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editFormData.title || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Enter article title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    value={editFormData.author || ''}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditFormData((prev) => ({ ...prev, author: e.target.value }))
                    }
                    placeholder="Enter author name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-content">Content</Label>
                  <Textarea
                    id="edit-content"
                    value={editFormData.content || ''}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setEditFormData((prev) => ({ ...prev, content: e.target.value }))
                    }
                    placeholder="Write your article content here..."
                    rows={8}
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-published"
                    checked={editFormData.published || false}
                    onCheckedChange={(checked: boolean) =>
                      setEditFormData((prev) => ({ ...prev, published: checked }))
                    }
                  />
                  <Label htmlFor="edit-published">Published</Label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false);
                      setEditingArticle(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? '⏳ Updating...' : '💾 Update Article'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default App;