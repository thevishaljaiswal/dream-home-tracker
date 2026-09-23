import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { EOIToken } from '@/types/token';
import { Enquiry, UNIT_CONFIGURATIONS } from '@/types/enquiry';
import {
  PAYMENT_MODES,
  TOKEN_CATEGORIES,
  TOKEN_INITIAL_STATUS,
  TOKEN_TYPES,
  allowedNextStatuses,
  categoryOf,
  statusOf,
} from '@/lib/eoiMasters';
import { diffTokens, buildLogEntry, generateTokenNumber, loadTokens, scoreToken } from '@/lib/tokenStore';
import { formatINR } from '@/lib/currency';

interface EOITokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leadId: string;
  leadName: string;
  leadContact?: string;
  enquiries?: Enquiry[];
  existingToken?: EOIToken | null;
  onSave: (token: EOIToken) => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

const blankToken = (leadId: string, leadName: string, leadContact?: string): EOIToken => {
  const category = TOKEN_CATEGORIES[0];
  return {
    id: crypto.randomUUID(),
    tokenNumber: generateTokenNumber(loadTokens()),
    leadId,
    leadName,
    leadContact,
    projectName: '',
    towerBlock: '',
    unitConfiguration: '2BHK',
    preferredUnitNumber: '',
    category: category.value,
    type: TOKEN_TYPES[0].value,
    status: TOKEN_INITIAL_STATUS,
    amount: category.minAmount,
    paymentMode: PAYMENT_MODES[0].value,
    paymentReference: '',
    receivedAt: todayISO(),
    validityDays: category.defaultValidityDays,
    refundable: category.refundable,
    priorityScore: 0,
    remarks: '',
    createdAt: new Date().toISOString(),
    log: [],
  };
};

