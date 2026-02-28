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
import { Textarea } from "@/components/ui/textarea";
import DataTable from "@/components/shared/DataTable";
import ActionDropdown from "@/components/shared/ActionDropdown";
import { customerApi } from "@/api/customer";
import type { Customer } from "@/types/app";
import { toast } from "sonner";

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [createForm, setCreateForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });

  const fetchCustomers = async () => {
    try {
      const res = await customerApi.list();
      if (res.data.success && res.data.data) setCustomers(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const openEdit = (row: Customer) => {
    setSelectedCustomer(row);
    setEditForm({
      name: row.name,
      phone: row.phone ?? "",
      address: row.address ?? "",
      note: row.note ?? "",
    });
    setEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerApi.create({
        name: createForm.name,
        phone: createForm.phone || undefined,
        address: createForm.address || undefined,
        note: createForm.note || undefined,
      });
      toast.success("Customer created");
      setCreateOpen(false);
      setCreateForm({ name: "", phone: "", address: "", note: "" });
      fetchCustomers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await customerApi.update(selectedCustomer._id, {
        name: editForm.name,
        phone: editForm.phone || undefined,
        address: editForm.address || undefined,
        note: editForm.note || undefined,
      });
      toast.success("Customer updated");
      setEditOpen(false);
      fetchCustomers();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const columns: ColumnDef<Customer>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "address", header: "Address" },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block" title={row.original.note}>
          {row.original.note || "—"}
        </span>
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
        <h1 className="text-2xl font-semibold">Customers</h1>
        <Button
          onClick={() => {
            setCreateForm({ name: "", phone: "", address: "", note: "" });
            setCreateOpen(true);
          }}
        >
          Add Customer
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={customers} />
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
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
              <Label htmlFor="create-phone">Phone</Label>
              <Input
                id="create-phone"
                value={createForm.phone}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-address">Address</Label>
              <Input
                id="create-address"
                value={createForm.address}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, address: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-note">Note</Label>
              <Textarea
                id="create-note"
                value={createForm.note}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, note: e.target.value }))
                }
                className="mt-1 min-h-[80px]"
              />
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
            <DialogTitle>Edit Customer</DialogTitle>
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
              <Label htmlFor="edit-phone">Phone</Label>
              <Input
                id="edit-phone"
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, phone: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-address">Address</Label>
              <Input
                id="edit-address"
                value={editForm.address}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, address: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-note">Note</Label>
              <Textarea
                id="edit-note"
                value={editForm.note}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, note: e.target.value }))
                }
                className="mt-1 min-h-[80px]"
              />
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

export default Customers;
