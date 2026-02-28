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

  const openEdit = (row: Payment) => {
    setSelectedPayment(row);
    setEditForm({ name: row.name, currency_type: row.currency_type });
    setEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentApi.create({
        name: createForm.name,
        currency_type: createForm.currency_type,
      });
      toast.success("Payment created");
      setCreateOpen(false);
      setCreateForm({ name: "", currency_type: "kyat" });
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
      await paymentApi.update(selectedPayment._id, {
        name: editForm.name,
        currency_type: editForm.currency_type,
      });
      toast.success("Payment updated");
      setEditOpen(false);
      fetchPayments();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const columns: ColumnDef<Payment>[] = [
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