const EOITokenDialog: React.FC<EOITokenDialogProps> = ({
  open,
  onOpenChange,
  leadId,
  leadName,
  leadContact,
  enquiries = [],
  existingToken,
  onSave,
}) => {
  const [draft, setDraft] = useState<EOIToken>(() =>
    existingToken || blankToken(leadId, leadName, leadContact)
  );
  const [statusRemark, setStatusRemark] = useState('');

  useEffect(() => {
    if (!open) return;
    setDraft(existingToken ? { ...existingToken } : blankToken(leadId, leadName, leadContact));
    setStatusRemark('');
  }, [open, existingToken, leadId, leadName, leadContact]);

  const isEdit = Boolean(existingToken);
  const category = categoryOf(draft.category);

  const statusOptions = useMemo(() => {
    if (!isEdit) return [TOKEN_INITIAL_STATUS, 'payment_pending', 'received'];
    return [draft.status, ...allowedNextStatuses(existingToken!.status)].filter(
      (v, i, arr) => arr.indexOf(v) === i
    );
  }, [isEdit, draft.status, existingToken]);

  const breakdown = scoreToken(draft);
  const score = breakdown.reduce((s, b) => s + b.points, 0);

  const set = <K extends keyof EOIToken>(key: K, value: EOIToken[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const handleCategoryChange = (value: string) => {
    const master = categoryOf(value);
    setDraft((prev) => ({
      ...prev,
      category: value,
      validityDays: master?.defaultValidityDays ?? prev.validityDays,
      refundable: master?.refundable ?? prev.refundable,
      amount: Math.max(prev.amount, master?.minAmount ?? 0),
    }));
  };

  const handleEnquiryLink = (value: string) => {
    if (value === 'none') {
      set('enquiryId', undefined);
      return;
    }
    const enquiry = enquiries.find((e) => e.id === value);
    if (!enquiry) return;
    setDraft((prev) => ({
      ...prev,
      enquiryId: enquiry.id,
      projectName: enquiry.projectName,
      towerBlock: enquiry.towerBlock,
      unitConfiguration: enquiry.unitConfiguration,
      preferredUnitNumber: enquiry.unitNumber,
    }));
  };

  const handleSave = () => {
    if (!draft.projectName.trim()) {
      toast({ title: 'Project required', description: 'Enter the project name for this EOI token.', variant: 'destructive' });
      return;
    }
    if (category && draft.amount < category.minAmount) {
      toast({
        title: 'Token amount below minimum',
        description: `${category.label} requires at least ${formatINR(category.minAmount)}.`,
        variant: 'destructive',
      });
      return;
    }

    const now = new Date().toISOString();
    const priced: EOIToken = { ...draft, priorityScore: score, updatedAt: now };

    if (!isEdit) {
      onSave({
        ...priced,
        log: [buildLogEntry('created', [
          { field: 'Token', from: '—', to: `${priced.tokenNumber} • ${formatINR(priced.amount)}` },
        ], statusRemark || undefined)],
      });
      toast({ title: 'EOI token created', description: `${priced.tokenNumber} linked to ${leadName}.` });
      onOpenChange(false);
      return;
    }

    const changes = diffTokens(existingToken!, priced);
    if (changes.length === 0) {
      toast({ title: 'No changes to save' });
      return;
    }

    const statusChanged = existingToken!.status !== priced.status;
    const action = statusChanged
      ? priced.status === 'cancelled'
        ? 'cancelled'
        : priced.status === 'refunded'
        ? 'refunded'
        : 'status_change'
      : 'updated';

    onSave({
      ...priced,
      log: [...(existingToken!.log || []), buildLogEntry(action, changes, statusRemark || undefined)],
    });
    toast({ title: 'EOI token updated', description: `${changes.length} change(s) recorded in the audit log.` });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? 'Edit EOI Token' : 'New EOI Token'}
            <Badge variant="outline">{draft.tokenNumber}</Badge>
          </DialogTitle>
          <DialogDescription>
            Controlled token transaction linked to {leadName} (Lead ID {leadId.slice(0, 8)})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {enquiries.length > 0 && (
            <div>
              <Label>Link to Enquiry (optional)</Label>
              <Select value={draft.enquiryId || 'none'} onValueChange={handleEnquiryLink}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not linked</SelectItem>
                  {enquiries.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.projectName} — {e.unitConfiguration}
                      {e.unitNumber ? ` (${e.unitNumber})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Project *</Label>
              <Input
                value={draft.projectName}
                onChange={(e) => set('projectName', e.target.value)}
                placeholder="e.g. Skyline Greens, Hinjewadi"
              />
            </div>
            <div>
              <Label>Tower / Block</Label>
              <Input value={draft.towerBlock || ''} onChange={(e) => set('towerBlock', e.target.value)} placeholder="Tower B" />
            </div>
            <div>
              <Label>Unit Configuration</Label>
              <Select value={draft.unitConfiguration} onValueChange={(v) => set('unitConfiguration', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNIT_CONFIGURATIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Preferred Unit No.</Label>
              <Input value={draft.preferredUnitNumber || ''} onChange={(e) => set('preferredUnitNumber', e.target.value)} placeholder="B-1204" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Token Category</Label>
              <Select value={draft.category} onValueChange={handleCategoryChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TOKEN_CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {category && (
                <p className="text-xs text-muted-foreground mt-1">
                  {category.description} • Min {formatINR(category.minAmount)}
                </p>
              )}
            </div>
            <div>
              <Label>Token Type</Label>
              <Select value={draft.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TOKEN_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Token Status</Label>
              <Select value={draft.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s} value={s}>{statusOf(s)?.label || s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Only transitions allowed by the status master are listed.
              </p>
            </div>
            <div>
              <Label>Token Amount (₹)</Label>
              <Input
                type="number"
                value={draft.amount}
                onChange={(e) => set('amount', Number(e.target.value))}
              />
              <p className="text-xs text-muted-foreground mt-1">{formatINR(draft.amount)}</p>
            </div>
            <div>
              <Label>Payment Mode</Label>
              <Select value={draft.paymentMode} onValueChange={(v) => set('paymentMode', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PAYMENT_MODES.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Payment Reference / UTR</Label>
              <Input value={draft.paymentReference || ''} onChange={(e) => set('paymentReference', e.target.value)} placeholder="UTR / Cheque No." />
            </div>
            <div>
              <Label>Received On</Label>
              <Input type="date" value={draft.receivedAt.slice(0, 10)} onChange={(e) => set('receivedAt', e.target.value)} />
            </div>
            <div>
              <Label>Validity (days)</Label>
              <Input type="number" value={draft.validityDays} onChange={(e) => set('validityDays', Number(e.target.value))} />
            </div>
            <div className="flex items-center justify-between border rounded-md p-3">
              <div>
                <Label className="mb-0">Refundable</Label>
                <p className="text-xs text-muted-foreground">As per category policy</p>
              </div>
              <Switch checked={draft.refundable} onCheckedChange={(v) => set('refundable', v)} />
            </div>
            <div>
              <Label>Management Override (±20)</Label>
              <Input
                type="number"
                value={draft.manualPriorityOverride ?? 0}
                onChange={(e) => set('manualPriorityOverride', Number(e.target.value))}
              />
            </div>
          </div>

          <div className="rounded-md border p-3 bg-secondary/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Priority Score</span>
              <Badge>{score} pts</Badge>
            </div>
            <div className="space-y-1">
              {breakdown.map((b) => (
                <div key={b.rule} className="flex justify-between text-xs text-muted-foreground">
                  <span>{b.label}</span>
                  <span>{b.points > 0 ? `+${b.points}` : b.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label>Remarks</Label>
            <Textarea value={draft.remarks || ''} onChange={(e) => set('remarks', e.target.value)} rows={2} />
          </div>

          <div>
            <Label>Audit Note (recorded with this change)</Label>
            <Input value={statusRemark} onChange={(e) => setStatusRemark(e.target.value)} placeholder="e.g. Cheque realised, verified by accounts" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>{isEdit ? 'Save Changes' : 'Create Token'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EOITokenDialog;
