import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { RefreshCw, Search, Users, UserCheck, Shield, ShoppingCart } from "lucide-react";
import { format } from "date-fns";

interface UserData {
  id: string;
  full_name: string | null;
  phone: string | null;
  governorate: string | null;
  city: string | null;
  created_at: string;
  roles: string[];
  order_count: number;
  total_spent: number;
  last_order_date: string | null;
}

interface Order {
  id: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  payment_method: string;
  total_amount: number;
  items: any;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("*");

      if (rolesError) throw rolesError;

      // Fetch orders aggregated by user
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("user_id, total_amount, created_at");

      if (ordersError) throw ordersError;

      // Aggregate order data by user
      const ordersByUser = orders?.reduce((acc: any, order) => {
        if (!order.user_id) return acc;
        
        if (!acc[order.user_id]) {
          acc[order.user_id] = {
            count: 0,
            total: 0,
            lastDate: null,
          };
        }
        
        acc[order.user_id].count += 1;
        acc[order.user_id].total += Number(order.total_amount);
        
        if (!acc[order.user_id].lastDate || new Date(order.created_at) > new Date(acc[order.user_id].lastDate)) {
          acc[order.user_id].lastDate = order.created_at;
        }
        
        return acc;
      }, {});

      // Combine all data
      const usersData: UserData[] = profiles?.map((profile) => {
        const roles = userRoles?.filter((ur) => ur.user_id === profile.id).map((ur) => ur.role) || [];
        const orderData = ordersByUser?.[profile.id] || { count: 0, total: 0, lastDate: null };

        return {
          id: profile.id,
          full_name: profile.full_name,
          phone: profile.phone,
          governorate: profile.governorate,
          city: profile.city,
          created_at: profile.created_at,
          roles,
          order_count: orderData.count,
          total_spent: orderData.total,
          last_order_date: orderData.lastDate,
        };
      }) || [];

      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async (userId: string) => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUserOrders(data || []);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      toast.error("Failed to load user orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUserClick = (user: UserData) => {
    setSelectedUser(user);
    fetchUserOrders(user.id);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = 
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (user.phone?.includes(searchTerm) || false);
    
    const matchesRole = 
      roleFilter === "all" ||
      (roleFilter === "admin" && user.roles.includes("admin")) ||
      (roleFilter === "customer" && user.roles.includes("customer") && !user.roles.includes("admin"));

    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    customers: users.filter((u) => u.roles.includes("customer") && !u.roles.includes("admin")).length,
    admins: users.filter((u) => u.roles.includes("admin")).length,
    activeUsers: users.filter((u) => u.order_count > 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{stats.customers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
              <Shield className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold">{stats.activeUsers}</p>
              </div>
              <ShoppingCart className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchUsers} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching your criteria
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Spent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow 
                      key={user.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleUserClick(user)}
                    >
                      <TableCell className="font-medium">
                        {user.full_name || "No name"}
                      </TableCell>
                      <TableCell>{user.phone || "N/A"}</TableCell>
                      <TableCell>
                        {user.governorate && user.city 
                          ? `${user.city}, ${user.governorate}`
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.roles.includes("admin") && (
                            <Badge variant="destructive">Admin</Badge>
                          )}
                          {user.roles.includes("customer") && (
                            <Badge variant="default">Customer</Badge>
                          )}
                          {user.roles.length === 0 && (
                            <Badge variant="outline">No Role</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.order_count > 0 ? "default" : "outline"}>
                          {user.order_count}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {user.total_spent.toFixed(3)} KD
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUserClick(user);
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Details Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{selectedUser.full_name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {selectedUser.governorate && selectedUser.city 
                      ? `${selectedUser.city}, ${selectedUser.governorate}`
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), "MMM d, yyyy HH:mm")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="font-medium">{selectedUser.order_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="font-medium">{selectedUser.total_spent.toFixed(3)} KD</p>
                </div>
              </div>

              {/* Order History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Order History</h3>
                {loadingOrders ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : userOrders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found for this user
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">
                            {order.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell>
                            {format(new Date(order.created_at), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              order.order_status === "completed" ? "default" :
                              order.order_status === "pending" ? "outline" :
                              "destructive"
                            }>
                              {order.order_status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={
                              order.payment_status === "paid" ? "default" : "outline"
                            }>
                              {order.payment_status}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {Number(order.total_amount).toFixed(3)} KD
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
