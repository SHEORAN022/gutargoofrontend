import { useState } from "react";
import {
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Mail,
  Building2,
  Phone,
  Percent,
  Loader2,
  UserCheck,
  UserX,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { useVendors, Vendor, VendorFormData } from "@/hooks/useVendors";
import { format } from "date-fns";

const statusConfig = {
  active: {
    style: "bg-success/10 text-success border-success/20",
    icon: UserCheck,
    label: "Active",
  },
  inactive: {
    style: "bg-muted text-muted-foreground border-border",
    icon: UserX,
    label: "Inactive",
  },
  suspended: {
    style: "bg-destructive/10 text-destructive border-destructive/20",
    icon: AlertTriangle,
    label: "Suspended",
  },
  pending: {
    style: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
    label: "Pending",
  },
};

const defaultFormData: VendorFormData = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  address: "",
  status: "pending",
  commission_rate: 0,
  notes: "",
};

export default function Vendors() {
  const { vendors, isLoading, createVendor, updateVendor, deleteVendor } = useVendors();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [deletingVendor, setDeletingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<VendorFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: vendors.length,
    active: vendors.filter((v) => v.status === "active").length,
    pending: vendors.filter((v) => v.status === "pending").length,
    pendingContent: vendors.reduce((acc, v) => acc + v.pending_content, 0),
  };

  const openCreateDialog = () => {
    setEditingVendor(null);
    setFormData(defaultFormData);
    setIsFormOpen(true);
  };

  const openEditDialog = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone || "",
      company_name: vendor.company_name || "",
      address: vendor.address || "",
      status: vendor.status,
      commission_rate: vendor.commission_rate || 0,
      notes: vendor.notes || "",
    });
    setIsFormOpen(true);
  };

  const openViewDialog = (vendor: Vendor) => {
    setViewingVendor(vendor);
    setIsViewOpen(true);
  };

  const openDeleteDialog = (vendor: Vendor) => {
    setDeletingVendor(vendor);
    setIsDeleteOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) return;

    setIsSaving(true);
    try {
      if (editingVendor) {
        await updateVendor(editingVendor.id, formData);
      } else {
        await createVendor(formData);
      }
      setIsFormOpen(false);
      setFormData(defaultFormData);
      setEditingVendor(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVendor) return;
    await deleteVendor(deletingVendor.id);
    setIsDeleteOpen(false);
    setDeletingVendor(null);
  };

  const handleStatusToggle = async (vendor: Vendor) => {
    const newStatus = vendor.status === "active" ? "inactive" : "active";
    await updateVendor(vendor.id, { status: newStatus });
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Vendors</h1>
          <p className="text-sm text-muted-foreground">Manage content vendors and partners</p>
        </div>
        <Button size="sm" className="gap-1.5 h-8" onClick={openCreateDialog}>
          <Plus className="h-3.5 w-3.5" />
          Add Vendor
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-display text-xl font-bold">{stats.total}</p>
        </div>
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="font-display text-xl font-bold text-success">{stats.active}</p>
        </div>
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="font-display text-xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="glass-card rounded-lg p-3">
          <p className="text-xs text-muted-foreground">Content Queue</p>
          <p className="font-display text-xl font-bold text-primary">{stats.pendingContent}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card flex flex-col gap-3 rounded-lg p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[130px] h-8 text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vendors Table */}
      <div className="glass-card overflow-hidden rounded-lg">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Building2 className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-2 text-sm text-muted-foreground">No vendors found</p>
            <Button size="sm" variant="outline" className="mt-3 h-8" onClick={openCreateDialog}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add First Vendor
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground">
                    Vendor
                  </th>
                  <th className="hidden px-3 py-2 text-left text-xs font-medium uppercase text-muted-foreground md:table-cell">
                    Contact
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium uppercase text-muted-foreground">
                    Content
                  </th>
                  <th className="hidden px-3 py-2 text-center text-xs font-medium uppercase text-muted-foreground sm:table-cell">
                    Commission
                  </th>
                  <th className="px-3 py-2 text-center text-xs font-medium uppercase text-muted-foreground">
                    Active
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-medium uppercase text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVendors.map((vendor) => {
                  const StatusIcon = statusConfig[vendor.status].icon;
                  return (
                    <tr key={vendor.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-[10px] text-primary-foreground">
                              {vendor.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{vendor.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {vendor.company_name || vendor.email}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`ml-1 hidden text-[10px] px-1.5 py-0 lg:inline-flex ${statusConfig[vendor.status].style}`}
                          >
                            <StatusIcon className="mr-0.5 h-2.5 w-2.5" />
                            {statusConfig[vendor.status].label}
                          </Badge>
                        </div>
                      </td>
                      <td className="hidden px-3 py-2.5 md:table-cell">
                        <div className="space-y-0.5">
                          <p className="text-xs text-muted-foreground">{vendor.email}</p>
                          {vendor.phone && (
                            <p className="text-xs text-muted-foreground">{vendor.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="text-sm font-medium">{vendor.total_content}</span>
                          {vendor.pending_content > 0 && (
                            <Badge
                              variant="outline"
                              className="bg-warning/10 text-warning border-warning/20 text-[10px] px-1 py-0"
                            >
                              +{vendor.pending_content}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="hidden px-3 py-2.5 text-center sm:table-cell">
                        <span className="text-sm">{vendor.commission_rate || 0}%</span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex justify-center">
                          <Switch
                            checked={vendor.status === "active"}
                            onCheckedChange={() => handleStatusToggle(vendor)}
                            className="scale-75"
                            disabled={vendor.status === "suspended"}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => openViewDialog(vendor)}>
                              <Eye className="mr-2 h-3.5 w-3.5" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(vendor)}>
                              <Edit className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={`mailto:${vendor.email}`}>
                                <Mail className="mr-2 h-3.5 w-3.5" />
                                Send Email
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openDeleteDialog(vendor)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
            <DialogDescription>
              {editingVendor
                ? "Update vendor information"
                : "Enter the details for the new vendor"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Vendor name"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="company" className="text-xs">
                  Company
                </Label>
                <Input
                  id="company"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Company name"
                  className="h-8 text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="status" className="text-xs">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: VendorFormData["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="commission" className="text-xs">
                  Commission (%)
                </Label>
                <div className="relative">
                  <Input
                    id="commission"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={formData.commission_rate}
                    onChange={(e) =>
                      setFormData({ ...formData, commission_rate: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 pr-7 text-sm"
                  />
                  <Percent className="absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs">
                Address
              </Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Business address"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs">
                Notes
              </Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={2}
                className="text-sm resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={isSaving || !formData.name.trim() || !formData.email.trim()}
            >
              {isSaving && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
              {editingVendor ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {viewingVendor && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground">
                    {viewingVendor.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{viewingVendor.name}</h3>
                  <Badge
                    variant="outline"
                    className={statusConfig[viewingVendor.status].style}
                  >
                    {statusConfig[viewingVendor.status].label}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-3 rounded-lg bg-secondary/30 p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{viewingVendor.email}</span>
                </div>
                {viewingVendor.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{viewingVendor.phone}</span>
                  </div>
                )}
                {viewingVendor.company_name && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{viewingVendor.company_name}</span>
                  </div>
                )}
                {viewingVendor.address && (
                  <p className="text-muted-foreground">{viewingVendor.address}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground">Content</p>
                  <p className="text-lg font-bold">{viewingVendor.total_content}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="text-lg font-bold text-warning">{viewingVendor.pending_content}</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2.5 text-center">
                  <p className="text-xs text-muted-foreground">Commission</p>
                  <p className="text-lg font-bold">{viewingVendor.commission_rate || 0}%</p>
                </div>
              </div>

              {viewingVendor.notes && (
                <div className="rounded-lg bg-secondary/30 p-3">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{viewingVendor.notes}</p>
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Joined {format(new Date(viewingVendor.created_at), "MMM d, yyyy")}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIsViewOpen(false)}>
              Close
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsViewOpen(false);
                if (viewingVendor) openEditDialog(viewingVendor);
              }}
            >
              <Edit className="mr-1.5 h-3.5 w-3.5" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vendor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingVendor?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
