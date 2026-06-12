import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { Contract } from "@/types";
import { ContractDocument } from "@/components/ContractDocument";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Plus, Trash2, Save, Printer, Download, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";

interface Props {
  contractId?: string;
}

const DEFAULT_MENU = [
  { title: "Breakfast", items: [""] },
  { title: "Lunch", items: [""] },
  { title: "Vegetables", items: [""] },
  { title: "Drinks & Fruits", items: [""] },
  { title: "Salads", items: [""] },
];

const DEFAULT_TERMS = [
  "Deposit is non-refundable once booking is confirmed",
  "Final guest count must be confirmed at least 3 days before the event",
  "Additional services will incur extra charges",
  "Client must ensure venue access and utilities",
  "Company not liable for external delays",
];

function buildEmpty(contracts: Contract[], settings: ReturnType<typeof useAppStore>["settings"]): Partial<Contract> {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    updatedAt: new Date(),
    quotationNumber: contracts.length + 1,
    status: "draft",
    client: { name: "", phone: "", address: "", eventType: "", eventDate: "", venue: "", guestCount: 0 },
    menu: DEFAULT_MENU,
    costs: { shoppingCost: 0, transportCost: 0, labourCost: 0, equipmentCost: 0, cateringFee: 0, extraCost: 0, total: 0 },
    payment: { depositPercent: 75, balancePercent: 25, mpesaPaybill: settings.mpesaPaybill, mpesaAccount: settings.mpesaAccount },
    terms: [...DEFAULT_TERMS],
    signatures: { clientName: "", companyRepresentative: "" },
    templateId: "default",
  };
}

