import { useState, useEffect } from "react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhilippinePeso, Package, FolderOpen } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

// You can keep these for initial charts
const topProducts = [
  { name: "Product A", sales: 4500 },
  { name: "Product B", sales: 3800 },
  { name: "Product C", sales: 3200 },
  { name: "Product D", sales: 2900 },
  { name: "Product E", sales: 2500 },
];

const revenueData = [
  { month: "Jan", revenue: 12000 },
  { month: "Feb", revenue: 15000 },
  { month: "Mar", revenue: 13500 },
  { month: "Apr", revenue: 18000 },
  { month: "May", revenue: 20000 },
  { month: "Jun", revenue: 22500 },
];

export default function Dashboard() {
  const [totalSales, setTotalSales] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

   const [topProducts, setTopProducts] = useState<{ name: string; sales: number }[]>([]);

  const fetchTopProducts = async () => {
    try {
      // 1. Fetch paid orders
      const { data: paidOrders, error: orderError } = await supabase
        .from("tbl_order")
        .select("id")
        .eq("status", "paid");

      if (orderError) {
        toast.error("Failed to fetch paid orders: " + orderError.message);
        return;
      }

      const paidOrderIds = paidOrders?.map((o: any) => o.id) || [];

      if (paidOrderIds.length === 0) {
        setTopProducts([]);
        return;
      }

      // 2. Fetch order items for those orders
      const { data: orderItems, error: itemsError } = await supabase
        .from("tbl_order_items")
        .select("product_id, price, quantity")
        .in("order_id", paidOrderIds);

      if (itemsError) {
        toast.error("Failed to fetch order items: " + itemsError.message);
        return;
      }

      // 3. Fetch product names from tbl_products
      const productIds = orderItems?.map((i: any) => i.product_id) || [];
      const { data: products, error: productError } = await supabase
        .from("tbl_products")
        .select("id, name")
        .in("id", productIds);

      if (productError) {
        toast.error("Failed to fetch products: " + productError.message);
        return;
      }

      // Map product_id → name
      const productMap: Record<number, string> = {};
      products?.forEach((p: any) => {
        productMap[p.id] = p.name;
      });

      // 4. Aggregate sales per product
      const salesMap: Record<string, number> = {};
      orderItems?.forEach((item: any) => {
        const name = productMap[item.product_id] || "Unknown";
        const saleAmount = item.price * item.quantity;
        salesMap[name] = (salesMap[name] || 0) + saleAmount;
      });

      // 5. Sort and take top 5
      const top5 = Object.entries(salesMap)
        .map(([name, sales]) => ({ name, sales }))
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5);

      setTopProducts(top5);

    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while fetching top products.");
    }
  };

  useEffect(() => {
    fetchTopProducts();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total sales (sum of total_amount where paid)
      const { data: orderData, error: orderError } = await supabase
        .from("tbl_order")
        .select("total_amount, status");

      if (orderError) {
        toast.error("Failed to fetch orders: " + orderError.message);
        return;
      }

      const paidOrders = orderData?.filter((o: any) => o.status === "paid") || [];
      const totalSalesSum = paidOrders.reduce((sum: number, o: any) => sum + o.total_amount, 0);
      setTotalSales(totalSalesSum);

      // Count total products
      const { count: productCount, error: productError } = await supabase
        .from("tbl_products")
        .select("*", { count: "exact", head: true });

      if (productError) {
        toast.error("Failed to fetch products: " + productError.message);
        return;
      }

      setTotalProducts(productCount || 0);

      // Count total orders
      const { count: orderCount, error: orderCountError } = await supabase
        .from("tbl_order")
        .select("*", { count: "exact", head: true });

      if (orderCountError) {
        toast.error("Failed to fetch order count: " + orderCountError.message);
        return;
      }

      setTotalOrders(orderCount || 0);

    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while fetching dashboard data.");
    }
  };

  const colors = ["#4ade80", "#60a5fa", "#facc15", "#f87171", "#a78bfa"]; // green, blue, yellow, red, purple

  useEffect(() => {
    fetchDashboardData();
  }, []);



   const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);

  const fetchMonthlyRevenue = async () => {
    try {
      // Fetch all paid orders
      const { data: orders, error } = await supabase
        .from("tbl_order")
        .select("total_amount, created_at")
        .eq("status", "paid"); // only consider paid orders

      if (error) {
        toast.error("Failed to fetch orders: " + error.message);
        return;
      }

      if (orders) {
        // Aggregate total_amount per month
        const monthMap: Record<string, number> = {};

        orders.forEach((o: any) => {
          const date = new Date(o.created_at);
          const month = date.toLocaleString("default", { month: "short" }); // "Jan", "Feb", etc.
          monthMap[month] = (monthMap[month] || 0) + o.total_amount;
        });

        // Convert to array for chart
        const chartData = Object.entries(monthMap)
          .map(([month, revenue]) => ({ month, revenue }))
          .sort((a, b) => new Date(a.month + " 1, 2000").getTime() - new Date(b.month + " 1, 2000").getTime()); // sort by month

        setRevenueData(chartData);
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while fetching revenue data.");
    }
  };

  useEffect(() => {
    fetchMonthlyRevenue();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your retail performance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Total Sales"
          value={`₱${totalSales.toLocaleString()}`}
          icon={PhilippinePeso}
          trend="+12.5% from last month"
          trendUp={true}
        />
        <StatCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={Package}
          trend="+8 new this month"
          trendUp={true}
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toString()}
          icon={FolderOpen}
          trend="2 active Orders"
          trendUp={true}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
      <Card>
  <CardHeader>
    <CardTitle>Top 5 Best Selling Products</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topProducts}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
        <YAxis stroke="hsl(var(--muted-foreground))" />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "hsl(var(--card))", 
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)"
          }} 
        />
        <Bar dataKey="sales" radius={[8, 8, 0, 0]}>
          {topProducts.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </CardContent>
</Card>

          <Card>
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "var(--radius)"
              }} 
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--accent))" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
      </div>
    </div>
  );
}
