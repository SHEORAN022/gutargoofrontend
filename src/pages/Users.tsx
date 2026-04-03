import { useState, useMemo } from "react";
import {
  Search,
  MoreHorizontal,
  Shield,
  ShieldOff,
  Eye,
  Mail,
  Edit,
  Trash2,
  UserPlus,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAppUsers, AppUser, AppUserFormData } from "@/hooks/useAppUsers";
import { format, formatDistanceToNow } from "date-fns";

const subscriptionStyles: Record<string, string> = {
  free: "bg-muted text-muted-foreground border-border",
  basic: "bg-secondary/50 text-secondary-foreground border-secondary/30",
  premium: "bg-primary/10 text-primary border-primary/20",
  enterprise: "bg-accent/10 text-accent-foreground border-accent/20",
};

const statusStyles: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  blocked: "bg-destructive/10 text-destructive border-destructive/20",
  suspended: "bg-warning/10 text-warning border-warning/20",
  pending: "bg-muted text-muted-foreground border-border",
};

const loginMethodLabels: Record<string, string> = {
  email: "Email",
  google: "Google",
  apple: "Apple",
  phone: "Phone",
};

export default function Users() {
  const { users, loading, createUser, updateUser, deleteUser, toggleUserStatus } = useAppUsers();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<AppUserFormData>({
    name: "",
    email: "",
    phone: "",
    avatar_url: "",
    login_method: "email",
    subscription_plan: "free",
    status: "active",
    notes: "",
  });

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.phone && user.phone.includes(searchQuery));
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesSubscription = subscriptionFilter === "all" || user.subscription_plan === subscriptionFilter;
      return matchesSearch && matchesStatus && matchesSubscription;
    });
  }, [users, searchQuery, statusFilter, subscriptionFilter]);

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    blocked: users.filter((u) => u.status === "blocked").length,
    premium: users.filter((u) => u.subscription_plan === "premium" || u.subscription_plan === "enterprise").length,
  }), [users]);

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      avatar_url: "",
      login_method: "email",
      subscription_plan: "free",
      status: "active",
      notes: "",
    });
    setSelectedUser(null);
  };

  const handleOpenForm = (user?: AppUser) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        avatar_url: user.avatar_url || "",
        login_method: user.login_method,
        subscription_plan: user.subscription_plan,
        status: user.status,
        notes: user.notes || "",
      });
    } else {
      resetForm();
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, formData);
      } else {
        await createUser(formData);
      }
      handleCloseForm();
    } catch (error) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (user: AppUser) => {
    setSelectedUser(user);
    setIsViewOpen(true);
  };

  const handleDeleteClick = (user: AppUser) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        setIsDeleteOpen(false);
        setSelectedUser(null);
      } catch (error) {
        // Error handled in hook
      }
    }
  };

  const handleToggleStatus = async (user: AppUser) => {
    await toggleUserStatus(user.id, user.status);
  };

  const formatWatchTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Users</h1>
          <p className="mt-1 text-muted-foreground">Manage your platform users</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <UsersIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <UserCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.active}</p>
              <p className="text-xs text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-destructive/10 p-2">
              <UserX className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.blocked}</p>
              <p className="text-xs text-muted-foreground">Blocked</p>
            </div>
          </div>
        </div>
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.premium}</p>
              <p className="text-xs text-muted-foreground">Premium</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col gap-4 rounded-xl p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Plans</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card overflow-hidden rounded-xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <UsersIcon className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">No users found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all" || subscriptionFilter !== "all"
                ? "Try adjusting your filters"
                : "Add your first user to get started"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead>Login</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Watch Time</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-border/50 hover:bg-secondary/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {loginMethodLabels[user.login_method] || user.login_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={subscriptionStyles[user.subscription_plan] || subscriptionStyles.free}>
                      {user.subscription_plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[user.status] || statusStyles.pending}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{user.devices_count}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatWatchTime(user.total_watch_time)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.last_active_at
                      ? formatDistanceToNow(new Date(user.last_active_at), { addSuffix: true })
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleView(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleOpenForm(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(`mailto:${user.email}`)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                          {user.status === "active" ? (
                            <>
                              <ShieldOff className="mr-2 h-4 w-4 text-destructive" />
                              <span className="text-destructive">Block User</span>
                            </>
                          ) : (
                            <>
                              <Shield className="mr-2 h-4 w-4 text-success" />
                              <span className="text-success">Unblock User</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteClick(user)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete User
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Edit User" : "Add New User"}</DialogTitle>
            <DialogDescription>
              {selectedUser ? "Update user information" : "Enter the details for the new user"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="avatar_url">Avatar URL</Label>
                <Input
                  id="avatar_url"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="login_method">Login Method</Label>
                <Select
                  value={formData.login_method}
                  onValueChange={(value) => setFormData({ ...formData, login_method: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subscription_plan">Plan</Label>
                <Select
                  value={formData.subscription_plan}
                  onValueChange={(value) => setFormData({ ...formData, subscription_plan: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes about this user..."
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {selectedUser ? "Update User" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl">
                    {selectedUser.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{selectedUser.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Login Method</p>
                  <p className="font-medium capitalize">{loginMethodLabels[selectedUser.login_method]}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Subscription</p>
                  <Badge variant="outline" className={subscriptionStyles[selectedUser.subscription_plan]}>
                    {selectedUser.subscription_plan}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant="outline" className={statusStyles[selectedUser.status]}>
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Devices</p>
                  <p className="font-medium">{selectedUser.devices_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Watch Time</p>
                  <p className="font-medium">{formatWatchTime(selectedUser.total_watch_time)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Joined</p>
                  <p className="font-medium">{format(new Date(selectedUser.created_at), "PPP")}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Active</p>
                  <p className="font-medium">
                    {selectedUser.last_active_at
                      ? formatDistanceToNow(new Date(selectedUser.last_active_at), { addSuffix: true })
                      : "Never"}
                  </p>
                </div>
              </div>
              {selectedUser.notes && (
                <div>
                  <p className="text-sm text-muted-foreground">Notes</p>
                  <p className="mt-1 text-sm">{selectedUser.notes}</p>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsViewOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => { setIsViewOpen(false); handleOpenForm(selectedUser); }}>
                  Edit User
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone and will permanently remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
