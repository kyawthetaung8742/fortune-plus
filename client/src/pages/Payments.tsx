import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import DataTable from "@/components/shared/DataTable";
import ActionDropdown from "@/components/shared/ActionDropdown";
import { paymentApi } from "@/api/payment";
import type { Payment } from "@/types/app";
import { toast } from "sonner";

const CURRENCY_OPTIONS: { value: Payment["currency_type"]; label: string }[] = [
  { value: "kyat", label: "Kyat" },
  { value: "baht", label: "Baht" },
];

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    currency_type: "kyat" as Payment["currency_type"],
  });
  const [editForm, setEditForm] = useState({
    name: "",
    currency_type: "kyat" as Payment["currency_type"],
  });
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null);
  const [createLogoPreview, setCreateLogoPreview] = useState<string | null>(null);
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);
  const [editLogoPreview, setEditLogoPreview] = useState<string | null>(null);
  const [removeEditLogo, setRemoveEditLogo] = useState(false);

  const fetchPayments = async () => {
    try {
      const res = await paymentApi.list();
      if (res.data.success && res.data.data) setPayments(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    if (!createLogoFile) {
      setCreateLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(createLogoFile);
    setCreateLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [createLogoFile]);

  useEffect(() => {
    if (!editLogoFile) {
      setEditLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(editLogoFile);
    setEditLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [editLogoFile]);

  const openEdit = (row: Payment) => {
    setSelectedPayment(row);
    setEditForm({ name: row.name, currency_type: row.currency_type });
    setEditLogoFile(null);
    setRemoveEditLogo(false);
    setEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", createForm.name);
      fd.append("currency_type", createForm.currency_type);
      if (createLogoFile) fd.append("logo", createLogoFile);
      await paymentApi.create(fd);
      toast.success("Payment created");
      setCreateOpen(false);
      setCreateForm({ name: "", currency_type: "kyat" });
      setCreateLogoFile(null);
      fetchPayments();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    try {
      const fd = new FormData();
      fd.append("name", editForm.name);
      fd.append("currency_type", editForm.currency_type);
      if (editLogoFile) fd.append("logo", editLogoFile);
      else if (removeEditLogo) fd.append("clear_logo", "true");
      await paymentApi.update(selectedPayment._id, fd);
      toast.success("Payment updated");
      setEditOpen(false);
      setEditLogoFile(null);
      setRemoveEditLogo(false);
      fetchPayments();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const columns: ColumnDef<Payment>[] = [
    {
      id: "logo",
      header: "Logo",
      cell: ({ row }) =>
        row.original.logo_url ? (
          <img
            src={row.original.logo_url}
            alt=""
            className="h-8 w-8 rounded object-contain bg-muted/50"
          />
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        ),
    },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "currency_type",
      header: "Currency Type",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.currency_type}</span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionDropdown onEdit={() => openEdit(row.original)} />
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <Button
          onClick={() => {
            setCreateForm({ name: "", currency_type: "kyat" });
            setCreateLogoFile(null);
            setCreateOpen(true);
          }}
        >
          Add Payment
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={payments} />
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Currency Type</Label>
              <select
                value={createForm.currency_type}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    currency_type: e.target.value as Payment["currency_type"],
                  }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="create-logo">Bank logo (optional)</Label>
              <Input
                id="create-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="mt-1"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setCreateLogoFile(f ?? null);
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WebP, GIF, or SVG. Max 2MB on server.
              </p>
              {createLogoPreview && (
                <img
                  src={createLogoPreview}
                  alt="Preview"
                  className="mt-2 h-16 w-16 rounded object-contain border bg-muted/30"
                />
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreateOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, name: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Currency Type</Label>
              <select
                value={editForm.currency_type}
                onChange={(e) =>
                  setEditForm((f) => ({
                    ...f,
                    currency_type: e.target.value as Payment["currency_type"],
                  }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
              >
                {CURRENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="edit-logo">Bank logo</Label>
              {selectedPayment?.logo_url && !editLogoFile && !removeEditLogo && (
                <img
                  src={selectedPayment.logo_url}
                  alt=""
                  className="mt-2 h-16 w-16 rounded object-contain border bg-muted/30"
                />
              )}
              {editLogoPreview && (
                <img
                  src={editLogoPreview}
                  alt="New preview"
                  className="mt-2 h-16 w-16 rounded object-contain border bg-muted/30"
                />
              )}
              <Input
                id="edit-logo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                className="mt-2"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setEditLogoFile(f ?? null);
                  if (f) setRemoveEditLogo(false);
                }}
              />
              {selectedPayment?.logo_url && (
                <div className="flex items-center gap-2 mt-3">
                  <Checkbox
                    id="remove-logo"
                    checked={removeEditLogo}
                    onCheckedChange={(c) => {
                      setRemoveEditLogo(c === true);
                      if (c === true) setEditLogoFile(null);
                    }}
                  />
                  <Label htmlFor="remove-logo" className="font-normal cursor-pointer">
                    Remove current logo
                  </Label>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payments;
