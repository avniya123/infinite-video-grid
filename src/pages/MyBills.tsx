import { useState } from "react";
import { Header } from "@/components/Header";
import { FileText, Calendar, CreditCard, Filter, Download, Search, Info, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const MyBills = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const { data: ordersData, error: ordersError } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (ordersError) throw ordersError;

      // Fetch shared users for each order to determine order type
      const ordersWithType = await Promise.all(
        ordersData.map(async (order) => {
          const { data: sharedUsers } = await supabase
            .from("order_shared_users")
            .select("*")
            .eq("order_id", order.id);
          
          return {
            ...order,
            order_type: sharedUsers && sharedUsers.length > 0 ? "shared" : "self"
          };
        })
      );
      
      return ordersWithType;
    },
  });

  const { data: orderTemplates } = useQuery({
    queryKey: ["order-templates", selectedOrder?.id],
    queryFn: async () => {
      if (!selectedOrder?.id) return [];
      const { data, error } = await supabase
        .from("order_templates")
        .select("*")
        .eq("order_id", selectedOrder.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!selectedOrder?.id,
  });

  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPaymentStatus = paymentStatusFilter === "all" || order.payment_status === paymentStatusFilter;
    const matchesPaymentMethod = paymentMethodFilter === "all" || order.payment_method === paymentMethodFilter;
    
    let matchesDateRange = true;
    if (dateRangeFilter !== "all") {
      const orderDate = new Date(order.created_at);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dateRangeFilter === "7days") matchesDateRange = daysDiff <= 7;
      else if (dateRangeFilter === "30days") matchesDateRange = daysDiff <= 30;
      else if (dateRangeFilter === "90days") matchesDateRange = daysDiff <= 90;
    }
    
    return matchesSearch && matchesPaymentStatus && matchesPaymentMethod && matchesDateRange;
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const handleExportCSV = () => {
    if (!filteredOrders || filteredOrders.length === 0) {
      toast.error("No data to export");
      return;
    }

    const csvHeaders = [
      "Order Number",
      "Date",
      "Payment Method",
      "Status",
      "Order Type",
      "Subtotal",
      "Tax",
      "Discount",
      "Total"
    ];

    const csvRows = filteredOrders.map(order => [
      order.order_number,
      format(new Date(order.created_at), "MMM dd, yyyy"),
      order.payment_method.replace("_", " ").toUpperCase(),
      order.payment_status,
      order.order_type.toUpperCase(),
      `₹${Number(order.subtotal).toFixed(2)}`,
      `₹${Number(order.tax).toFixed(2)}`,
      `₹${Number(order.discount).toFixed(2)}`,
      `₹${Number(order.total).toFixed(2)}`
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bills-${format(new Date(), "yyyy-MM-dd")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success("Bills exported successfully");
  };

  const handleOpenInfo = (order: any) => {
    setSelectedOrder(order);
    setInfoDialogOpen(true);
    setDialogSearchQuery("");
  };

  const filteredTemplates = orderTemplates?.filter((template) =>
    template.template_title.toLowerCase().includes(dialogSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-2xl font-extrabold tracking-wide leading-tight">My Bills</h1>
            <p className="text-sm text-muted-foreground tracking-wide">View and manage your billing history</p>
          </div>
        </div>

        <Separator className="mb-6" />

        {/* Filters Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-lg font-bold tracking-wide">Filters</h2>
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Export to CSV
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={paymentStatusFilter} onValueChange={setPaymentStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Payment Method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit_card">Credit Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="net_banking">Net Banking</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="7days">Last 7 Days</SelectItem>
                <SelectItem value="30days">Last 30 Days</SelectItem>
                <SelectItem value="90days">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchQuery || paymentStatusFilter !== "all" || paymentMethodFilter !== "all" || dateRangeFilter !== "all") && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setPaymentStatusFilter("all");
                  setPaymentMethodFilter("all");
                  setDateRangeFilter("all");
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </Card>

        {/* Table */}
        <Card className="p-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order Type</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Loading bills...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {format(new Date(order.created_at), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                          {order.payment_method.replace("_", " ").toUpperCase()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(order.payment_status)}>
                          {order.payment_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.order_type === "shared" ? "secondary" : "outline"}>
                          {order.order_type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{Number(order.subtotal).toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{Number(order.tax).toFixed(2)}</TableCell>
                      <TableCell className="text-right">₹{Number(order.discount).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-bold">₹{Number(order.total).toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenInfo(order)}>
                            <Info className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No bills found matching your filters
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Order Info Dialog */}
        <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-xl font-extrabold tracking-wide">
                Order Details - {selectedOrder?.order_number}
              </DialogTitle>
              <DialogDescription>
                Complete information about this order and its templates
              </DialogDescription>
            </DialogHeader>
            
            <ScrollArea className="h-[60vh] pr-4">
              {/* Order Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold tracking-wide mb-4">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Order Number</p>
                      <p className="font-medium">{selectedOrder?.order_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Order Type</p>
                      <Badge variant={selectedOrder?.order_type === "shared" ? "secondary" : "outline"}>
                        {selectedOrder?.order_type?.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-medium">
                        {selectedOrder && format(new Date(selectedOrder.created_at), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Status</p>
                      <Badge variant={getStatusBadgeVariant(selectedOrder?.payment_status || "")}>
                        {selectedOrder?.payment_status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Payment Method</p>
                      <p className="font-medium">
                        {selectedOrder?.payment_method.replace("_", " ").toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Share Method</p>
                      <p className="font-medium">{selectedOrder?.share_method}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Subtotal</p>
                      <p className="font-medium">₹{Number(selectedOrder?.subtotal || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tax</p>
                      <p className="font-medium">₹{Number(selectedOrder?.tax || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Discount</p>
                      <p className="font-medium">₹{Number(selectedOrder?.discount || 0).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold text-lg">₹{Number(selectedOrder?.total || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Templates Information */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold tracking-wide">Templates ({orderTemplates?.length || 0})</h3>
                    <div className="relative w-64">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search templates..."
                        value={dialogSearchQuery}
                        onChange={(e) => setDialogSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  
                  {filteredTemplates && filteredTemplates.length > 0 ? (
                    <div className="space-y-4">
                      {filteredTemplates.map((template) => (
                        <Card key={template.id} className="p-4">
                          <div className="flex gap-4">
                            {template.template_thumbnail_url && (
                              <img
                                src={template.template_thumbnail_url}
                                alt={template.template_title}
                                className="w-32 h-20 object-cover rounded"
                              />
                            )}
                            <div className="flex-1 grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-sm text-muted-foreground">Title</p>
                                <p className="font-medium">{template.template_title}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Price</p>
                                <p className="font-medium">₹{Number(template.template_price).toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Duration</p>
                                <p className="font-medium">{template.template_duration}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Resolution</p>
                                <p className="font-medium">{template.template_resolution}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Orientation</p>
                                <p className="font-medium">{template.template_orientation}</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No templates found
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default MyBills;
