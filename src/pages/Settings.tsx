import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { CompanySettings } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Upload, X, Building2 } from "lucide-react";

export default function Settings() {
  const { settings, saveSettings } = useAppStore();
  const [form, setForm] = useState<CompanySettings>({ ...settings });

  const handleSave = () => {
    saveSettings(form);
    toast.success("Settings saved");
  };

  const handleImageUpload = (field: "logo" | "watermark") => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        setForm((p) => ({ ...p, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const clearImage = (field: "logo" | "watermark") => {
    setForm((p) => ({ ...p, [field]: null }));
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Company profile & preferences</p>
        </div>
        <Button onClick={handleSave} data-testid="button-save-settings">
          Save Settings
        </Button>
      </div>

      {/* Company Info */}
      <Card className="mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Company Name</Label>
              <Input
                data-testid="input-company-name"
                value={form.companyName}
                onChange={(e) => setForm((p) => ({ ...p, companyName: e.target.value }))}
              />
            </div>
            <div className="col-span-2">
              <Label className="text-xs mb-1 block">Address</Label>
              <Input
                data-testid="input-company-address"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Phone</Label>
              <Input
                data-testid="input-company-phone"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Email</Label>
              <Input
                data-testid="input-company-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logo & Watermark */}
      <Card className="mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            {/* Logo */}
            <div>
              <Label className="text-xs mb-2 block">Company Logo</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center gap-2">
                {form.logo ? (
                  <>
                    <img
                      src={form.logo}
                      alt="Logo"
                      data-testid="img-logo-preview"
                      className="max-h-20 object-contain"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive text-xs"
                      onClick={() => clearImage("logo")}
                      data-testid="button-clear-logo"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageUpload("logo")}
                      data-testid="button-upload-logo"
                    >
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      PNG, JPG up to 5MB
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Watermark */}
            <div>
              <Label className="text-xs mb-2 block">Watermark Image</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center gap-2">
                {form.watermark ? (
                  <>
                    <img
                      src={form.watermark}
                      alt="Watermark"
                      data-testid="img-watermark-preview"
                      className="max-h-20 object-contain opacity-40"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive text-xs"
                      onClick={() => clearImage("watermark")}
                      data-testid="button-clear-watermark"
                    >
                      <X className="w-3 h-3 mr-1" />
                      Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center opacity-40">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleImageUpload("watermark")}
                      data-testid="button-upload-watermark"
                    >
                      Upload Watermark
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Appears on printed documents
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              The watermark appears centered on every printed A4 page using fixed positioning. 
              If no watermark image is uploaded, the company name is used as text watermark.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mpesa */}
      <Card className="mb-5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Mpesa Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs mb-1 block">Paybill Number</Label>
              <Input
                data-testid="input-mpesa-paybill"
                value={form.mpesaPaybill}
                onChange={(e) => setForm((p) => ({ ...p, mpesaPaybill: e.target.value }))}
                placeholder="542542"
              />
            </div>
            <div>
              <Label className="text-xs mb-1 block">Account Number</Label>
              <Input
                data-testid="input-mpesa-account"
                value={form.mpesaAccount}
                onChange={(e) => setForm((p) => ({ ...p, mpesaAccount: e.target.value }))}
                placeholder="28812"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-5" />

      <Button onClick={handleSave} className="w-full" data-testid="button-save-settings-bottom">
        Save All Settings
      </Button>
    </div>
  );
}
