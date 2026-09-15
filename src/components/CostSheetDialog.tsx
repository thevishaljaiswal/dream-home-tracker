import React, { useMemo, useState } from 'react';
import { Printer, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';
import { buildLogEntry } from '@/lib/quotation';
import { toast } from '@/hooks/use-toast';
import {
  CostSheet,
  CostSheetCharge,
  Enquiry,
  PAYMENT_PLANS,
  defaultCharges,
} from '@/types/enquiry';

interface CostSheetDialogProps {
  enquiry: Enquiry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (enquiry: Enquiry) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Math.round(value) || 0);

const CostSheetDialog: React.FC<CostSheetDialogProps> = ({
  enquiry,
  open,
  onOpenChange,
  onSave,
}) => {
  const baseValue = (enquiry.carpetArea || 0) * (enquiry.ratePerSqft || 0);

  const [sheet, setSheet] = useState<CostSheet>(
    enquiry.costSheet ?? {
      quotationNumber: `QT-${format(new Date(), 'yyyyMM')}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      generatedAt: new Date().toISOString(),
      version: 1,
      charges: defaultCharges(baseValue),
      discountPercent: 0,
      gstPercent: 5,
      stampDutyPercent: 6,
      registrationCharges: 30000,
      validityDays: 15,
      paymentPlan: PAYMENT_PLANS[0],
      remarks: '',
    }
  );

  const totals = useMemo(() => {
    const chargesTotal = sheet.charges.reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    const discount = (baseValue * (Number(sheet.discountPercent) || 0)) / 100;
    const agreementValue = baseValue - discount + chargesTotal;
    const gst = (agreementValue * (Number(sheet.gstPercent) || 0)) / 100;
    const stampDuty = (agreementValue * (Number(sheet.stampDutyPercent) || 0)) / 100;
    const grandTotal =
      agreementValue + gst + stampDuty + (Number(sheet.registrationCharges) || 0);

    return { chargesTotal, discount, agreementValue, gst, stampDuty, grandTotal };
  }, [sheet, baseValue]);

  const updateCharge = (id: string, patch: Partial<CostSheetCharge>) =>
    setSheet({
      ...sheet,
      charges: sheet.charges.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });

  const addCharge = () =>
    setSheet({
      ...sheet,
      charges: [...sheet.charges, { id: crypto.randomUUID(), label: '', amount: 0 }],
    });

  const removeCharge = (id: string) =>
    setSheet({ ...sheet, charges: sheet.charges.filter((c) => c.id !== id) });

  const handleSave = () => {
    const previous = enquiry.costSheet;
    const isFirst = !previous;
    const nextSheet: CostSheet = {
      ...sheet,
      version: isFirst ? 1 : (previous?.version || 1) + 1,
      generatedAt: new Date().toISOString(),
    };

    const entry = buildLogEntry(previous, nextSheet, baseValue);

    if (!entry) {
      toast({
        title: 'No changes to save',
        description: 'This quotation is identical to the last saved version.',
      });
      return;
    }

    onSave({
      ...enquiry,
      status: enquiry.status === 'open' ? 'quoted' : enquiry.status,
      costSheet: nextSheet,
      quotationLog: [...(enquiry.quotationLog || []), entry],
      updatedAt: new Date().toISOString(),
    });

    setSheet(nextSheet);
    toast({
      title: isFirst ? 'Cost sheet saved' : `Quotation updated to v${nextSheet.version}`,
      description: `${entry.changes.length} change${
        entry.changes.length === 1 ? '' : 's'
      } recorded in the change log.`,
    });
  };

  const handlePrint = () => {
    const rows = sheet.charges
      .filter((c) => c.label)
      .map((c) => `<tr><td>${c.label}</td><td class="r">${formatCurrency(c.amount)}</td></tr>`)
      .join('');

    const html = `<!doctype html><html><head><title>${sheet.quotationNumber}</title>
      <style>
        body{font-family:system-ui,sans-serif;padding:40px;color:#111}
        h1{font-size:20px;margin:0 0 4px}
        p.meta{color:#666;font-size:12px;margin:0 0 24px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        td,th{padding:8px 6px;border-bottom:1px solid #e5e7eb;text-align:left}
        .r{text-align:right}
        tr.total td{font-weight:700;font-size:15px;border-top:2px solid #111;border-bottom:none}
      </style></head><body>
      <h1>Cost Sheet / Quotation — ${sheet.quotationNumber}</h1>
      <p class="meta">${enquiry.projectName} · ${enquiry.unitConfiguration} ·
        ${[enquiry.towerBlock, enquiry.unitNumber].filter(Boolean).join(' ')} ·
        Generated ${format(new Date(), 'dd MMM yyyy')} · Valid ${sheet.validityDays} days ·
        ${sheet.paymentPlan}</p>
      <table>
        <tr><td>Carpet area</td><td class="r">${enquiry.carpetArea} sq.ft</td></tr>
        <tr><td>Rate per sq.ft</td><td class="r">${formatCurrency(enquiry.ratePerSqft)}</td></tr>
        <tr><td>Base unit cost</td><td class="r">${formatCurrency(baseValue)}</td></tr>
        <tr><td>Discount (${sheet.discountPercent}%)</td><td class="r">- ${formatCurrency(
      totals.discount
    )}</td></tr>
        ${rows}
        <tr><td>Agreement value</td><td class="r">${formatCurrency(
          totals.agreementValue
        )}</td></tr>
        <tr><td>GST (${sheet.gstPercent}%)</td><td class="r">${formatCurrency(
      totals.gst
    )}</td></tr>
        <tr><td>Stamp duty (${sheet.stampDutyPercent}%)</td><td class="r">${formatCurrency(
      totals.stampDuty
    )}</td></tr>
        <tr><td>Registration charges</td><td class="r">${formatCurrency(
          sheet.registrationCharges
        )}</td></tr>
        <tr class="total"><td>Total payable</td><td class="r">${formatCurrency(
          totals.grandTotal
        )}</td></tr>
      </table>
      ${sheet.remarks ? `<p class="meta" style="margin-top:24px">${sheet.remarks}</p>` : ''}
      </body></html>`;

    const win = window.open('', '_blank');
    if (!win) {
      toast({
        title: 'Popup blocked',
        description: 'Allow popups to print or download this quotation.',
        variant: 'destructive',
      });
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Cost Sheet — {enquiry.projectName} ({enquiry.unitConfiguration})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-md bg-secondary/20">
              <p className="text-xs text-muted-foreground">Quotation No.</p>
              <p className="font-medium">{sheet.quotationNumber}</p>
            </div>
            <div className="p-3 rounded-md bg-secondary/20">
              <p className="text-xs text-muted-foreground">Carpet Area</p>
              <p className="font-medium">{enquiry.carpetArea} sq.ft</p>
            </div>
            <div className="p-3 rounded-md bg-secondary/20">
              <p className="text-xs text-muted-foreground">Rate / sq.ft</p>
              <p className="font-medium">{formatCurrency(enquiry.ratePerSqft)}</p>
            </div>
            <div className="p-3 rounded-md bg-secondary/20">
              <p className="text-xs text-muted-foreground">Base Cost</p>
              <p className="font-medium">{formatCurrency(baseValue)}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Additional Charges</h4>
              <Button size="sm" variant="outline" onClick={addCharge}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            <div className="space-y-2">
              {sheet.charges.map((charge) => (
                <div key={charge.id} className="flex items-center gap-2">
                  <Input
                    value={charge.label}
                    placeholder="Charge name"
                    onChange={(e) => updateCharge(charge.id, { label: e.target.value })}
                  />
                  <Input
                    type="number"
                    className="w-36"
                    value={charge.amount}
                    onChange={(e) =>
                      updateCharge(charge.id, { amount: Number(e.target.value) })
                    }
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeCharge(charge.id)}
                    aria-label="Remove charge"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <Label htmlFor="discount">Discount %</Label>
              <Input
                id="discount"
                type="number"
                value={sheet.discountPercent}
                onChange={(e) =>
                  setSheet({ ...sheet, discountPercent: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="gst">GST %</Label>
              <Input
                id="gst"
                type="number"
                value={sheet.gstPercent}
                onChange={(e) => setSheet({ ...sheet, gstPercent: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor="stamp">Stamp Duty %</Label>
              <Input
                id="stamp"
                type="number"
                value={sheet.stampDutyPercent}
                onChange={(e) =>
                  setSheet({ ...sheet, stampDutyPercent: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <Label htmlFor="registration">Registration ₹</Label>
              <Input
                id="registration"
                type="number"
                value={sheet.registrationCharges}
                onChange={(e) =>
                  setSheet({ ...sheet, registrationCharges: Number(e.target.value) })
                }
              />
            </div>
            <div className="col-span-2">
              <Label>Payment Plan</Label>
              <Select
                value={sheet.paymentPlan}
                onValueChange={(value) => setSheet({ ...sheet, paymentPlan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_PLANS.map((plan) => (
                    <SelectItem key={plan} value={plan}>
                      {plan}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="validity">Validity (days)</Label>
              <Input
                id="validity"
                type="number"
                value={sheet.validityDays}
                onChange={(e) => setSheet({ ...sheet, validityDays: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={sheet.remarks}
              onChange={(e) => setSheet({ ...sheet, remarks: e.target.value })}
              placeholder="Offer conditions, inclusions, exclusions..."
            />
          </div>

          <Separator />

          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Base unit cost</span>
              <span>{formatCurrency(baseValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Discount ({sheet.discountPercent}%)
              </span>
              <span>- {formatCurrency(totals.discount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Additional charges</span>
              <span>{formatCurrency(totals.chargesTotal)}</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Agreement value</span>
              <span>{formatCurrency(totals.agreementValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">GST ({sheet.gstPercent}%)</span>
              <span>{formatCurrency(totals.gst)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">
                Stamp duty ({sheet.stampDutyPercent}%)
              </span>
              <span>{formatCurrency(totals.stampDuty)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Registration charges</span>
              <span>{formatCurrency(sheet.registrationCharges)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-base font-semibold">
              <span>Total payable</span>
              <span>{formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print / Save PDF
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save Cost Sheet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CostSheetDialog;
