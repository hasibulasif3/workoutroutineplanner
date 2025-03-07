
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/components/ui/use-toast';
import { Plus, Search, Edit, Trash2, Star, Save, Image, Check, Link2, Tag, Dumbbell, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  created_at: string;
  category: string;
  affiliate_link: string;
  image_url?: string;
  difficulty?: string;
  rating?: number;
  reviews_count?: number;
  is_featured?: boolean;
  metadata?: Record<string, any>;
}

const CATEGORIES = [
  'equipment', 'supplements', 'clothing', 'accessories', 'digital', 'general'
];

const DIFFICULTY_LEVELS = [
  'beginner', 'intermediate', 'advanced', 'all-levels'
];

export default function Products() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    category: 'general',
    affiliate_link: '#',
    difficulty: 'all-levels',
    is_featured: false,
    metadata: {
      specifications: [],
      features: [],
      compatible_with: [],
      related_products: []
    }
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  // Get all products
  const { data: products, isLoading, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Product[];
    }
  });

  // Add product mutation
  const addProductMutation = useMutation({
    mutationFn: async (product: Partial<Product>) => {
      let imageUrl = '';
      
      // Upload image if provided
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }
      
      // Insert product with image URL if uploaded
      const { data, error } = await supabase
        .from('products')
        .insert([{
          ...product,
          ...(imageUrl ? { image_url: imageUrl } : {})
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Product added successfully",
        description: "The product has been added to the catalog",
      });
      setShowAddDialog(false);
      resetProductForm();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Error adding product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      let imageUrl = product.image_url || '';
      
      // Upload image if provided
      if (imageFile) {
        const fileName = `${Date.now()}_${imageFile.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrl;
      }
      
      // Update product
      const { data, error } = await supabase
        .from('products')
        .update({
          ...product,
          ...(imageFile ? { image_url: imageUrl } : {})
        })
        .eq('id', product.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Product updated",
        description: "Changes have been saved successfully",
      });
      setShowEditDialog(false);
      resetProductForm();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    },
    onSuccess: (id) => {
      toast({
        title: "Product deleted",
        description: "The product has been removed from the catalog",
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Error deleting product",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Toggle featured status mutation
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, featured }: { id: string, featured: boolean }) => {
      const { data, error } = await supabase
        .from('products')
        .update({ is_featured: featured })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: data.is_featured ? "Product featured" : "Product unfeatured",
        description: `${data.name} is ${data.is_featured ? 'now' : 'no longer'} featured`,
      });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error) => {
      toast({
        title: "Error updating featured status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Filter products based on search term and active tab
  const filteredProducts = products?.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'featured') return matchesSearch && product.is_featured;
    return matchesSearch && product.category === activeTab;
  });

  const handleAddProduct = () => {
    addProductMutation.mutate(newProduct);
  };

  const handleUpdateProduct = () => {
    if (editingProduct) {
      updateProductMutation.mutate(editingProduct);
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleToggleFeatured = (id: string, currentStatus: boolean = false) => {
    toggleFeaturedMutation.mutate({ id, featured: !currentStatus });
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

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setImagePreview(product.image_url || null);
    setShowEditDialog(true);
  };

  const resetProductForm = () => {
    setNewProduct({
      name: '',
      description: '',
      price: 0,
      stock: 0,
      category: 'general',
      affiliate_link: '#',
      difficulty: 'all-levels',
      is_featured: false,
      metadata: {
        specifications: [],
        features: [],
        compatible_with: [],
        related_products: []
      }
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingProduct(null);
  };

  // Create a storage bucket for product images if it doesn't exist
  useEffect(() => {
    const createBucketIfNeeded = async () => {
      try {
        const { data: buckets } = await supabase.storage.listBuckets();
        const bucketExists = buckets?.some(bucket => bucket.name === 'product-images');
        
        if (!bucketExists) {
          await supabase.storage.createBucket('product-images', {
            public: true,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'],
            fileSizeLimit: 5 * 1024 * 1024 // 5MB
          });
          console.log('Created product-images bucket');
        }
      } catch (error) {
        console.error('Error checking/creating bucket:', error);
      }
    };
    
    createBucketIfNeeded();
  }, []);

  return (
    <AdminLayout title="Products">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Products</h2>
            <p className="text-muted-foreground">
              Manage your product catalog for workout gear and accessories
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
                <DialogDescription>
                  Add a new product to your workout gear catalog
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] pr-4">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="mb-4 w-full">
                    <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
                    <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                    <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="Premium Yoga Mat"
                        />
                      </div>
                      
                      <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="High-quality premium yoga mat with non-slip surface and eco-friendly materials."
                          rows={4}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="price">Price ($)</Label>
                          <Input
                            id="price"
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                            placeholder="29.99"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="stock">Stock</Label>
                          <Input
                            id="stock"
                            type="number"
                            value={newProduct.stock}
                            onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                            placeholder="100"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={newProduct.category}
                            onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {CATEGORIES.map(category => (
                                <SelectItem key={category} value={category}>
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="difficulty">Difficulty Level</Label>
                          <Select
                            value={newProduct.difficulty}
                            onValueChange={(value) => setNewProduct({ ...newProduct, difficulty: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTY_LEVELS.map(level => (
                                <SelectItem key={level} value={level}>
                                  {level.charAt(0).toUpperCase() + level.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="featured"
                          checked={newProduct.is_featured}
                          onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_featured: checked })}
                        />
                        <Label htmlFor="featured">Feature this product</Label>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="affiliate_link">Affiliate Link</Label>
                        <Input
                          id="affiliate_link"
                          value={newProduct.affiliate_link}
                          onChange={(e) => setNewProduct({ ...newProduct, affiliate_link: e.target.value })}
                          placeholder="https://example.com/product/ref=123"
                        />
                        <p className="text-sm text-muted-foreground">
                          This is the link users will be directed to when clicking the "Buy Now" button.
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Specifications</Label>
                        <Textarea
                          placeholder="- Material: Premium PVC&#10;- Dimensions: 72\" x 24\"&#10;- Thickness: 5mm"
                          rows={4}
                          onChange={(e) => {
                            const specs = e.target.value.split('\n').filter(line => line.trim() !== '');
                            setNewProduct({
                              ...newProduct,
                              metadata: {
                                ...newProduct.metadata,
                                specifications: specs
                              }
                            });
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter each specification on a new line. Use format "- Property: Value".
                        </p>
                      </div>
                      
                      <div className="grid gap-2">
                        <Label>Features</Label>
                        <Textarea
                          placeholder="- Non-slip surface&#10;- Eco-friendly materials&#10;- Carrying strap included"
                          rows={4}
                          onChange={(e) => {
                            const features = e.target.value.split('\n').filter(line => line.trim() !== '');
                            setNewProduct({
                              ...newProduct,
                              metadata: {
                                ...newProduct.metadata,
                                features: features
                              }
                            });
                          }}
                        />
                        <p className="text-sm text-muted-foreground">
                          Enter each feature on a new line starting with "- ".
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="media" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="image">Product Image</Label>
                        <div className="flex items-center gap-4">
                          <div className="border border-border p-4 rounded-md flex items-center justify-center w-32 h-32">
                            {imagePreview ? (
                              <img 
                                src={imagePreview} 
                                alt="Product preview" 
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
                              Recommended size: 800x800px. Max file size: 5MB.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => {
                  setShowAddDialog(false);
                  resetProductForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleAddProduct} disabled={addProductMutation.isPending}>
                  {addProductMutation.isPending ? "Adding..." : "Add Product"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Edit product dialog */}
          {editingProduct && (
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>Edit Product</DialogTitle>
                  <DialogDescription>
                    Update product information
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh] pr-4">
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="mb-4 w-full">
                      <TabsTrigger value="basic" className="flex-1">Basic Info</TabsTrigger>
                      <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                      <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="basic" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-name">Product Name</Label>
                          <Input
                            id="edit-name"
                            value={editingProduct.name}
                            onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label htmlFor="edit-description">Description</Label>
                          <Textarea
                            id="edit-description"
                            value={editingProduct.description}
                            onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                            rows={4}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-price">Price ($)</Label>
                            <Input
                              id="edit-price"
                              type="number"
                              value={editingProduct.price}
                              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-stock">Stock</Label>
                            <Input
                              id="edit-stock"
                              type="number"
                              value={editingProduct.stock}
                              onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="edit-category">Category</Label>
                            <Select
                              value={editingProduct.category}
                              onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {CATEGORIES.map(category => (
                                  <SelectItem key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="edit-difficulty">Difficulty Level</Label>
                            <Select
                              value={editingProduct.difficulty || 'all-levels'}
                              onValueChange={(value) => setEditingProduct({ ...editingProduct, difficulty: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select difficulty" />
                              </SelectTrigger>
                              <SelectContent>
                                {DIFFICULTY_LEVELS.map(level => (
                                  <SelectItem key={level} value={level}>
                                    {level.charAt(0).toUpperCase() + level.slice(1)}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="edit-featured"
                            checked={editingProduct.is_featured}
                            onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_featured: checked })}
                          />
                          <Label htmlFor="edit-featured">Feature this product</Label>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-affiliate-link">Affiliate Link</Label>
                          <Input
                            id="edit-affiliate-link"
                            value={editingProduct.affiliate_link}
                            onChange={(e) => setEditingProduct({ ...editingProduct, affiliate_link: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Specifications</Label>
                          <Textarea
                            value={(editingProduct.metadata?.specifications || []).join('\n')}
                            rows={4}
                            onChange={(e) => {
                              const specs = e.target.value.split('\n').filter(line => line.trim() !== '');
                              setEditingProduct({
                                ...editingProduct,
                                metadata: {
                                  ...editingProduct.metadata,
                                  specifications: specs
                                }
                              });
                            }}
                          />
                        </div>
                        
                        <div className="grid gap-2">
                          <Label>Features</Label>
                          <Textarea
                            value={(editingProduct.metadata?.features || []).join('\n')}
                            rows={4}
                            onChange={(e) => {
                              const features = e.target.value.split('\n').filter(line => line.trim() !== '');
                              setEditingProduct({
                                ...editingProduct,
                                metadata: {
                                  ...editingProduct.metadata,
                                  features: features
                                }
                              });
                            }}
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="media" className="space-y-4">
                      <div className="grid gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="edit-image">Product Image</Label>
                          <div className="flex items-center gap-4">
                            <div className="border border-border p-4 rounded-md flex items-center justify-center w-32 h-32">
                              {imagePreview ? (
                                <img 
                                  src={imagePreview} 
                                  alt="Product preview" 
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
                      </div>
                    </TabsContent>
                  </Tabs>
                </ScrollArea>
                <DialogFooter className="mt-6">
                  <Button variant="outline" onClick={() => {
                    setShowEditDialog(false);
                    resetProductForm();
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateProduct} disabled={updateProductMutation.isPending}>
                    {updateProductMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="w-full sm:w-auto"
            >
              <TabsList className="w-full grid grid-cols-2 sm:flex sm:w-auto gap-2">
                <TabsTrigger value="all" className="px-3">
                  All
                </TabsTrigger>
                <TabsTrigger value="featured" className="px-3">
                  Featured
                </TabsTrigger>
                {CATEGORIES.map(category => (
                  <TabsTrigger key={category} value={category} className="hidden sm:block px-3">
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
          
          <div className="sm:hidden">
            <Select value={activeTab} onValueChange={setActiveTab}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : filteredProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Tag className="h-8 w-8 text-muted-foreground" />
                      <div className="text-lg font-medium">No products found</div>
                      <p className="text-sm text-muted-foreground">
                        {searchTerm ? 'Try different search terms' : 'Add some products to get started'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProducts?.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {product.image_url ? (
                        <img 
                          src={product.image_url} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <Dumbbell className="h-5 w-5 opacity-50" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={product.stock > 10 ? "outline" : product.stock > 0 ? "secondary" : "destructive"}>
                      {product.stock > 0 ? product.stock : "Out of stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleFeatured(product.id, product.is_featured)}
                      title={product.is_featured ? "Unfeature product" : "Feature product"}
                    >
                      <Star 
                        className={`h-4 w-4 ${product.is_featured ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} 
                      />
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
