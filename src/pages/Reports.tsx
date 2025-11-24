import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Mock data
const initialReports = [
  { id: 1, customerName: "John Doe", totalAmount: 5500, createdAt: "2024-01-15", status: "completed" },
  { id: 2, customerName: "Jane Smith", totalAmount: 3200, createdAt: "2024-01-16", status: "completed" },
  { id: 3, customerName: "Bob Johnson", totalAmount: 8900, createdAt: "2024-01-17", status: "pending" },
  { id: 4, customerName: "Alice Brown", totalAmount: 2100, createdAt: "2024-01-18", status: "completed" },
  { id: 5, customerName: "Charlie Wilson", totalAmount: 6700, createdAt: "2024-01-19", status: "completed" },
];

export default function Reports() {
  const [reports] = useState(initialReports);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredReports = reports.filter(report => {
    if (!startDate && !endDate) return true;
    const reportDate = new Date(report.createdAt);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    
    if (start && end) {
      return reportDate >= start && reportDate <= end;
    } else if (start) {
      return reportDate >= start;
    } else if (end) {
      return reportDate <= end;
    }
    return true;
  });

  const totalSales = filteredReports.reduce((sum, report) => sum + report.totalAmount, 0);

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
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.customerName}</TableCell>
                  <TableCell>₱{report.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{report.createdAt}</TableCell>
                  <TableCell>
                    <Badge
                      variant={report.status === "completed" ? "default" : "secondary"}
                      className={report.status === "completed" ? "bg-success" : ""}
                    >
                      {report.status}
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
