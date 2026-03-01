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
import { productApi } from "@/api/product";
import { categoryApi } from "@/api/category";
import type { Product } from "@/types/app";
import type { Category } from "@/types/app";
import { toast } from "sonner";

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [createForm, setCreateForm] = useState({
    category_id: "",
    name: "",
    quantity: "0",
    image: "",
    purchase_price: "",
    sale_price: "",
    note: "",
  });
  const [editForm, setEditForm] = useState({
    category_id: "",
    name: "",
    quantity: "0",
    image: "",
    purchase_price: "",
    sale_price: "",
    note: "",
  });
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const fetchProducts = async () => {
    try {
      const res = await productApi.list();
      if (res.data.success && res.data.data) setProducts(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list();
      if (res.data.success && res.data.data) setCategories(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load categories");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (createOpen || editOpen) fetchCategories();
  }, [createOpen, editOpen]);

  const openEdit = (row: Product) => {
    setSelectedProduct(row);
    const catId =
      typeof row.category_id === "object" && row.category_id
        ? row.category_id._id
        : row.category_id;
    setEditForm({
      category_id: catId,
      name: row.name,
      quantity: String(row.quantity),
      image: row.image ?? "",
      purchase_price: String(row.purchase_price),
      sale_price: String(row.sale_price),
      note: row.note ?? "",
    });
    setEditImageFile(null);
    setEditOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const quantity = parseInt(createForm.quantity, 10);
    const purchase_price = parseFloat(createForm.purchase_price);
    const sale_price = parseFloat(createForm.sale_price);
    if (
      isNaN(quantity) ||
      quantity < 0 ||
      isNaN(purchase_price) ||
      purchase_price < 0 ||
      isNaN(sale_price) ||
      sale_price < 0
    ) {
      toast.error("Please enter valid numbers");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("category_id", createForm.category_id);
      formData.append("name", createForm.name);
      formData.append("quantity", String(quantity));
      formData.append("purchase_price", String(purchase_price));
      formData.append("sale_price", String(sale_price));
      if (createForm.note) formData.append("note", createForm.note);
      if (createImageFile) formData.append("image", createImageFile);
      await productApi.create(formData);
      toast.success("Product created");
      setCreateOpen(false);
      setCreateForm({
        category_id: "",
        name: "",
        quantity: "0",
        image: "",
        purchase_price: "",
        sale_price: "",
        note: "",
      });
      setCreateImageFile(null);
      fetchProducts();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const quantity = parseInt(editForm.quantity, 10);
    const purchase_price = parseFloat(editForm.purchase_price);
    const sale_price = parseFloat(editForm.sale_price);
    if (
      isNaN(quantity) ||
      quantity < 0 ||
      isNaN(purchase_price) ||
      purchase_price < 0 ||
      isNaN(sale_price) ||
      sale_price < 0
    ) {
      toast.error("Please enter valid numbers");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("category_id", editForm.category_id);
      formData.append("name", editForm.name);
      formData.append("quantity", String(quantity));
      formData.append("purchase_price", String(purchase_price));
      formData.append("sale_price", String(sale_price));
      if (editForm.note) formData.append("note", editForm.note);
      if (editImageFile) formData.append("image", editImageFile);
      await productApi.update(selectedProduct._id, formData);
      toast.success("Product updated");
      setEditOpen(false);
      setEditImageFile(null);
      fetchProducts();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const getCategoryName = (row: Product) => {
    const c = row.category_id;
    return typeof c === "object" && c !== null && "name" in c ? c.name : "—";
  };

  const columns: ColumnDef<Product>[] = [
    { id: "category", header: "Category", cell: ({ row }) => getCategoryName(row.original) },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "quantity", header: "Quantity" },
    { accessorKey: "purchase_price", header: "Purchase Price", cell: ({ row }) => row.original.purchase_price.toLocaleString() },
    { accessorKey: "sale_price", header: "Sale Price", cell: ({ row }) => row.original.sale_price.toLocaleString() },
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
        <h1 className="text-2xl font-semibold">Products</h1>
        <Button
          onClick={() => {
            setCreateForm({
              category_id: "",
              name: "",
              quantity: "0",
              image: "",
              purchase_price: "",
              sale_price: "",
              note: "",
            });
            setCreateImageFile(null);
            setCreateOpen(true);
          }}
        >
          Add Product
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={products} />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label>Category</Label>
              <select
                value={createForm.category_id}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, category_id: e.target.value }))
                }
                required
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
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
              <Label htmlFor="create-quantity">Quantity</Label>
              <Input
                id="create-quantity"
                type="number"
                min="0"
                value={createForm.quantity}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, quantity: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Image</Label>
              <div className="mt-1 space-y-2">
                <Input
                  id="create-image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setCreateImageFile(file || null);
                    e.target.value = "";
                  }}
                  className="cursor-pointer"
                />
                {(createImageFile || createForm.image) && (
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        createImageFile
                          ? URL.createObjectURL(createImageFile)
                          : createForm.image
                      }
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCreateImageFile(null);
                        setCreateForm((f) => ({ ...f, image: "" }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="create-purchase_price">Purchase Price</Label>
              <Input
                id="create-purchase_price"
                type="number"
                min="0"
                step="0.01"
                value={createForm.purchase_price}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, purchase_price: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-sale_price">Sale Price</Label>
              <Input
                id="create-sale_price"
                type="number"
                min="0"
                step="0.01"
                value={createForm.sale_price}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, sale_price: e.target.value }))
                }
                required
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
                className="mt-1 min-h-[60px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label>Category</Label>
              <select
                value={editForm.category_id}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, category_id: e.target.value }))
                }
                required
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
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
              <Label htmlFor="edit-quantity">Quantity</Label>
              <Input
                id="edit-quantity"
                type="number"
                min="0"
                value={editForm.quantity}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, quantity: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label>Image</Label>
              <div className="mt-1 space-y-2">
                <Input
                  id="edit-image"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setEditImageFile(file || null);
                    e.target.value = "";
                  }}
                  className="cursor-pointer"
                />
                {(editImageFile || editForm.image) && (
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        editImageFile
                          ? URL.createObjectURL(editImageFile)
                          : editForm.image
                      }
                      alt="Preview"
                      className="h-20 w-20 object-cover rounded border"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditImageFile(null);
                        setEditForm((f) => ({ ...f, image: "" }));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="edit-purchase_price">Purchase Price</Label>
              <Input
                id="edit-purchase_price"
                type="number"
                min="0"
                step="0.01"
                value={editForm.purchase_price}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, purchase_price: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-sale_price">Sale Price</Label>
              <Input
                id="edit-sale_price"
                type="number"
                min="0"
                step="0.01"
                value={editForm.sale_price}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, sale_price: e.target.value }))
                }
                required
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
                className="mt-1 min-h-[60px]"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
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

export default Products;
