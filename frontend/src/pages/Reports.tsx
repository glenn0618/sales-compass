import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

type OrderStatus = "pending" | "paid" | "not paid";

interface Order {
  id: number;
  customer_name: string;
  total_amount: number;
  created_at: string;
  status: OrderStatus;
}

export default function Reports() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("tbl_order")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("Failed to fetch orders: " + error.message);
        return;
      }

      if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while fetching orders.");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by date
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

  // Only sum totalAmount for orders with status "paid"
  const totalSales = filteredOrders
    .filter(order => order.status === "paid")
    .reduce((sum, order) => sum + order.total_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Sales Reports</h2>
        <p className="text-muted-foreground mt-1">View and filter sales transactions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filter by Date</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
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
          <CardTitle>Sales Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer Name</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.customer_name}</TableCell>
                  <TableCell>₱{order.total_amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge
                      variant={order.status === "paid" ? "default" : "secondary"}
                      className={order.status === "paid" ? "bg-success" : "bg-warning"}
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
    </div>
  );
}
