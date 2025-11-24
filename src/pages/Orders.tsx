import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil } from "lucide-react";
import { toast } from "sonner";

// Mock data
const initialOrders = [
  { id: 1, customerName: "John Doe", totalAmount: 5500, createdAt: "2024-01-15", status: "paid" },
  { id: 2, customerName: "Jane Smith", totalAmount: 3200, createdAt: "2024-01-16", status: "pending" },
  { id: 3, customerName: "Bob Johnson", totalAmount: 8900, createdAt: "2024-01-17", status: "not paid" },
  { id: 4, customerName: "Alice Brown", totalAmount: 2100, createdAt: "2024-01-18", status: "paid" },
  { id: 5, customerName: "Charlie Wilson", totalAmount: 6700, createdAt: "2024-01-19", status: "pending" },
];

type OrderStatus = "pending" | "paid" | "not paid";

export default function Orders() {
  const [orders, setOrders] = useState(initialOrders);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingOrder, setEditingOrder] = useState<typeof initialOrders[0] | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>("pending");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    if (!startDate && !endDate) return true;
    const orderDate = new Date(order.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
      return orderDate >= start && orderDate <= end;
    } else if (start) {
      return orderDate >= start;
    } else if (end) {
      return orderDate <= end;
    }
    return true;
  });

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const handleEditClick = (order: typeof initialOrders[0]) => {
    setEditingOrder(order);
    setNewStatus(order.status as OrderStatus);
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = () => {
    if (editingOrder) {
      setOrders(orders.map(order => 
        order.id === editingOrder.id 
          ? { ...order, status: newStatus }
          : order
      ));
      toast.success("Order status updated successfully");
      setIsEditDialogOpen(false);
      setEditingOrder(null);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "pending":
        return "secondary";
      case "not paid":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "not paid":
        return "";
      default:
        return "";
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
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>₱{order.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{order.createdAt}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusVariant(order.status)}
                        className={getStatusColor(order.status)}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditClick(order)}
                      >
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
              <span className="text-2xl font-bold text-success">
                ₱{totalSales.toLocaleString()}
              </span>
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
              <Input value={editingOrder?.customerName} disabled />
            </div>
            <div className="space-y-2">
              <Label>Total Amount</Label>
              <Input value={`₱${editingOrder?.totalAmount.toLocaleString()}`} disabled />
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