export default function ContractGenerator({ contractId }: Props) {
  const { contracts, settings, addContract, updateContract, loadData } = useAppStore();
  const [, setLocation] = useLocation();
  const docRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const existing = contractId ? contracts.find((c) => c.id === contractId) : undefined;
  const [data, setData] = useState<Partial<Contract>>(() =>
    existing ?? buildEmpty(contracts, settings)
  );

  useEffect(() => {
    if (contracts.length === 0) loadData();
  }, [loadData]);

  useEffect(() => {
    if (existing) setData(existing);
  }, [existing?.id]);

  const update = useCallback(<K extends keyof Contract>(key: K, val: Contract[K]) => {
    setData((prev) => ({ ...prev, [key]: val }));
  }, []);

  const updateClient = useCallback((key: keyof Contract["client"], val: string | number) => {
    setData((prev) => ({ ...prev, client: { ...prev.client!, [key]: val } }));
  }, []);

  const updateCosts = useCallback((key: keyof Contract["costs"], val: number) => {
    setData((prev) => {
      const costs = { ...prev.costs!, [key]: val };
      costs.total =
        (costs.shoppingCost || 0) +
        (costs.transportCost || 0) +
        (costs.labourCost || 0) +
        (costs.equipmentCost || 0) +
        (costs.cateringFee || 0) +
        (costs.extraCost || 0);
      return { ...prev, costs };
    });
  }, []);

  const updatePayment = useCallback((key: keyof Contract["payment"], val: string | number) => {
    setData((prev) => {
      const payment = { ...prev.payment!, [key]: val };
      if (key === "depositPercent") payment.balancePercent = 100 - Number(val);
      if (key === "balancePercent") payment.depositPercent = 100 - Number(val);
      return { ...prev, payment };
    });
  }, []);

  // Menu helpers
  const addMenuSection = () =>
    setData((p) => ({ ...p, menu: [...(p.menu ?? []), { title: "New Section", items: [""] }] }));
  const removeMenuSection = (i: number) =>
    setData((p) => ({ ...p, menu: (p.menu ?? []).filter((_, idx) => idx !== i) }));
  const updateMenuTitle = (i: number, title: string) =>
    setData((p) => {
      const menu = [...(p.menu ?? [])];
      menu[i] = { ...menu[i], title };
      return { ...p, menu };
    });
  const updateMenuItem = (si: number, ii: number, val: string) =>
    setData((p) => {
      const menu = [...(p.menu ?? [])];
      const items = [...menu[si].items];
      items[ii] = val;
      menu[si] = { ...menu[si], items };
      return { ...p, menu };
    });
  const addMenuItem = (si: number) =>
    setData((p) => {
      const menu = [...(p.menu ?? [])];
      menu[si] = { ...menu[si], items: [...menu[si].items, ""] };
      return { ...p, menu };
    });
  const removeMenuItem = (si: number, ii: number) =>
    setData((p) => {
      const menu = [...(p.menu ?? [])];
      menu[si] = { ...menu[si], items: menu[si].items.filter((_, idx) => idx !== ii) };
      return { ...p, menu };
    });

  // Terms helpers
  const addTerm = () => setData((p) => ({ ...p, terms: [...(p.terms ?? []), ""] }));
  const removeTerm = (i: number) =>
    setData((p) => ({ ...p, terms: (p.terms ?? []).filter((_, idx) => idx !== i) }));
  const updateTerm = (i: number, val: string) =>
    setData((p) => {
      const terms = [...(p.terms ?? [])];
      terms[i] = val;
      return { ...p, terms };
    });

  const handleSave = async (status: Contract["status"] = "draft") => {
    setSaving(true);
    try {
      const now = new Date();
      const contract = { ...data, status, updatedAt: now } as Contract;
      if (contractId && existing) {
        await updateContract(contractId, contract);
        toast.success("Contract saved");
      } else {
        await addContract(contract);
        toast.success("Contract created");
        setLocation(`/contracts/${contract.id}/edit`);
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => window.print();

  // const handleDownloadPDF = async () => {
  //   if (!docRef.current) return;
  //   try {
  //     // @ts-ignore
  //     const html2pdf = (await import("html2pdf.js")).default;
  //     const clientName = data.client?.name?.replace(/\s+/g, "_") || "Contract";
  //     const eventType = data.client?.eventType?.replace(/\s+/g, "_") || "Event";
  //     const qNum = data.quotationNumber ?? "0";
  //     const opts = {
  //       margin: [15, 15, 15, 15],
  //       filename: `${clientName}_${eventType}_Q${qNum}.pdf`,
  //       image: { type: "jpeg", quality: 0.98 },
  //       html2canvas: { scale: 2, useCORS: true, letterRendering: true },
  //       jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  //       pagebreak: { mode: ["avoid-all", "css", "legacy"] },
  //     };
  //     const element = docRef.current;
  //     await html2pdf().set(opts).from(element).save();
  //     toast.success("PDF downloaded");
  //   } catch (e) {
  //     console.error(e);
  //     toast.error("PDF generation failed — try Print instead");
  //   }
  // };

  const handleDownloadPDF = async () => {
  if (!docRef.current) return;

  try {
    // @ts-ignore
    const html2pdf = (await import("html2pdf.js")).default;

    const clientName = data.client?.name?.replace(/\s+/g, "_") || "Contract";
    const eventType = data.client?.eventType?.replace(/\s+/g, "_") || "Event";
    const qNum = data.quotationNumber ?? "0";

    const element = docRef.current;

    const pdf = await html2pdf()
      .set({
        margin: [15, 5, 15, 0],
        filename: `${clientName}_${eventType}_Q${qNum}.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .from(element)
      .toPdf()
      .get("pdf");

    const pageCount = pdf.internal.getNumberOfPages();

    // const watermarkText = data.companyName || settings.companyName || "BENKIZ";
const watermarkImage = "/watermark.png";

for (let i = 1; i <= pageCount; i++) {
  pdf.setPage(i);

  pdf.setGState(new pdf.GState({ opacity: 0.08 }));

  const img = new Image();
  img.src = watermarkImage;

  await new Promise((res) => (img.onload = res));

  const canvas = document.createElement("canvas");
  canvas.classList.add("watermark")
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d");
  ctx?.drawImage(img, 0, 0);

  const base64 = canvas.toDataURL("image/png");

  const size = 60;
  const height = 40
  const x = (210 - size) / 2;
  const y = (297 - size) / 2;

  pdf.addImage(base64, "PNG", x, y, size, height);
}

    pdf.save();
    toast.success("PDF downloaded with watermark");
  } catch (e) {
    console.error(e);
    toast.error("PDF generation failed — try Print instead");
  }
};

  const numInput = (
    label: string,
    key: keyof Contract["costs"],
    testId: string
  ) => (
    <div>
      <Label className="text-xs mb-1 block">{label}</Label>
      <Input
        data-testid={testId}
        type="number"
        min={0}
        value={data.costs?.[key] || ""}
        onChange={(e) => updateCosts(key, Number(e.target.value))}
        placeholder="0"
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Link href="/contracts">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground cursor-pointer">
            <ChevronLeft className="w-4 h-4" />
            Contracts
          </span>
        </Link>
        <Separator orientation="vertical" className="h-5" />
        <span className="text-sm font-medium">
          {contractId ? "Edit Contract" : "New Contract"} — Q#{data.quotationNumber}
        </span>
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            data-testid="button-print"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadPDF}
            data-testid="button-download-pdf"
          >
            <Download className="w-4 h-4 mr-1.5" />
            PDF
          </Button>
          <Button
            size="sm"
            disabled={saving}
            onClick={() => handleSave("draft")}
            data-testid="button-save-draft"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
          <Button
            size="sm"
            variant="default"
            disabled={saving}
            onClick={() => handleSave("confirmed")}
            data-testid="button-confirm"
            className="bg-[#c9a66b] hover:bg-[#b8954f] text-white"
          >
            Confirm
          </Button>
        </div>
      </div>

      {/* Split panel */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">
        {/* LEFT: Form */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ScrollArea className="h-full">
            <div className="p-5 space-y-6 max-w-xl">
              {/* Client Info */}
              <section>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                  Client Information
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">Client Name</Label>
                    <Input
                      data-testid="input-client-name"
                      value={data.client?.name ?? ""}
                      onChange={(e) => updateClient("name", e.target.value)}
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Phone</Label>
                    <Input
                      data-testid="input-client-phone"
                      value={data.client?.phone ?? ""}
                      onChange={(e) => updateClient("phone", e.target.value)}
                      placeholder="+254..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Event Type</Label>
                    <Input
                      data-testid="input-event-type"
                      value={data.client?.eventType ?? ""}
                      onChange={(e) => updateClient("eventType", e.target.value)}
                      placeholder="Wedding, Ruracio..."
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">Address</Label>
                    <Input
                      data-testid="input-client-address"
                      value={data.client?.address ?? ""}
                      onChange={(e) => updateClient("address", e.target.value)}
                      placeholder="Client address"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Event Date</Label>
                    <Input
                      data-testid="input-event-date"
                      type="date"
                      value={data.client?.eventDate ?? ""}
                      onChange={(e) => updateClient("eventDate", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Guest Count</Label>
                    <Input
                      data-testid="input-guest-count"
                      type="number"
                      min={0}
                      value={data.client?.guestCount || ""}
                      onChange={(e) => updateClient("guestCount", Number(e.target.value))}
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2">
                    <Label className="text-xs mb-1 block">Venue</Label>
                    <Input
                      data-testid="input-venue"
                      value={data.client?.venue ?? ""}
                      onChange={(e) => updateClient("venue", e.target.value)}
                      placeholder="Event venue"
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Status</Label>
                    <Select
                      value={data.status ?? "draft"}
                      onValueChange={(v) => update("status", v as Contract["status"])}
                    >
                      <SelectTrigger data-testid="select-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Menu Builder */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Menu Builder
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addMenuSection}
                    data-testid="button-add-section"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add Section
                  </Button>
                </div>
                <div className="space-y-4">
                  {(data.menu ?? []).map((section, si) => (
                    <div key={si} className="border border-border rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Input
                          data-testid={`input-section-title-${si}`}
                          value={section.title}
                          onChange={(e) => updateMenuTitle(si, e.target.value)}
                          className="h-8 text-sm font-medium"
                          placeholder="Section title"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeMenuSection(si)}
                          data-testid={`button-remove-section-${si}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="space-y-1.5">
                        {section.items.map((item, ii) => (
                          <div key={ii} className="flex gap-2">
                            <Input
                              data-testid={`input-item-${si}-${ii}`}
                              value={item}
                              onChange={(e) => updateMenuItem(si, ii, e.target.value)}
                              className="h-7 text-sm"
                              placeholder="Menu item..."
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 shrink-0 text-muted-foreground"
                              onClick={() => removeMenuItem(si, ii)}
                              data-testid={`button-remove-item-${si}-${ii}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs mt-1"
                          onClick={() => addMenuItem(si)}
                          data-testid={`button-add-item-${si}`}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add item
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* Cost Breakdown */}
              <section>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                  Cost Breakdown
                </h3>
                <div className="grid grid-cols-2 gap-2 cost-table">
                  {numInput("Shopping Cost (Ksh)", "shoppingCost", "input-shopping-cost")}
                  {numInput("Transport Cost (Ksh)", "transportCost", "input-transport-cost")}
                  {numInput("Labour Cost (Ksh)", "labourCost", "input-labour-cost")}
                  {numInput("Equipment Cost (Ksh)", "equipmentCost", "input-equipment-cost")}
                  {numInput("Catering Fee (Ksh)", "cateringFee", "input-catering-fee")}
                  {numInput("Extra Cost (Ksh)", "extraCost", "input-extra-cost")}
                </div>
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">TOTAL</span>
                    <span className="text-lg font-bold text-primary">
                      Ksh {(data.costs?.total ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Payment Terms */}
              <section>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                  Payment Terms
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Deposit %</Label>
                    <Input
                      data-testid="input-deposit-percent"
                      type="number"
                      min={0}
                      max={100}
                      value={data.payment?.depositPercent ?? 75}
                      onChange={(e) => updatePayment("depositPercent", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Balance %</Label>
                    <Input
                      data-testid="input-balance-percent"
                      type="number"
                      min={0}
                      max={100}
                      value={data.payment?.balancePercent ?? 25}
                      onChange={(e) => updatePayment("balancePercent", Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Mpesa Paybill</Label>
                    <Input
                      data-testid="input-mpesa-paybill"
                      value={data.payment?.mpesaPaybill ?? ""}
                      onChange={(e) => updatePayment("mpesaPaybill", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Mpesa Account</Label>
                    <Input
                      data-testid="input-mpesa-account"
                      value={data.payment?.mpesaAccount ?? ""}
                      onChange={(e) => updatePayment("mpesaAccount", e.target.value)}
                    />
                  </div>
                </div>
              </section>

              <Separator />

              {/* Terms & Conditions */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wide">
                    Terms & Conditions
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTerm}
                    data-testid="button-add-term"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {(data.terms ?? []).map((term, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-xs text-muted-foreground pt-2 w-4 shrink-0">{i + 1}.</span>
                      <Textarea
                        data-testid={`input-term-${i}`}
                        value={term}
                        onChange={(e) => updateTerm(i, e.target.value)}
                        className="text-sm min-h-0 resize-none"
                        rows={2}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-destructive mt-1"
                        onClick={() => removeTerm(i)}
                        data-testid={`button-remove-term-${i}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              {/* Signatures */}
              <section>
                <h3 className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">
                  Signatures
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs mb-1 block">Client Name</Label>
                    <Input
                      data-testid="input-client-signature"
                      value={data.signatures?.clientName ?? ""}
                      onChange={(e) =>
                        setData((p) => ({ ...p, signatures: { ...p.signatures!, clientName: e.target.value } }))
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block">Company Representative</Label>
                    <Input
                      data-testid="input-company-signature"
                      value={data.signatures?.companyRepresentative ?? ""}
                      onChange={(e) =>
                        setData((p) => ({
                          ...p,
                          signatures: { ...p.signatures!, companyRepresentative: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>
              </section>

              <div className="pb-6" />
            </div>
          </ScrollArea>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* RIGHT: Live Preview */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <ScrollArea className="h-full bg-gray-100">
            <div className="py-6 px-4 flex justify-center">
              {/* Scale A4 page to fit panel */}
              <div
                style={{
                  transform: "scale(0.75)",
                  transformOrigin: "top center",
                  marginBottom: "-25%",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                }}
              >
                <ContractDocument
                  ref={docRef}
                  contract={data}
                  settings={settings}
                />
              </div>
            </div>
          </ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
