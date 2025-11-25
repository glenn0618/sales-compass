import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

type OrderStatus = "pending" | "paid" | "not paid";

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number; // added price
}

interface Order {
  id: number;
  customer_name: string;
  total_amount: number;
  created_at: string;
  status: OrderStatus;
  products?: OrderItem[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const fetchOrders = async () => {
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from("tbl_order")
        .select("*")
        .order("created_at", { ascending: false });

      if (ordersError) {
        toast.error("Failed to fetch orders: " + ordersError.message);
        return;
      }

      if (!ordersData) return;

      // Fetch order items including price
      const { data: itemsData, error: itemsError } = await supabase
        .from("tbl_order_items")
        .select("order_id, product_id, product_name, quantity, price");

      if (itemsError) {
        toast.error("Failed to fetch order items: " + itemsError.message);
        return;
      }

      // Map items to orders
      const ordersWithProducts: Order[] = ordersData.map((order: any) => ({
        ...order,
        products: itemsData?.filter(item => item.order_id === order.id) || [],
      }));

      setOrders(ordersWithProducts);
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while fetching orders.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    if (!startDate && !endDate) return true;
    const orderDate = new Date(order.created_at);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) return orderDate >= start && orderDate <= end;
    if (start) return orderDate >= start;
    if (end) return orderDate <= end;
    return true;
  });

  const totalSales = filteredOrders
    .filter(order => order.status === "paid")
    .reduce((sum, order) => sum + order.total_amount, 0);

  const handleEditClick = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!editingOrder) return;

    const { error } = await supabase
      .from("tbl_order")
      .update({ status: newStatus })
      .eq("id", editingOrder.id);

    if (error) {
      toast.error("Failed to update status: " + error.message);
    } else {
      toast.success("Order status updated successfully");
      setOrders(orders.map(order =>
        order.id === editingOrder.id
          ? { ...order, status: newStatus }
          : order
      ));
      setIsEditDialogOpen(false);
      setEditingOrder(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid": return "default";
      case "pending": return "secondary";
      case "not paid": return "destructive";
      default: return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-success";
      case "pending": return "bg-warning";
      case "not paid": return "bg-destructive";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Orders Management</h2>
        <p className="text-muted-foreground mt-1">View and manage customer orders</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Quantity x Price</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => (
                  <TableRow key={order.id} className={index === 0 ? "bg-primary/10" : ""}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.products?.map(p => p.product_name).join(", ")}</TableCell>
                    <TableCell>
                      {order.products?.map(p => `${p.quantity} x ₱${p.price.toLocaleString()}`).join(", ")}
                    </TableCell>
                    <TableCell>₱{order.total_amount.toLocaleString()}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(order.status)} className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="icon" onClick={() => handleEditClick(order)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-foreground">Total Sales:</span>
              <span className="text-2xl font-bold text-success">₱{totalSales.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Order ID</Label>
              <Input value={`#${editingOrder?.id}`} disabled />
            </div>
            <div className="space-y-2">
              <Label>Customer Name</Label>
              <Input value={editingOrder?.customer_name} disabled />
            </div>
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input value={`₱${editingOrder?.total_amount.toLocaleString()}`} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as OrderStatus)}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="not paid">Not Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
