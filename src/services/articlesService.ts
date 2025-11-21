
const GEMINI_API_KEY = 'AIzaSyB4frRuhdWmCrUfyUojOTYcFJ9HQFqbhTY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  views: number;
  publishDate: string;
  image: string;
  featured: boolean;
  tags: string[];
}

export interface ArticleCategory {
  id: string;
  name: string;
  description: string;
  count: number;
}

class ArticlesService {
  private articles: Article[] = [];
  private categories: ArticleCategory[] = [
    { id: 'cardiology', name: 'Cardiology', description: 'Heart health and cardiovascular care', count: 0 },
    { id: 'mental-health', name: 'Mental Health', description: 'Mental wellness and psychological care', count: 0 },
    { id: 'fitness', name: 'Fitness', description: 'Exercise and physical wellness', count: 0 },
    { id: 'nutrition', name: 'Nutrition', description: 'Diet and nutritional guidance', count: 0 },
    { id: 'recovery', name: 'Recovery', description: 'Post-surgery and recovery tips', count: 0 },
    { id: 'pregnancy', name: 'Pregnancy', description: 'Pregnancy and maternal health', count: 0 }
  ];

  async generateArticleWithAI(topic: string, category: string): Promise<Article> {
    try {
      const prompt = `Write a comprehensive health article about "${topic}" in the ${category} category. 
      
      The article should be:
      - Medically accurate and informative
      - Written for general audience
      - Include practical tips and advice
      - Be engaging and easy to understand
      - Around 800-1000 words
      
      Format your response as JSON with these fields:
      {
        "title": "Article title",
        "excerpt": "Brief summary (2-3 sentences)",
        "content": "Full article content in HTML format with proper headings and paragraphs",
        "readTime": "X min read",
        "tags": ["tag1", "tag2", "tag3"]
      }`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      const data = await response.json();
      const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiContent) {
        throw new Error('Failed to generate article content');
      }

      // Parse AI response (clean up JSON if needed)
      let parsedContent;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedContent = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch {
        // Fallback if JSON parsing fails
        parsedContent = {
          title: topic,
          excerpt: `Learn about ${topic} and how it relates to your health and wellness.`,
          content: aiContent,
          readTime: '5 min read',
          tags: [category, 'health', 'wellness']
        };
      }

      const article: Article = {
        id: Date.now().toString(),
        title: parsedContent.title || topic,
        excerpt: parsedContent.excerpt || `Learn about ${topic} and improve your health.`,
        content: parsedContent.content || aiContent,
        category: category,
        readTime: parsedContent.readTime || '5 min read',
        views: Math.floor(Math.random() * 1000) + 100,
        publishDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        image: this.getRandomImage(category),
        featured: Math.random() > 0.7,
        tags: parsedContent.tags || [category, 'health']
      };

      return article;
    } catch (error) {
      console.error('Error generating article:', error);
      throw new Error('Failed to generate article');
    }
  }

  private getRandomImage(category: string): string {
    const images = {
      cardiology: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      'mental-health': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      fitness: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      nutrition: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      recovery: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
      pregnancy: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    };
    return images[category as keyof typeof images] || images.cardiology;
  }

  async initializeArticles(): Promise<void> {
    if (this.articles.length > 0) return;

    const defaultTopics = [
      { topic: '10 Heart-Healthy Foods to Include in Your Diet', category: 'cardiology' },
      { topic: 'Understanding Mental Health: Breaking the Stigma', category: 'mental-health' },
      { topic: 'The Benefits of Regular Exercise on Your Health', category: 'fitness' },
      { topic: 'Diabetes Management: Tips for Daily Living', category: 'nutrition' },
      { topic: 'Post-Surgery Recovery: What to Expect', category: 'recovery' },
      { topic: 'Prenatal Care: Essential Tips for Expectant Mothers', category: 'pregnancy' }
    ];

    try {
      for (const { topic, category } of defaultTopics) {
        const article = await this.generateArticleWithAI(topic, category);
        this.articles.push(article);
      }
      this.updateCategoryCounts();
    } catch (error) {
      console.error('Failed to initialize articles:', error);
      // Fallback to basic articles if AI fails
      this.createFallbackArticles();
    }
  }

  private createFallbackArticles(): void {
    const fallbackArticles: Article[] = [
      {
        id: '1',
        title: '10 Heart-Healthy Foods to Include in Your Diet',
        excerpt: 'Discover the best foods for cardiovascular health and learn how to incorporate them into your daily meals.',
        content: '<h2>Heart-Healthy Foods</h2><p>Maintaining a healthy heart starts with what you eat...</p>',
        category: 'cardiology',
        readTime: '5 min read',
        views: 1250,
        publishDate: new Date().toLocaleDateString(),
        image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
        featured: true,
        tags: ['heart', 'nutrition', 'diet']
      }
    ];
    this.articles = fallbackArticles;
  }

  private updateCategoryCounts(): void {
    this.categories.forEach(category => {
      category.count = this.articles.filter(article => article.category === category.id).length;
    });
  }

  async getArticles(category?: string, searchQuery?: string): Promise<Article[]> {
    await this.initializeArticles();
    
    let filtered = [...this.articles];

    if (category && category !== 'all') {
      filtered = filtered.filter(article => article.category === category);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => {
      // Featured articles first
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      // Then by views
      return b.views - a.views;
    });
  }

  async getArticleById(id: string): Promise<Article | null> {
    await this.initializeArticles();
    return this.articles.find(article => article.id === id) || null;
  }

  getCategories(): ArticleCategory[] {
    return this.categories;
  }

  async generateCustomArticle(topic: string, category: string): Promise<Article> {
    const article = await this.generateArticleWithAI(topic, category);
    this.articles.unshift(article); // Add to beginning of array
    this.updateCategoryCounts();
    return article;
  }

  async incrementViews(articleId: string): Promise<void> {
    const article = this.articles.find(a => a.id === articleId);
    if (article) {
      article.views += 1;
    }
  }
}

export const articlesService = new ArticlesService();
