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
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { shareholderApi } from "@/api/shareholder";
import { paymentApi } from "@/api/payment";
import type { Shareholder, Payment } from "@/types/app";
import { toast } from "sonner";

const Shareholders = () => {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedShareholder, setSelectedShareholder] =
    useState<Shareholder | null>(null);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [createForm, setCreateForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  });
  const [amountForm, setAmountForm] = useState({
    payment_id: "",
    amount: "",
    note: "",
  });
  const [transferForm, setTransferForm] = useState({
    payment_id: "",
    to_shareholder_id: "",
    to_payment_id: "",
    amount: "",
    note: "",
  });
  const fetchShareholders = async () => {
    try {
      const res = await shareholderApi.list();
      if (res.data.success && res.data.data) setShareholders(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load shareholders");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await paymentApi.list();
      if (res.data.success && res.data.data) setPayments(res.data.data);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Failed to load payments");
    }
  };

  useEffect(() => {
    fetchShareholders();
    fetchPayments();
  }, []);

  const openEdit = (row: Shareholder) => {
    setSelectedShareholder(row);
    setEditForm({
      name: row.name,
      phone: row.phone ?? "",
      email: row.email ?? "",
      address: row.address ?? "",
    });
    setEditOpen(true);
  };

  const openDeposit = (row: Shareholder) => {
    setSelectedShareholder(row);
    setAmountForm({ payment_id: "", amount: "", note: "" });
    setDepositOpen(true);
  };

  const openWithdraw = (row: Shareholder) => {
    setSelectedShareholder(row);
    setAmountForm({ payment_id: "", amount: "", note: "" });
    setWithdrawOpen(true);
  };

  const openTransfer = (row: Shareholder) => {
    setSelectedShareholder(row);
    setTransferForm({
      payment_id: "",
      to_shareholder_id: "",
      to_payment_id: "",
      amount: "",
      note: "",
    });
    setTransferOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await shareholderApi.create({
        name: createForm.name,
        phone: createForm.phone || undefined,
        email: createForm.email || undefined,
        address: createForm.address || undefined,
      });
      toast.success("Shareholder created");
      setCreateOpen(false);
      setCreateForm({ name: "", phone: "", email: "", address: "" });
      fetchShareholders();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Create failed");
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShareholder) return;
    try {
      await shareholderApi.update(selectedShareholder._id, {
        name: editForm.name,
        phone: editForm.phone || undefined,
        email: editForm.email || undefined,
        address: editForm.address || undefined,
      });
      toast.success("Shareholder updated");
      setEditOpen(false);
      fetchShareholders();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDepositSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShareholder || !amountForm.payment_id || !amountForm.amount) {
      toast.error("Select payment and enter amount");
      return;
    }
    const amount = parseFloat(amountForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await shareholderApi.deposit(selectedShareholder._id, {
        payment_id: amountForm.payment_id,
        amount,
        note: amountForm.note || undefined,
      });
      toast.success("Deposit completed");
      setDepositOpen(false);
      fetchShareholders();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Deposit failed");
    }
  };

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShareholder || !amountForm.payment_id || !amountForm.amount) {
      toast.error("Select payment and enter amount");
      return;
    }
    const amount = parseFloat(amountForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      await shareholderApi.withdraw(selectedShareholder._id, {
        payment_id: amountForm.payment_id,
        amount,
        note: amountForm.note || undefined,
      });
      toast.success("Withdraw completed");
      setWithdrawOpen(false);
      fetchShareholders();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Withdraw failed");
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !selectedShareholder ||
      !transferForm.payment_id ||
      !transferForm.to_shareholder_id ||
      !transferForm.amount
    ) {
      toast.error("Select payment, recipient and enter amount");
      return;
    }
    const amount = parseFloat(transferForm.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    if (transferForm.to_shareholder_id === selectedShareholder._id) {
      toast.error("Cannot transfer to same shareholder");
      return;
    }
    try {
      await shareholderApi.transfer(selectedShareholder._id, {
        payment_id: transferForm.payment_id,
        to_shareholder_id: transferForm.to_shareholder_id,
        to_payment_id: transferForm.to_payment_id || undefined,
        amount,
        note: transferForm.note || undefined,
      });
      toast.success("Transfer completed");
      setTransferOpen(false);
      fetchShareholders();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Transfer failed");
    }
  };

  const columns: ColumnDef<Shareholder>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "phone", header: "Phone" },
    { accessorKey: "email", header: "Email" },
    { accessorKey: "address", header: "Address" },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionDropdown
          onEdit={() => openEdit(row.original)}
          customItems={
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openDeposit(row.original)}
              >
                Deposit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openWithdraw(row.original)}
              >
                Withdraw
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => openTransfer(row.original)}
              >
                Transfer
              </DropdownMenuItem>
            </>
          }
        />
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Shareholders</h1>
        <Button
          onClick={() => {
            setCreateForm({ name: "", phone: "", email: "", address: "" });
            setCreateOpen(true);
          }}
        >
          Add Shareholder
        </Button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <DataTable columns={columns} data={shareholders} />
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Shareholder</DialogTitle>
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
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                value={createForm.email}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, email: e.target.value }))
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
            <DialogTitle>Edit Shareholder</DialogTitle>
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
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((f) => ({ ...f, email: e.target.value }))
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

      {/* Deposit Dialog */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Deposit{" "}
              {selectedShareholder ? `— ${selectedShareholder.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            <div>
              <Label>Payment (currency)</Label>
              <select
                value={amountForm.payment_id}
                onChange={(e) =>
                  setAmountForm((f) => ({ ...f, payment_id: e.target.value }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select payment —</option>
                {payments.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.currency_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="deposit-amount">Amount</Label>
              <Input
                id="deposit-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amountForm.amount}
                onChange={(e) =>
                  setAmountForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="deposit-note">Note</Label>
              <Input
                id="deposit-note"
                value={amountForm.note}
                onChange={(e) =>
                  setAmountForm((f) => ({ ...f, note: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDepositOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Deposit</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Withdraw{" "}
              {selectedShareholder ? `— ${selectedShareholder.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div>
              <Label>Payment (currency)</Label>
              <select
                value={amountForm.payment_id}
                onChange={(e) =>
                  setAmountForm((f) => ({ ...f, payment_id: e.target.value }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select payment —</option>
                {payments.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.currency_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="withdraw-amount">Amount</Label>
              <Input
                id="withdraw-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amountForm.amount}
                onChange={(e) =>
                  setAmountForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="withdraw-note">Note</Label>
              <Input
                id="withdraw-note"
                value={amountForm.note}
                onChange={(e) =>
                  setAmountForm((f) => ({ ...f, note: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setWithdrawOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Withdraw</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Transfer{" "}
              {selectedShareholder ? `— From ${selectedShareholder.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="space-y-4">
            <div>
              <Label>Payment (currency)</Label>
              <select
                value={transferForm.payment_id}
                onChange={(e) =>
                  setTransferForm((f) => ({
                    ...f,
                    payment_id: e.target.value,
                    to_payment_id: "",
                  }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select payment —</option>
                {payments.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.currency_type})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Transfer to</Label>
              <select
                value={transferForm.to_shareholder_id}
                onChange={(e) =>
                  setTransferForm((f) => ({
                    ...f,
                    to_shareholder_id: e.target.value,
                    to_payment_id: "",
                  }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
              >
                <option value="">— Select shareholder —</option>
                {shareholders
                  .filter((s) => s._id !== selectedShareholder?._id)
                  .map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <Label>To payment (same currency)</Label>
              <select
                value={transferForm.to_payment_id}
                onChange={(e) =>
                  setTransferForm((f) => ({ ...f, to_payment_id: e.target.value }))
                }
                className="w-full border rounded px-3 py-2 mt-1 text-sm"
                required
                disabled={!transferForm.payment_id}
              >
                <option value="">— Select payment —</option>
                {(() => {
                  const fromPayment = payments.find(
                    (p) => p._id === transferForm.payment_id
                  );
                  const currencyType = (fromPayment?.currency_type || "").toLowerCase();
                  if (!currencyType) return null;
                  return payments
                    .filter(
                      (p) => (p.currency_type || "").toLowerCase() === currencyType
                    )
                    .map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.currency_type})
                      </option>
                    ));
                })()}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                Choose which payment/wallet the recipient receives into (same currency type).
              </p>
            </div>
            <div>
              <Label htmlFor="transfer-amount">Amount</Label>
              <Input
                id="transfer-amount"
                type="number"
                step="0.01"
                min="0.01"
                value={transferForm.amount}
                onChange={(e) =>
                  setTransferForm((f) => ({ ...f, amount: e.target.value }))
                }
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="transfer-note">Note</Label>
              <Input
                id="transfer-note"
                value={transferForm.note}
                onChange={(e) =>
                  setTransferForm((f) => ({ ...f, note: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setTransferOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Transfer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shareholders;
