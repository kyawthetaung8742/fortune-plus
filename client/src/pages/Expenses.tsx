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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import DataTable from "@/components/shared/DataTable";
import ActionDropdown from "@/components/shared/ActionDropdown";
import { expenseApi } from "@/api/expense";
import { shareholderApi } from "@/api/shareholder";
import { paymentApi } from "@/api/payment";
import type { Expense } from "@/types/app";
import type { Shareholder } from "@/types/app";
import type { Payment } from "@/types/app";
import { PaymentSelect } from "@/components/shared/PaymentSelect";
import { toast } from "sonner";

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);
  const [createForm, setCreateForm] = useState({
    shareholder_id: "",
    payment_id: "",
    date: new Date().toISOString().slice(0, 10),
    amount: "",
    note: "",
  });

  const fetchExpenses = async () => {
    try {
      const res = await expenseApi.list();
      if (res.data.success && res.data.data) setExpenses(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load expenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const [shRes, pRes] = await Promise.all([
        shareholderApi.list(),
        paymentApi.list(),
      ]);
      if (shRes.data.success && shRes.data.data)
        setShareholders(shRes.data.data);
      if (pRes.data.success && pRes.data.data) setPayments(pRes.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load options");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    if (createOpen) fetchOptions();
  }, [createOpen]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(createForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!createForm.shareholder_id || !createForm.payment_id) {
      toast.error("Please select shareholder and payment");
      return;
    }
    try {
      await expenseApi.create({
        shareholder_id: createForm.shareholder_id,
        payment_id: createForm.payment_id,
        date: createForm.date,
        amount,
        note: createForm.note || undefined,
      });
      toast.success("Expense recorded");
      setCreateOpen(false);
      setCreateForm({
        shareholder_id: "",
        payment_id: "",
        date: new Date().toISOString().slice(0, 10),
        amount: "",
        note: "",
      });
      fetchExpenses();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  const handleDeleteClick = (row: Expense) => {
    setExpenseToDelete(row);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!expenseToDelete) return;
    try {
      await expenseApi.delete(expenseToDelete._id);
      toast.success("Expense deleted");
      setDeleteOpen(false);
      setExpenseToDelete(null);
      fetchExpenses();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const getShareholderName = (row: Expense) => {
    const sh = row.shareholder_id;
    return typeof sh === "object" && sh !== null && "name" in sh
      ? sh.name
      : "—";
  };

  const getPaymentName = (row: Expense) => {
    const p = row.payment_id;
    return typeof p === "object" && p !== null && "name" in p ? p.name : "—";
  };

  const columns: ColumnDef<Expense>[] = [
    {
      id: "shareholder",
      header: "Shareholder",
      cell: ({ row }) => getShareholderName(row.original),
    },
    {
      id: "payment",
      header: "Payment",
      cell: ({ row }) => getPaymentName(row.original),
    },
    {
      accessorKey: "date",
      header: "Date",
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => row.original.amount.toLocaleString(),
    },
    {
      accessorKey: "note",
      header: "Note",
      cell: ({ row }) => (
        <span
          className="max-w-[200px] truncate block"
          title={row.original.note}
        >
          {row.original.note || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionDropdown onDelete={() => handleDeleteClick(row.original)} />
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Button
          onClick={() => {
            setCreateForm({
              shareholder_id: "",
              payment_id: "",
              date: new Date().toISOString().slice(0, 10),
              amount: "",
              note: "",
            });
            setCreateOpen(true);
          }}
        >
          Add Expense
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={expenses} />
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div>
              <Label>Shareholder</Label>
              <select
                value={createForm.shareholder_id}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    shareholder_id: e.target.value,
                  }))
                }
                required
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
              >
                <option value="">Select shareholder</option>
                {shareholders.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="expense-payment">Payment</Label>
              <div className="mt-1">
                <PaymentSelect
                  id="expense-payment"
                  value={createForm.payment_id}
                  onChange={(id) =>
                    setCreateForm((f) => ({ ...f, payment_id: id }))
                  }
                  payments={payments}
                  allowEmpty
                  emptyLabel="Select payment"
                  placeholder="Select payment"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="expense-date">Date</Label>
              <Input
                id="expense-date"
                type="date"
                value={createForm.date}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, date: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expense-amount">Amount</Label>
              <Input
                id="expense-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={createForm.amount}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="expense-note">Note</Label>
              <Textarea
                id="expense-note"
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

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete expense?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reverse the expense: the amount will be added back to the
              shareholder&apos;s wallet and a transaction will be recorded. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
