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
import { categoryApi } from "@/api/category";
import type { Category } from "@/types/app";
import { toast } from "sonner";

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", is_sale: false });
  const [editForm, setEditForm] = useState({ name: "", is_sale: false });

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      if (res.data.success && res.data.data) setCategories(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openEdit = (row: Category) => {
    setSelectedCategory(row);
    setEditForm({ name: row.name, is_sale: row.is_sale ?? false });
    setEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryApi.create({ name: createForm.name, is_sale: createForm.is_sale });
      toast.success("Category created");
      setCreateOpen(false);
      setCreateForm({ name: "", is_sale: false });
      fetchCategories();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    try {
      await categoryApi.update(selectedCategory._id, { name: editForm.name, is_sale: editForm.is_sale });
      toast.success("Category updated");
      setEditOpen(false);
      fetchCategories();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "is_sale",
      header: "Is Sale",
      cell: ({ row }) => (row.original.is_sale ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => <ActionDropdown onEdit={() => openEdit(row.original)} />,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Categories</h1>
        <Button onClick={() => { setCreateForm({ name: "", is_sale: false }); setCreateOpen(true); }}>
          Add Category
        </Button>
      </div>
      {loading ? <p>Loading...</p> : <DataTable columns={columns} data={categories} />}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label htmlFor="create-name">Name</Label>
              <Input id="create-name" value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} required className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="create-is_sale" checked={createForm.is_sale} onChange={(e) => setCreateForm((f) => ({ ...f, is_sale: e.target.checked }))} />
              <Label htmlFor="create-is_sale">Show in sale (is_sale)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} required className="mt-1" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="edit-is_sale" checked={editForm.is_sale} onChange={(e) => setEditForm((f) => ({ ...f, is_sale: e.target.checked }))} />
              <Label htmlFor="edit-is_sale">Show in sale (is_sale)</Label>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
