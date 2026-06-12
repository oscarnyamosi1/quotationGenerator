import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { ContractTemplate } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Plus, Copy, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";

export default function Templates() {
  const { templates, loadData, addTemplate, updateTemplate, deleteTemplate } = useAppStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState<Partial<ContractTemplate> | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openNew = () => {
    setEditTemplate({ name: "", html: "", css: "", logo: null, watermark: null });
    setDialogOpen(true);
  };

  const openEdit = (t: ContractTemplate) => {
    setEditTemplate({ ...t });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editTemplate?.name?.trim()) {
      toast.error("Template name is required");
      return;
    }
    if (editTemplate.id) {
      await updateTemplate(editTemplate.id, editTemplate);
      toast.success("Template updated");
    } else {
      await addTemplate({ ...editTemplate, id: crypto.randomUUID() } as ContractTemplate);
      toast.success("Template created");
    }
    setDialogOpen(false);
    setEditTemplate(null);
  };

  const handleDuplicate = async (t: ContractTemplate) => {
    await addTemplate({ ...t, id: crypto.randomUUID(), name: `${t.name} (copy)` });
    toast.success("Template duplicated");
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    await deleteTemplate(deleteId);
    setDeleteId(null);
    toast.success("Template deleted");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Reusable contract templates
          </p>
        </div>
        <Button onClick={openNew} data-testid="button-add-template">
          <Plus className="w-4 h-4 mr-1.5" />
          New Template
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No templates yet.</p>
            <Button size="sm" className="mt-4" onClick={openNew} data-testid="button-create-template">
              Create template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((t) => (
            <Card
              key={t.id}
              data-testid={`card-template-${t.id}`}
              className="hover:border-primary/30 transition-colors"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm font-semibold leading-tight">{t.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mt-2">
                  <div
                    className="flex-1 h-24 rounded border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground"
                  >
                    {t.logo ? (
                      <img src={t.logo} alt={t.name} className="max-h-full object-contain" />
                    ) : (
                      "Benkiz Standard Template"
                    )}
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => openEdit(t)}
                    data-testid={`button-edit-template-${t.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicate(t)}
                    data-testid={`button-duplicate-template-${t.id}`}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => setDeleteId(t.id)}
                    data-testid={`button-delete-template-${t.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit/New Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(o) => !o && setDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTemplate?.id ? "Edit Template" : "New Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs mb-1 block">Template Name</Label>
              <Input
                data-testid="input-template-name"
                value={editTemplate?.name ?? ""}
                onChange={(e) =>
                  setEditTemplate((p) => ({ ...p!, name: e.target.value }))
                }
                placeholder="e.g. Benkiz Standard"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} data-testid="button-save-template">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete template?</AlertDialogTitle>
            <AlertDialogDescription>
              This cannot be undone.
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
