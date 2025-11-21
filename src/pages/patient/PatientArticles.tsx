
import React, { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import { useTitle } from "@/hooks/use-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, BookOpen, Clock, Eye, Heart, Brain, Activity, Plus, Sparkles, X } from "lucide-react";
import { articlesService, Article, ArticleCategory } from "@/services/articlesService";
import { useToast } from "@/hooks/use-toast";

const PatientArticles = () => {
  useTitle("Health Articles - Medical Universe");
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [customTopic, setCustomTopic] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadArticles();
    loadCategories();
  }, [selectedCategory, searchQuery]);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const fetchedArticles = await articlesService.getArticles(
        selectedCategory === "all" ? undefined : selectedCategory,
        searchQuery
      );
      setArticles(fetchedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast({
        title: "Error",
        description: "Failed to load articles. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = () => {
    const cats = articlesService.getCategories();
    setCategories(cats);
  };

  const handleReadArticle = async (article: Article) => {
    await articlesService.incrementViews(article.id);
    setSelectedArticle(article);
    // Update the article views in local state
    setArticles(prev => prev.map(a => 
      a.id === article.id ? { ...a, views: a.views + 1 } : a
    ));
  };

  const handleGenerateCustomArticle = async () => {
    if (!customTopic.trim() || !customCategory) {
      toast({
        title: "Missing information",
        description: "Please enter a topic and select a category.",
        variant: "destructive"
      });
      return;
    }

    setGeneratingArticle(true);
    try {
      const newArticle = await articlesService.generateCustomArticle(customTopic, customCategory);
      setArticles(prev => [newArticle, ...prev]);
      setShowCreateDialog(false);
      setCustomTopic("");
      setCustomCategory("");
      
      toast({
        title: "Article generated!",
        description: "Your custom health article has been created successfully.",
      });
    } catch (error) {
      console.error('Error generating article:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate the article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingArticle(false);
    }
  };

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, JSX.Element> = {
      'cardiology': <Heart className="h-4 w-4" />,
      'mental-health': <Brain className="h-4 w-4" />,
      'fitness': <Activity className="h-4 w-4" />,
      'nutrition': <BookOpen className="h-4 w-4" />,
      'recovery': <Activity className="h-4 w-4" />,
      'pregnancy': <Heart className="h-4 w-4" />
    };
    return icons[categoryId] || <BookOpen className="h-4 w-4" />;
  };

  const featuredArticles = articles.filter(article => article.featured);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar userRole="patient" />
      
      <div className="flex-1 flex">
        <Sidebar userRole="patient" className="hidden lg:block" />
        
        <main className="flex-1 p-6">
          <div className="bg-zinc-200 my-[70px] p-6 rounded-lg">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Health Articles</h1>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <Sparkles className="h-4 w-4" />
                Generate Article
              </Button>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name} ({category.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Featured Articles */}
            {selectedCategory === "all" && featuredArticles.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Featured Articles</h2>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                      <Card key={i} className="overflow-hidden">
                        <Skeleton className="w-full h-48" />
                        <CardHeader>
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-6 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {featuredArticles.slice(0, 2).map((article) => (
                      <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="relative">
                          <img 
                            src={article.image} 
                            alt={article.title}
                            className="w-full h-48 object-cover"
                          />
                          <Badge className="absolute top-3 left-3 bg-orange-500">
                            Featured
                          </Badge>
                        </div>
                        <CardHeader>
                          <div className="flex items-center gap-2 mb-2">
                            {getCategoryIcon(article.category)}
                            <Badge variant="outline">{categories.find(c => c.id === article.category)?.name}</Badge>
                          </div>
                          <CardTitle className="text-lg">{article.title}</CardTitle>
                          <CardDescription>{article.excerpt}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {article.readTime}
                              </div>
                              <div className="flex items-center">
                                <Eye className="h-4 w-4 mr-1" />
                                {article.views}
                              </div>
                            </div>
                            <span>{article.publishDate}</span>
                          </div>
                          <Button 
                            className="w-full" 
                            onClick={() => handleReadArticle(article)}
                          >
                            Read Article
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* All Articles */}
            <div>
              <h2 className="text-xl font-semibold mb-4">
                {selectedCategory === "all" ? "All Articles" : `${categories.find(c => c.id === selectedCategory)?.name || selectedCategory} Articles`}
              </h2>
              
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <Skeleton className="w-full h-40" />
                      <CardHeader className="pb-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {articles.map((article) => (
                    <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                      <div className="relative">
                        <img 
                          src={article.image} 
                          alt={article.title}
                          className="w-full h-40 object-cover"
                        />
                        {article.featured && (
                          <Badge className="absolute top-2 right-2 bg-orange-500">
                            Featured
                          </Badge>
                        )}
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(article.category)}
                          <Badge variant="outline" className="text-xs">
                            {categories.find(c => c.id === article.category)?.name}
                          </Badge>
                        </div>
                        <CardTitle className="text-base line-clamp-2">{article.title}</CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {article.excerpt}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {article.readTime}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {article.views}
                            </div>
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          className="w-full"
                          onClick={() => handleReadArticle(article)}
                        >
                          Read Article
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {articles.length === 0 && !loading && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-4">No articles found matching your criteria.</p>
                <Button onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}>
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Article Reader Dialog */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedArticle && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <DialogTitle className="text-2xl mb-2">{selectedArticle.title}</DialogTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <Badge variant="outline">{categories.find(c => c.id === selectedArticle.category)?.name}</Badge>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {selectedArticle.readTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {selectedArticle.views} views
                      </span>
                      <span>{selectedArticle.publishDate}</span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <div className="mt-4">
                <img 
                  src={selectedArticle.image} 
                  alt={selectedArticle.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
                />
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                  {selectedArticle.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Generate Article Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Generate Custom Article
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Article Topic</label>
              <Input
                placeholder="e.g., Managing anxiety during pregnancy"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleGenerateCustomArticle}
                disabled={generatingArticle || !customTopic.trim() || !customCategory}
                className="flex-1"
              >
                {generatingArticle ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Article
                  </div>
                )}
              </Button>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientArticles;
