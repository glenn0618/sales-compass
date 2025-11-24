import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

// Mock products
const products = [
  { id: 1, name: "Laptop Pro", price: 52000, quantity: 25 },
  { id: 2, name: "Wireless Mouse", price: 799, quantity: 150 },
  { id: 3, name: "USB-C Cable", price: 399, quantity: 200 },
  { id: 4, name: "Keyboard", price: 1299, quantity: 80 },
  { id: 5, name: "Monitor 24\"", price: 8500, quantity: 35 },
  { id: 6, name: "Headphones", price: 2500, quantity: 60 },
];

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  cartQuantity: number;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");

  const addToCart = (product: typeof products[0]) => {
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

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Please enter customer name");
      return;
    }
    toast.success("Transaction completed successfully!");
    setCart([]);
    setCustomerName("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Point of Sale</h2>
        <p className="text-muted-foreground mt-1">Process customer transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map((product) => (
                  <Card
                    key={product.id}
                    className="cursor-pointer hover:border-primary transition-colors"
                    onClick={() => addToCart(product)}
                  >
                    <CardContent className="p-4 space-y-2">
                      <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{product.name}</h3>
                        <p className="text-lg font-bold text-primary">₱{product.price.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Stock: {product.quantity}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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

          <Card className="flex flex-col h-[calc(100vh-400px)]">
            <CardHeader>
              <CardTitle>Cart</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 -mx-6 px-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Cart is empty
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            ₱{item.price.toLocaleString()} × {item.cartQuantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateCartQuantity(item.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">{item.cartQuantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateCartQuantity(item.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7 ml-1"
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
                  <span className="text-lg font-semibold">Total:</span>
                  <span className="text-2xl font-bold text-primary">
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
