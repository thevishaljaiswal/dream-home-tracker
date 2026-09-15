import React, { useState } from 'react';
import {
  Plus,
  Building2,
  IndianRupee,
  FileText,
  Trash2,
  Tag,
  Pencil,
  History,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import { toast } from '@/hooks/use-toast';
import CostSheetDialog from '@/components/CostSheetDialog';
import { Enquiry, UNIT_CONFIGURATIONS, ENQUIRY_CHANNELS, ENQUIRY_STATUSES } from '@/types/enquiry';
import { formatINR } from '@/lib/quotation';

interface LeadEnquiriesProps {
  enquiries: Enquiry[];
  onAddEnquiry: (enquiry: Omit<Enquiry, 'id' | 'createdAt'>) => void;
  onUpdateEnquiry: (enquiry: Enquiry) => void;
  onDeleteEnquiry: (enquiryId: string) => void;
}

const emptyForm = {
  projectName: '',
  towerBlock: '',
  unitNumber: '',
  unitConfiguration: '2BHK',
  carpetArea: 950,
  ratePerSqft: 6500,
  channel: 'website',
  status: 'open',
  notes: '',
};

const LeadEnquiries: React.FC<LeadEnquiriesProps> = ({
  enquiries,
  onAddEnquiry,
  onUpdateEnquiry,
  onDeleteEnquiry,
}) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [costSheetFor, setCostSheetFor] = useState<Enquiry | null>(null);
  const [logFor, setLogFor] = useState<Enquiry | null>(null);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (enquiry: Enquiry) => {
    setEditingId(enquiry.id);
    setForm({
      projectName: enquiry.projectName,
      towerBlock: enquiry.towerBlock || '',
      unitNumber: enquiry.unitNumber || '',
      unitConfiguration: enquiry.unitConfiguration,
      carpetArea: enquiry.carpetArea,
      ratePerSqft: enquiry.ratePerSqft,
      channel: enquiry.channel,
      status: enquiry.status,
      notes: enquiry.notes || '',
    });
    setOpen(true);
  };

  const handleSubmit = () => {
    if (!form.projectName.trim()) {
      toast({
        title: 'Project required',
        description: 'Please enter the project name for this enquiry.',
        variant: 'destructive',
      });
      return;
    }

    const payload = {
      projectName: form.projectName.trim(),
      towerBlock: form.towerBlock.trim(),
      unitNumber: form.unitNumber.trim(),
      unitConfiguration: form.unitConfiguration,
      carpetArea: Number(form.carpetArea) || 0,
      ratePerSqft: Number(form.ratePerSqft) || 0,
      channel: form.channel,
      status: form.status,
      notes: form.notes.trim(),
    };

    if (editingId) {
      const existing = enquiries.find((e) => e.id === editingId);
      if (existing) {
        onUpdateEnquiry({ ...existing, ...payload, updatedAt: new Date().toISOString() });
        toast({
          title: 'Enquiry updated',
          description: `${payload.projectName} has been updated.`,
        });
      }
    } else {
      onAddEnquiry(payload);
    }

    setForm(emptyForm);
    setEditingId(null);
    setOpen(false);
  };

  return (
    <div className="glass-card rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold">Enquiries</h3>
          <p className="text-sm text-muted-foreground">
            Track every project, unit configuration and channel for this lead
          </p>
        </div>

        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" />
          New Enquiry
        </Button>
      </div>

      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setEditingId(null);
            setForm(emptyForm);
          }
        }}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Enquiry' : 'Add Enquiry'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="sm:col-span-2">
              <Label htmlFor="projectName">Project</Label>
              <Input
                id="projectName"
                value={form.projectName}
                onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                placeholder="e.g. Skyline Residences"
              />
            </div>

            <div>
              <Label htmlFor="towerBlock">Tower / Block</Label>
              <Input
                id="towerBlock"
                value={form.towerBlock}
                onChange={(e) => setForm({ ...form, towerBlock: e.target.value })}
                placeholder="Tower B"
              />
            </div>

            <div>
              <Label htmlFor="unitNumber">Unit No.</Label>
              <Input
                id="unitNumber"
                value={form.unitNumber}
                onChange={(e) => setForm({ ...form, unitNumber: e.target.value })}
                placeholder="B-1204"
              />
            </div>

            <div>
              <Label>Unit Configuration</Label>
              <Select
                value={form.unitConfiguration}
                onValueChange={(value) => setForm({ ...form, unitConfiguration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_CONFIGURATIONS.map((config) => (
                    <SelectItem key={config} value={config}>
                      {config}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Channel</Label>
              <Select
                value={form.channel}
                onValueChange={(value) => setForm({ ...form, channel: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_CHANNELS.map((channel) => (
                    <SelectItem key={channel.value} value={channel.value}>
                      {channel.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="carpetArea">Carpet Area (sq.ft)</Label>
              <Input
                id="carpetArea"
                type="number"
                value={form.carpetArea}
                onChange={(e) => setForm({ ...form, carpetArea: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label htmlFor="ratePerSqft">Rate / sq.ft</Label>
              <Input
                id="ratePerSqft"
                type="number"
                value={form.ratePerSqft}
                onChange={(e) => setForm({ ...form, ratePerSqft: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => setForm({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENQUIRY_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Label htmlFor="enquiryNotes">Notes</Label>
              <Textarea
                id="enquiryNotes"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Preferred floor, view, payment plan..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingId ? 'Save Changes' : 'Add Enquiry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {enquiries.length === 0 ? (
        <div className="text-center py-10">
          <Building2 className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
          <p className="text-muted-foreground">
            No enquiries yet. Add one to start building a cost sheet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => {
            const baseValue = (enquiry.carpetArea || 0) * (enquiry.ratePerSqft || 0);
            const statusLabel =
              ENQUIRY_STATUSES.find((s) => s.value === enquiry.status)?.label ?? enquiry.status;
            const channelLabel =
              ENQUIRY_CHANNELS.find((c) => c.value === enquiry.channel)?.label ?? enquiry.channel;
            const logCount = enquiry.quotationLog?.length || 0;

            return (
              <Card key={enquiry.id} className="border bg-secondary/10">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <h4 className="font-semibold">{enquiry.projectName}</h4>
                        <Badge variant="outline">{enquiry.unitConfiguration}</Badge>
                        <Badge className="capitalize">{statusLabel}</Badge>
                        {enquiry.costSheet && (
                          <Badge variant="secondary">v{enquiry.costSheet.version || 1}</Badge>
                        )}
                      </div>

                      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Building2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          {[enquiry.towerBlock, enquiry.unitNumber].filter(Boolean).join(' · ') ||
                            'Unit not selected'}
                        </span>
                        <span className="flex items-center">
                          <Tag className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          {channelLabel}
                        </span>
                        <span className="flex items-center">
                          <IndianRupee className="h-3.5 w-3.5 mr-1.5 text-primary" />
                          {enquiry.carpetArea} sq.ft @ {enquiry.ratePerSqft}/sq.ft
                        </span>
                        <span>Base value: {formatINR(baseValue)}</span>
                      </div>

                      {enquiry.notes && (
                        <p className="text-sm mt-2 bg-background/60 p-2 rounded-md">
                          {enquiry.notes}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground mt-2">
                        Created {format(new Date(enquiry.createdAt), 'MMM d, yyyy')}
                        {enquiry.updatedAt &&
                          ` · Updated ${format(new Date(enquiry.updatedAt), 'MMM d, yyyy')}`}
                        {enquiry.costSheet &&
                          ` · Quotation ${enquiry.costSheet.quotationNumber}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => openEdit(enquiry)}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setCostSheetFor(enquiry)}>
                        <FileText className="h-4 w-4 mr-1" />
                        Cost Sheet
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={logCount === 0}
                        onClick={() => setLogFor(enquiry)}
                      >
                        <History className="h-4 w-4 mr-1" />
                        Log {logCount > 0 && `(${logCount})`}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteEnquiry(enquiry.id)}
                        aria-label="Delete enquiry"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {costSheetFor && (
        <CostSheetDialog
          enquiry={costSheetFor}
          open={!!costSheetFor}
          onOpenChange={(isOpen) => !isOpen && setCostSheetFor(null)}
          onSave={(updated) => {
            onUpdateEnquiry(updated);
            setCostSheetFor(null);
          }}
        />
      )}

      <Dialog open={!!logFor} onOpenChange={(isOpen) => !isOpen && setLogFor(null)}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Quotation Change Log{logFor ? ` — ${logFor.projectName}` : ''}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {[...(logFor?.quotationLog || [])].reverse().map((entry) => (
              <div key={entry.id} className="border rounded-md p-3 bg-secondary/10">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.action === 'created' ? 'default' : 'secondary'}>
                      v{entry.version} {entry.action}
                    </Badge>
                    <span className="text-sm font-medium">{entry.quotationNumber}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(entry.at), 'dd MMM yyyy, h:mm a')}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1">
                  Total payable: {formatINR(entry.grandTotal)}
                </p>

                <ul className="mt-2 space-y-1 text-sm">
                  {entry.changes.map((change, index) => (
                    <li key={index} className="flex flex-wrap items-center gap-1.5">
                      <span className="text-muted-foreground">{change.field}:</span>
                      <span className="line-through text-muted-foreground">{change.from}</span>
                      <ArrowRight className="h-3 w-3 text-primary" />
                      <span className="font-medium">{change.to}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadEnquiries;
