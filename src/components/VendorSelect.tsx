import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useVendors } from "@/hooks/useVendors";

interface VendorSelectProps {
  value: string | null;
  onChange: (vendorId: string | null) => void;
  label?: string;
  required?: boolean;
}

export function VendorSelect({ value, onChange, label = "Content Vendor", required = false }: VendorSelectProps) {
  const { vendors, isLoading } = useVendors();
  const activeVendors = vendors.filter((v) => v.status === "active" || v.status === "pending");

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        {label} {required && "*"}
      </Label>
      <Select
        value={value || "none"}
        onValueChange={(val) => onChange(val === "none" ? null : val)}
        disabled={isLoading}
      >
        <SelectTrigger className="h-11">
          <SelectValue placeholder={isLoading ? "Loading vendors..." : "Select vendor"} />
        </SelectTrigger>
        <SelectContent className="bg-popover">
          <SelectItem value="none">No vendor (Internal)</SelectItem>
          {activeVendors.map((vendor) => (
            <SelectItem key={vendor.id} value={vendor.id}>
              <div className="flex items-center gap-2">
                <span>{vendor.name}</span>
                {vendor.company_name && (
                  <span className="text-xs text-muted-foreground">
                    ({vendor.company_name})
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Select the vendor who provided this content
      </p>
    </div>
  );
}
