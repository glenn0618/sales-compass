import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from "@/lib/supabaseClient";

interface Product {
  id: number;
  name: string;
  price: number;
  srp_price: number;
  quantity: number;
  image?: string;
}

interface CartItem extends Product {
  cartQuantity: number;
}

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Fetch products from Supabase
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("tbl_products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        toast.error("Failed to fetch products: " + error.message);
      } else if (data) {
        const mappedProducts: Product[] = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          srp_price: p.srp_price,
          quantity: p.quantity,
            image: p.image, // <-- include the image URL here
        }));
        setProducts(mappedProducts);
      }
    };

    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

 const addToCart = (product: Product) => {
  // Check if product stock is 0
  if (product.quantity <= 0) {
    toast.error(`Product "${product.name}" is out of stock. Please restock!`);
    return;
  }

  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    if (existingItem.cartQuantity < product.quantity) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, cartQuantity: item.cartQuantity + 1 }
          : item
      ));
    } else {
      toast.error("Not enough stock available");
    }
  } else {
    setCart([...cart, { ...product, cartQuantity: 1 }]);
    toast.success("Added to cart");
  }
};

  const updateCartQuantity = (id: number, change: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQuantity = item.cartQuantity + change;
        if (newQuantity <= 0) return item;
        if (newQuantity > item.quantity) {
          toast.error("Not enough stock");
          return item;
        }
        return { ...item, cartQuantity: newQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter(item => item.id !== id));
    toast.info("Removed from cart");
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  const handleCheckout = async () => {
  if (cart.length === 0) {
    toast.error("Cart is empty");
    return;
  }
  if (!customerName.trim()) {
    toast.error("Please enter customer name");
    return;
  }

  try {
    // 1. Insert order
    const { data: orderData, error: orderError } = await supabase
      .from("tbl_order")
      .insert([
        {
          user_id: null,
          customer_name: customerName,
          total_amount: totalPrice,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError || !orderData) {
      toast.error("Failed to create order: " + orderError?.message);
      return;
    }

    const orderId = orderData.id;

    // 2. Insert order items
    const orderItems = cart.map(item => ({
      order_id: orderId,
      product_id: item.id,
      product_name: item.name,
      price: item.price,
      quantity: item.cartQuantity,
    }));

    const { error: itemsError } = await supabase
      .from("tbl_order_items")
      .insert(orderItems);

    if (itemsError) {
      toast.error("Failed to add order items: " + itemsError.message);
      return;
    }

    // 3. Subtract quantity from products table
    for (const item of cart) {
      const newQuantity = item.quantity - item.cartQuantity;

      await supabase
        .from("tbl_products")
        .update({ quantity: newQuantity })
        .eq("id", item.id);

      if (newQuantity <= 0) {
        toast.error(`Product "${item.name}" is out of stock. Please restock!`);
      }
    }

    // 4. Update local state to reflect new quantities
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) return { ...p, quantity: p.quantity - cartItem.cartQuantity };
      return p;
    });
    setProducts(updatedProducts);

    toast.success("Transaction completed successfully!");
    setCart([]);
    setCustomerName("");

  } catch (error) {
    toast.error("An error occurred during checkout");
    console.error(error);
  }
};


  return (
   <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Point of Sale</h2>
        <p className="text-muted-foreground mt-1">Process customer transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4">
                {currentProducts.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-3 sm:p-4 space-y-2">
                     <div className="aspect-square bg-muted rounded-lg flex items-center justify-center overflow-hidden">
  {product.image ? (
    <img
      src={product.image}
      alt={product.name}
      className="object-cover w-full h-full"
    />
  ) : (
    <ShoppingCart className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground" />
  )}
</div>

                      <div>
                        <h3 className="font-semibold text-xs sm:text-sm line-clamp-1">{product.name}</h3>
                        <p className="text-base sm:text-lg font-bold text-primary">₱{product.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.quantity}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => Math.max(1, prev - 1));
                        }}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => Math.min(totalPages, prev + 1));
                        }}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customer-name">Customer Name</Label>
                <Input
                  id="customer-name"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="flex flex-col h-auto lg:h-[calc(100vh-400px)]">
            <CardHeader>
              <CardTitle>Cart ({cart.length})</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-[300px] lg:min-h-0">
              <ScrollArea className="flex-1 -mx-6 px-6 max-h-[400px] lg:max-h-none">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cart is empty
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-muted rounded-lg transition-all"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₱{item.price.toLocaleString()} × {item.cartQuantity}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            ₱{(item.price * item.cartQuantity).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 justify-end sm:justify-start">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => updateCartQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-10 text-center font-medium text-sm">{item.cartQuantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 flex-shrink-0"
                            onClick={() => updateCartQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-8 w-8 ml-1 flex-shrink-0 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="pt-4 border-t mt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-semibold">Total:</span>
                  <span className="text-xl sm:text-2xl font-bold text-primary">
                    ₱{totalPrice.toLocaleString()}
                  </span>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Complete Transaction
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
