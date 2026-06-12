import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilePlus, Search, MoreHorizontal, FileText, Trash2, Copy, Download, Upload } from "lucide-react";
import { format } from "date-fns";
import { Contract } from "@/types";
import { toast } from "sonner";

const statusColor: Record<Contract["status"], string> = {
  draft: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

export default function ContractsList() {
  const { contracts, loadData, deleteContract, addContract, isLoading } = useAppStore();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = contracts.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.client?.name?.toLowerCase().includes(q) ||
      c.client?.eventType?.toLowerCase().includes(q) ||
      String(c.quotationNumber).includes(q)
    );
  });

  const handleDuplicate = async (c: Contract) => {
    const dup: Contract = {
      ...c,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      quotationNumber: contracts.length + 1,
      status: "draft",
    };
    await addContract(dup);
    toast.success("Contract duplicated");
  };

  const handleExportJSON = (c: Contract) => {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${c.client?.name || "contract"}_Q${c.quotationNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported to JSON");
  };

  const handleImportJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text) as Contract;
        data.id = crypto.randomUUID();
        data.createdAt = new Date();
        data.updatedAt = new Date();
        await addContract(data);
        toast.success("Contract imported");
      } catch {
        toast.error("Failed to import — invalid JSON");
      }
    };
    input.click();
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteContract(deleteId);
    setDeleteId(null);
    toast.success("Contract deleted");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Contracts</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{contracts.length} total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleImportJSON} data-testid="button-import-json">
            <Upload className="w-4 h-4 mr-1.5" />
            Import
          </Button>
          <Link href="/contracts/new">
            <Button size="sm" data-testid="button-new-contract" className="gap-1.5">
              <FilePlus className="w-4 h-4" />
              New Contract
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          data-testid="input-search-contracts"
          placeholder="Search by client name, event type, quotation number..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              {search ? "No contracts match your search." : "No contracts yet."}
            </p>
            {!search && (
              <Link href="/contracts/new">
                <Button size="sm" className="mt-4" data-testid="button-create-first">
                  Create your first contract
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card
              key={c.id}
              data-testid={`card-contract-${c.id}`}
              className="hover:border-primary/30 transition-colors"
            >
              <CardContent className="py-3 px-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">
                        {c.client?.name || "Unknown Client"}
                      </span>
                      <Badge className={`text-xs border-0 capitalize ${statusColor[c.status]}`}>
                        {c.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">Q#{c.quotationNumber}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {c.client?.eventType || "—"} &bull;{" "}
                      {c.client?.eventDate
                        ? (() => {
                            try { return format(new Date(c.client.eventDate), "MMM d, yyyy"); }
                            catch { return c.client.eventDate; }
                          })()
                        : "No date set"}{" "}
                      &bull; {c.client?.guestCount ? `${c.client.guestCount} guests` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">
                      {c.costs?.total ? `Ksh ${c.costs.total.toLocaleString()}` : "—"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {c.createdAt
                        ? (() => {
                            try { return format(new Date(c.createdAt), "MMM d"); }
                            catch { return ""; }
                          })()
                        : ""}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0"
                        data-testid={`button-actions-${c.id}`}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/contracts/${c.id}/edit`}>
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(c)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleExportJSON(c)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export JSON
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(c.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete contract?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The contract will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
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
