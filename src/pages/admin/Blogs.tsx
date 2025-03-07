
import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Image,
  FileText,
  Eye,
  Tag,
  Save,
  Link2,
  MessageSquare,
  ChevronDown,
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author_id: string;
  category: string;
  tags: string[];
  featured_image: string | null;
  is_published: boolean;
  is_featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  read_time: number | null;
  view_count: number;
  metadata: Record<string, any> | null;
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface Author {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

const CATEGORIES = [
  { id: 'fitness', name: 'Fitness Guides' },
  { id: 'nutrition', name: 'Nutrition Tips' },
  { id: 'equipment', name: 'Equipment Reviews' },
  { id: 'motivation', name: 'Motivation' },
  { id: 'workout', name: 'Workout Routines' },
  { id: 'science', name: 'Fitness Science' },
  { id: 'success-stories', name: 'Success Stories' },
];

export default function Blogs() {
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [blogPost, setBlogPost] = useState<Partial<BlogPost>>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category: 'workout',
    tags: [],
    is_published: false,
    is_featured: false,
    seo_title: '',
    seo_description: '',
    read_time: 5,
    metadata: {
      references: [],
      related_posts: []
    }
  });
  
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [tagsInput, setTagsInput] = useState('');
  
  // Get all blog posts
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as BlogPost[];
    }
  });
  
  // Get all authors (profiles)
  const { data: authors } = useQuery({
    queryKey: ['blog_authors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url');
      
      if (error) throw error;
      return data as Author[];
    }
  });
  
  // Add blog post mutation
  const addPostMutation = useMutation({
    mutationFn: async (post: Partial<BlogPost>) => {
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }
      
      // Generate slug if not provided
      let slug = post.slug;
      if (!slug && post.title) {
        slug = post.title
          .toLowerCase()
          .replace(/[^\w\s]/gi, '')
          .replace(/\s+/g, '-');
      }
      
      // Calculate read time based on content length if not provided
      let readTime = post.read_time;
      if (!readTime && post.content) {
        const words = post.content.trim().split(/\s+/).length;
        readTime = Math.max(1, Math.ceil(words / 200)); // Avg reading speed: 200 words per minute
      }
      
      // Insert post with image URL if uploaded
      const { data, error } = await supabase
        .from('blog_posts')
        .insert([{
          ...post,
          slug,
          read_time: readTime,
          view_count: 0,
          featured_image: imageUrl || null,
          ...(post.is_published ? { published_at: new Date().toISOString() } : {})
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Blog post created",
        description: "Your blog post has been created successfully",
      });
      setShowAddDialog(false);
      resetBlogForm();
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error creating blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Update blog post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (post: BlogPost) => {
      let imageUrl = post.featured_image || '';
      
      // Upload image if provided
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }
      
      // Update post
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          ...post,
          featured_image: imageUrl,
          updated_at: new Date().toISOString(),
          ...(post.is_published && !post.published_at ? { published_at: new Date().toISOString() } : {})
        })
        .eq('id', post.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Blog post updated",
        description: "Your changes have been saved successfully",
      });
      setShowEditDialog(false);
      resetBlogForm();
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Delete blog post mutation
  const deletePostMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Blog post deleted",
        description: "The blog post has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting blog post",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string, featured: boolean }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ is_featured: featured })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data.is_featured ? "Post featured" : "Post unfeatured",
        description: `"${data.title}" is ${data.is_featured ? 'now' : 'no longer'} featured`,
      });
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating featured status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Toggle published status mutation
  const togglePublishedMutation = useMutation({
    mutationFn: async ({ id, published, currentPublishDate }: { id: string, published: boolean, currentPublishDate: string | null }) => {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({ 
          is_published: published,
          published_at: published && !currentPublishDate ? new Date().toISOString() : currentPublishDate
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data.is_published ? "Post published" : "Post unpublished",
        description: `"${data.title}" is ${data.is_published ? 'now live' : 'now a draft'}`,
      });
      queryClient.invalidateQueries({ queryKey: ['blog_posts'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating published status",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Filter posts based on search term, category, and status
  const filteredPosts = posts?.filter(post => {
    const matchesSearch = 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || post.category === categoryFilter;
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'published' && post.is_published) || 
      (statusFilter === 'draft' && !post.is_published) ||
      (statusFilter === 'featured' && post.is_featured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const handleAddPost = () => {
    addPostMutation.mutate({
      ...blogPost,
      tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag),
      author_id: supabase.auth.getUser()?.data.user?.id || ''
    });
  };
  
  const handleUpdatePost = () => {
    if (editingPost) {
      updatePostMutation.mutate({
        ...editingPost,
        tags: tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag),
      });
    }
  };
  
  const handleDeletePost = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      deletePostMutation.mutate(id);
    }
  };
  
  const handleToggleFeatured = (id: string, currentStatus: boolean) => {
    toggleFeaturedMutation.mutate({ id, featured: !currentStatus });
  };
  
  const handleTogglePublished = (id: string, currentStatus: boolean, currentPublishDate: string | null) => {
    togglePublishedMutation.mutate({ id, published: !currentStatus, currentPublishDate });
  };
  
  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setTagsInput(post.tags.join(', '));
    setImagePreview(post.featured_image);
    setShowEditDialog(true);
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const resetBlogForm = () => {
    setBlogPost({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      category: 'workout',
      tags: [],
      is_published: false,
      is_featured: false,
      seo_title: '',
      seo_description: '',
      read_time: 5,
      metadata: {
        references: [],
        related_posts: []
      }
    });
    setTagsInput('');
    setImageFile(null);
    setImagePreview(null);
    setEditingPost(null);
    setPreviewMode(false);
  };
  
  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
  };
  
  // Create a storage bucket for blog images if it doesn't exist
  const createBucketIfNeeded = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === 'blog-images');
      
      if (!bucketExists) {
        await supabase.storage.createBucket('blog-images', {
          public: true,
          allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
          fileSizeLimit: 5 * 1024 * 1024 // 5MB
        });
        console.log('Created blog-images bucket');
      }
    } catch (error) {
      console.error('Error checking/creating bucket:', error);
    }
  };
  
  createBucketIfNeeded();
  
  return (
    <AdminLayout title="Blog Posts">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Blog Posts</h2>
            <p className="text-muted-foreground">
              Create and manage blog content for your fitness website
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Create New Blog Post</DialogTitle>
                <DialogDescription>
                  Write and publish fitness content for your audience
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[70vh] pr-4">
                <Tabs defaultValue={previewMode ? "preview" : "edit"} className="w-full">
                  <div className="flex justify-between items-center mb-4">
                    <TabsList>
                      <TabsTrigger 
                        value="edit" 
                        onClick={() => setPreviewMode(false)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Editor
                      </TabsTrigger>
                      <TabsTrigger 
                        value="preview" 
                        onClick={() => setPreviewMode(true)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="publish"
                        checked={blogPost.is_published}
                        onCheckedChange={(checked) => 
                          setBlogPost({ ...blogPost, is_published: checked })
                        }
                      />
                      <Label htmlFor="publish">
                        {blogPost.is_published ? "Publish immediately" : "Save as draft"}
                      </Label>
                    </div>
                  </div>
                  
                  <TabsContent value="edit" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Post Title</Label>
                        <Input
                          id="title"
                          placeholder="How to Build Muscle Fast: The Ultimate Guide"
                          value={blogPost.title}
                          onChange={(e) => {
                            const title = e.target.value;
                            setBlogPost({
                              ...blogPost,
                              title,
                              slug: generateSlug(title),
                              seo_title: title
                            });
                          }}
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="slug">URL Slug</Label>
                        <Input
                          id="slug"
                          placeholder="how-to-build-muscle-fast"
                          value={blogPost.slug}
                          onChange={(e) => 
                            setBlogPost({ ...blogPost, slug: e.target.value })
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          The slug is the URL-friendly version of the title.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="excerpt">Excerpt</Label>
                        <Textarea
                          id="excerpt"
                          placeholder="A short summary of your blog post..."
                          rows={2}
                          value={blogPost.excerpt}
                          onChange={(e) => 
                            setBlogPost({ ...blogPost, excerpt: e.target.value })
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          A brief summary that appears in blog listings and social shares.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="content">Content (Markdown)</Label>
                        <Textarea
                          id="content"
                          placeholder="Write your blog post content using Markdown..."
                          rows={10}
                          value={blogPost.content}
                          onChange={(e) => 
                            setBlogPost({ ...blogPost, content: e.target.value })
                          }
                        />
                        <p className="text-sm text-muted-foreground">
                          Use Markdown for formatting: **bold**, *italic*, # headings, > quotes, etc.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={blogPost.category}
                            onValueChange={(value) => 
                              setBlogPost({ ...blogPost, category: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(category => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="tags">Tags</Label>
                          <Input
                            id="tags"
                            placeholder="muscle, strength, workout"
                            value={tagsInput}
                            onChange={(e) => setTagsInput(e.target.value)}
                          />
                          <p className="text-sm text-muted-foreground">
                            Separate tags with commas
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="image">Featured Image</Label>
                        <div className="flex items-center gap-4">
                          <div className="border border-border p-4 rounded-md flex items-center justify-center w-32 h-32">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Featured image preview" 
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <Image className="w-8 h-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1">
                            <Input
                              id="image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              Recommended size: 1200x630px for optimal social sharing.
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Button
                          variant="outline"
                          type="button"
                          onClick={() => setPreviewMode(true)}
                          className="w-full"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
                        <div className="grid gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="seo_title">SEO Title</Label>
                            <Input
                              id="seo_title"
                              placeholder="How to Build Muscle Fast | Workout Planner"
                              value={blogPost.seo_title || ''}
                              onChange={(e) => 
                                setBlogPost({ ...blogPost, seo_title: e.target.value })
                              }
                            />
                            <p className="text-sm text-muted-foreground">
                              Title that appears in search engine results (defaults to post title)
                            </p>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="seo_description">SEO Description</Label>
                            <Textarea
                              id="seo_description"
                              placeholder="Learn the most effective methods to build muscle quickly with our comprehensive guide..."
                              rows={2}
                              value={blogPost.seo_description || ''}
                              onChange={(e) => 
                                setBlogPost({ ...blogPost, seo_description: e.target.value })
                              }
                            />
                            <p className="text-sm text-muted-foreground">
                              Description that appears in search engine results (defaults to excerpt)
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="space-y-4">
                    <div className="border rounded-lg p-6 space-y-4 bg-card">
                      <div className="space-y-2">
                        <h1 className="text-2xl font-bold">{blogPost.title || "Untitled Post"}</h1>
                        <div className="flex flex-wrap gap-2">
                          {tagsInput.split(',').map((tag, index) => (
                            tag.trim() !== '' && (
                              <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                            )
                          ))}
                        </div>
                        <p className="text-muted-foreground italic">
                          {blogPost.excerpt || "No excerpt provided."}
                        </p>
                      </div>
                      
                      {imagePreview && (
                        <div className="my-4">
                          <img 
                            src={imagePreview} 
                            alt="Featured image" 
                            className="rounded-md w-full max-h-[300px] object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {blogPost.content || "No content yet. Start writing in the Editor tab."}
                        </ReactMarkdown>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Category: {CATEGORIES.find(c => c.id === blogPost.category)?.name || 'Uncategorized'}</span>
                          <span>{blogPost.read_time || 5} min read</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setPreviewMode(false)}
                        className="w-full"
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Back to Editor
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  resetBlogForm();
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddPost} 
                  disabled={addPostMutation.isPending || !blogPost.title || !blogPost.content}
                >
                  {addPostMutation.isPending ? "Saving..." : blogPost.is_published ? "Publish" : "Save Draft"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Edit post dialog - similar to add dialog but with existing data */}
          {editingPost && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Edit Blog Post</DialogTitle>
                  <DialogDescription>
                    Make changes to your blog post
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[70vh] pr-4">
                  <Tabs defaultValue={previewMode ? "preview" : "edit"} className="w-full">
                    <div className="flex justify-between items-center mb-4">
                      <TabsList>
                        <TabsTrigger 
                          value="edit" 
                          onClick={() => setPreviewMode(false)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Editor
                        </TabsTrigger>
                        <TabsTrigger 
                          value="preview" 
                          onClick={() => setPreviewMode(true)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="edit-publish"
                          checked={editingPost.is_published}
                          onCheckedChange={(checked) => 
                            setEditingPost({ ...editingPost, is_published: checked })
                          }
                        />
                        <Label htmlFor="edit-publish">
                          {editingPost.is_published ? "Published" : "Draft"}
                        </Label>
                      </div>
                    </div>
                    
                    <TabsContent value="edit" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-title">Post Title</Label>
                          <Input
                            id="edit-title"
                            value={editingPost.title}
                            onChange={(e) => {
                              const title = e.target.value;
                              setEditingPost({
                                ...editingPost,
                                title,
                                // Only auto-update slug if it was not manually changed
                                ...(editingPost.slug === generateSlug(editingPost.title) ? 
                                    { slug: generateSlug(title) } : {})
                              });
                            }}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-slug">URL Slug</Label>
                          <Input
                            id="edit-slug"
                            value={editingPost.slug}
                            onChange={(e) => 
                              setEditingPost({ ...editingPost, slug: e.target.value })
                            }
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-excerpt">Excerpt</Label>
                          <Textarea
                            id="edit-excerpt"
                            rows={2}
                            value={editingPost.excerpt}
                            onChange={(e) => 
                              setEditingPost({ ...editingPost, excerpt: e.target.value })
                            }
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-content">Content (Markdown)</Label>
                          <Textarea
                            id="edit-content"
                            rows={10}
                            value={editingPost.content}
                            onChange={(e) => 
                              setEditingPost({ ...editingPost, content: e.target.value })
                            }
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                              value={editingPost.category}
                              onValueChange={(value) => 
                                setEditingPost({ ...editingPost, category: value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(category => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="edit-tags">Tags</Label>
                            <Input
                              id="edit-tags"
                              value={tagsInput}
                              onChange={(e) => setTagsInput(e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-image">Featured Image</Label>
                          <div className="flex items-center gap-4">
                            <div className="border border-border p-4 rounded-md flex items-center justify-center w-32 h-32">
                              {imagePreview ? (
                                <img 
                                  src={imagePreview} 
                                  alt="Featured image preview" 
                                  className="max-w-full max-h-full object-contain"
                                />
                              ) : (
                                <Image className="w-8 h-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                id="edit-image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                              />
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4 mt-4">
                          <h3 className="text-lg font-medium mb-4">SEO Settings</h3>
                          <div className="grid gap-4">
                            <div className="grid gap-2">
                              <Label htmlFor="edit-seo-title">SEO Title</Label>
                              <Input
                                id="edit-seo-title"
                                value={editingPost.seo_title || ''}
                                onChange={(e) => 
                                  setEditingPost({ ...editingPost, seo_title: e.target.value })
                                }
                              />
                            </div>
                            
                            <div className="grid gap-2">
                              <Label htmlFor="edit-seo-description">SEO Description</Label>
                              <Textarea
                                id="edit-seo-description"
                                rows={2}
                                value={editingPost.seo_description || ''}
                                onChange={(e) => 
                                  setEditingPost({ ...editingPost, seo_description: e.target.value })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="space-y-4">
                      <div className="border rounded-lg p-6 space-y-4 bg-card">
                        <div className="space-y-2">
                          <h1 className="text-2xl font-bold">{editingPost.title}</h1>
                          <div className="flex flex-wrap gap-2">
                            {tagsInput.split(',').map((tag, index) => (
                              tag.trim() !== '' && (
                                <Badge key={index} variant="secondary">{tag.trim()}</Badge>
                              )
                            ))}
                          </div>
                          <p className="text-muted-foreground italic">
                            {editingPost.excerpt}
                          </p>
                        </div>
                        
                        {imagePreview && (
                          <div className="my-4">
                            <img 
                              src={imagePreview} 
                              alt="Featured image" 
                              className="rounded-md w-full max-h-[300px] object-cover"
                            />
                          </div>
                        )}
                        
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {editingPost.content}
                          </ReactMarkdown>
                        </div>
                        
                        <div className="pt-4 border-t">
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Category: {CATEGORIES.find(c => c.id === editingPost.category)?.name || 'Uncategorized'}</span>
                            <span>{editingPost.read_time || 5} min read</span>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => {
                    setShowEditDialog(false);
                    resetBlogForm();
                  }}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUpdatePost} 
                    disabled={updatePostMutation.isPending || !editingPost.title || !editingPost.content}
                  >
                    {updatePostMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {postsLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    Loading blog posts...
                  </TableCell>
                </TableRow>
              ) : filteredPosts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div className="text-lg font-medium">No posts found</div>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all' ? 
                          'Try different search terms or filters' : 
                          'Create your first blog post to get started'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPosts?.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                        {post.featured_image ? (
                          <img 
                            src={post.featured_image} 
                            alt={post.title} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <FileText className="h-5 w-5 opacity-50" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{post.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {post.excerpt || post.content.substring(0, 50) + '...'}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {CATEGORIES.find(c => c.id === post.category)?.name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant={post.is_published ? "default" : "secondary"} className="w-fit">
                        {post.is_published ? "Published" : "Draft"}
                      </Badge>
                      {post.is_featured && (
                        <Badge variant="outline" className="w-fit">
                          <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {post.is_published && post.published_at ? 
                          format(new Date(post.published_at), 'MMM d, yyyy') : 
                          "Not published"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Updated: {format(new Date(post.updated_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[180px] p-2">
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleEditPost(post)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleTogglePublished(post.id, post.is_published, post.published_at)}
                          >
                            {post.is_published ? (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start"
                            onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                          >
                            {post.is_featured ? (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Unfeature
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4 mr-2" />
                                Feature
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-destructive hover:text-destructive"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
