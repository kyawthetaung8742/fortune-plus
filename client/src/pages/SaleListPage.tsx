import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DataTable from "@/components/shared/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { saleListApi, type SaleListListParams } from "@/api/saleList";
import { categoryApi } from "@/api/category";
import { productApi } from "@/api/product";
import type { SaleListItem } from "@/types/app";
import type { Category } from "@/types/app";
import type { Product } from "@/types/app";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PopulatedProduct = {
  _id: string;
  name?: string;
  image?: string;
  sale_price?: number;
  category_id?: { _id: string; name?: string } | string;
};

const SaleListPage = () => {
  const [data, setData] = useState<SaleListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState<SaleListListParams>({
    page: 1,
    limit: 20,
  });
  const [filterForm, setFilterForm] = useState({
    from: "",
    to: "",
    category_id: "",
    product_id: "",
    currency_type: "" as "" | "kyat" | "baht",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.list();
      if (res.data.success && res.data.data) setCategories(res.data.data);
    } catch {
      // ignore
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productApi.list();
      if (res.data.success && res.data.data) setProducts(res.data.data);
    } catch {
      // ignore
    }
  }, []);

  const fetchSaleList = useCallback(async () => {
    setLoading(true);
    try {
      const params: SaleListListParams = {
        page: queryParams.page,
        limit: queryParams.limit,
      };
      if (queryParams.from) params.from = queryParams.from;
      if (queryParams.to) params.to = queryParams.to;
      if (queryParams.category_id) params.category_id = queryParams.category_id;
      if (queryParams.product_id) params.product_id = queryParams.product_id;
      if (queryParams.currency_type) params.currency_type = queryParams.currency_type;

      const res = await saleListApi.list(params);
      if (res.data.success && res.data.data) {
        setData(res.data.data);
        setTotal(res.data.total);
        setPage(res.data.page);
        setLimit(res.data.limit);
        setTotalPages(res.data.totalPages);
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load sale list");
    } finally {
      setLoading(false);
    }
  }, [queryParams.page, queryParams.limit, queryParams.from, queryParams.to, queryParams.category_id, queryParams.product_id, queryParams.currency_type]);

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    fetchSaleList();
  }, [fetchSaleList]);

  const handleApplyFilters = () => {
    setQueryParams((prev) => ({
      ...prev,
      from: filterForm.from || undefined,
      to: filterForm.to || undefined,
      category_id: filterForm.category_id || undefined,
      product_id: filterForm.product_id || undefined,
      currency_type: filterForm.currency_type || undefined,
      page: 1,
      limit: prev.limit ?? 20,
    }));
  };

  const getProductName = (row: SaleListItem) => {
    const p = row.product_id;
    return typeof p === "object" && p !== null && "name" in p ? (p as PopulatedProduct).name : "—";
  };

  const getCategoryName = (row: SaleListItem) => {
    const p = row.product_id;
    if (typeof p !== "object" || !p || !("category_id" in p)) return "—";
    const c = (p as PopulatedProduct).category_id;
    return typeof c === "object" && c !== null && "name" in c ? (c as { name?: string }).name : "—";
  };

  const getCustomerName = (row: SaleListItem) => {
    const c = row.customer_id;
    return typeof c === "object" && c !== null && "name" in c ? (c as { name?: string }).name : "—";
  };

  const columns: ColumnDef<SaleListItem>[] = [
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => getCategoryName(row.original),
    },
    {
      id: "product",
      header: "Product",
      cell: ({ row }) => getProductName(row.original),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => getCustomerName(row.original),
    },
    {
      accessorKey: "currency_type",
      header: "Currency",
      cell: ({ row }) => (
        <span className="capitalize">{row.original.currency_type}</span>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) =>
        row.original.rate != null ? row.original.rate : "—",
    },
    {
      accessorKey: "quantity",
      header: "Qty",
    },
    {
      accessorKey: "sale_price",
      header: "Sale Price",
      cell: ({ row }) => row.original.sale_price.toLocaleString(),
    },
    {
      id: "subtotal",
      header: "Subtotal",
      cell: ({ row }) =>
        (row.original.sale_price * row.original.quantity).toLocaleString(),
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <span className="max-w-[120px] truncate block" title={row.original.note}>
          {row.original.note || "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Sale List</h1>

      <div className="flex flex-wrap items-end gap-4 p-4 rounded-lg border bg-muted/30">
        <div>
          <Label htmlFor="filter-from">Date From</Label>
          <Input
            id="filter-from"
            type="date"
            className="mt-1 w-[160px]"
            value={filterForm.from}
            onChange={(e) =>
              setFilterForm((prev) => ({ ...prev, from: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="filter-to">Date To</Label>
          <Input
            id="filter-to"
            type="date"
            className="mt-1 w-[160px]"
            value={filterForm.to}
            onChange={(e) =>
              setFilterForm((prev) => ({ ...prev, to: e.target.value }))
            }
          />
        </div>
        <div>
          <Label htmlFor="filter-category">Category</Label>
          <select
            id="filter-category"
            className={cn(
              "mt-1 w-[160px] border rounded-md px-3 py-2 text-sm",
              "bg-background"
            )}
            value={filterForm.category_id}
            onChange={(e) =>
              setFilterForm((prev) => ({ ...prev, category_id: e.target.value }))
            }
          >
            <option value="">All</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="filter-product">Product</Label>
          <select
            id="filter-product"
            className={cn(
              "mt-1 w-[160px] border rounded-md px-3 py-2 text-sm",
              "bg-background"
            )}
            value={filterForm.product_id}
            onChange={(e) =>
              setFilterForm((prev) => ({ ...prev, product_id: e.target.value }))
            }
          >
            <option value="">All</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="filter-currency">Currency</Label>
          <select
            id="filter-currency"
            className={cn(
              "mt-1 w-[120px] border rounded-md px-3 py-2 text-sm",
              "bg-background"
            )}
            value={filterForm.currency_type}
            onChange={(e) =>
              setFilterForm((prev) => ({
                ...prev,
                currency_type: e.target.value as "" | "kyat" | "baht",
              }))
            }
          >
            <option value="">All</option>
            <option value="kyat">Kyat</option>
            <option value="baht">Baht</option>
          </select>
        </div>
        <Button onClick={handleApplyFilters}>Apply</Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <DataTable columns={columns} data={data} />
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of{" "}
              {total}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() =>
                  setQueryParams((prev) => ({ ...prev, page: prev.page! - 1 }))
                }
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() =>
                  setQueryParams((prev) => ({ ...prev, page: prev.page! + 1 }))
                }
              >
                Next
              </Button>
              <select
                value={limit}
                onChange={(e) =>
                  setQueryParams((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    page: 1,
                  }))
                }
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SaleListPage;
