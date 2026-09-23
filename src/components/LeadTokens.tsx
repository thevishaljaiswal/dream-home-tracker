import React, { useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Coins,
  Plus,
  Pencil,
  Trash2,
  History,
  Trophy,
  CalendarClock,
} from 'lucide-react';
import { EOIToken } from '@/types/token';
import { Enquiry } from '@/types/enquiry';
import EOITokenDialog from '@/components/EOITokenDialog';
import {
  TOKEN_CATEGORIES,
  TOKEN_TYPES,
  labelOf,
  statusBadgeClass,
  statusOf,
} from '@/lib/eoiMasters';
import { expiryDate } from '@/lib/tokenStore';
import { formatINR } from '@/lib/currency';

interface LeadTokensProps {
  leadId: string;
  leadName: string;
  leadContact?: string;
  enquiries?: Enquiry[];
  tokens: EOIToken[];
  onSaveToken: (token: EOIToken) => void;
  onDeleteToken: (tokenId: string) => void;
}

const LeadTokens: React.FC<LeadTokensProps> = ({
  leadId,
  leadName,
  leadContact,
  enquiries = [],
  tokens,
  onSaveToken,
  onDeleteToken,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EOIToken | null>(null);
  const [logToken, setLogToken] = useState<EOIToken | null>(null);

  const totals = useMemo(() => {
    const live = tokens.filter((t) => !['refunded', 'cancelled', 'expired'].includes(t.status));
    return {
      count: tokens.length,
      amount: live.reduce((sum, t) => sum + (t.amount || 0), 0),
      best: tokens.reduce<number | undefined>(
        (rank, t) => (t.allotmentRank && (!rank || t.allotmentRank < rank) ? t.allotmentRank : rank),
        undefined
      ),
    };
  }, [tokens]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="gap-1">
            <Coins className="h-3 w-3" /> {totals.count} token(s)
          </Badge>
          <Badge variant="outline">Live token value: {formatINR(totals.amount)}</Badge>
          {totals.best && (
            <Badge className="gap-1">
              <Trophy className="h-3 w-3" /> Best allotment rank #{totals.best}
            </Badge>
          )}
        </div>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add EOI Token
        </Button>
      </div>

      {tokens.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center">
            <Coins className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">
              No EOI tokens recorded for this prospect yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {tokens.map((token) => {
            const expiry = expiryDate(token);
            const expired = expiry.getTime() < Date.now();
            return (
              <Card key={token.id} className="glass-card">
                <CardHeader className="pb-2">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {token.tokenNumber}
                        <Badge className={statusBadgeClass(token.status)}>
                          {statusOf(token.status)?.label || token.status}
                        </Badge>
                        {token.allotmentRank && (
                          <Badge variant="outline" className="gap-1">
                            <Trophy className="h-3 w-3" /> Rank #{token.allotmentRank}
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {token.projectName}
                        {token.towerBlock ? ` • ${token.towerBlock}` : ''} • {token.unitConfiguration}
                        {token.preferredUnitNumber ? ` • ${token.preferredUnitNumber}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setLogToken(token)}>
                        <History className="h-4 w-4 mr-1" /> Log
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(token);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive"
                        onClick={() => onDeleteToken(token.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-2 rounded-md bg-secondary/10">
                      <p className="text-xs text-muted-foreground">Token Amount</p>
                      <p className="text-sm font-semibold">{formatINR(token.amount)}</p>
                    </div>
                    <div className="p-2 rounded-md bg-secondary/10">
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="text-sm font-medium">{labelOf(TOKEN_CATEGORIES, token.category)}</p>
                    </div>
                    <div className="p-2 rounded-md bg-secondary/10">
                      <p className="text-xs text-muted-foreground">Type</p>
                      <p className="text-sm font-medium">{labelOf(TOKEN_TYPES, token.type)}</p>
                    </div>
                    <div className="p-2 rounded-md bg-secondary/10">
                      <p className="text-xs text-muted-foreground">Priority Score</p>
                      <p className="text-sm font-semibold">{token.priorityScore} pts</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3 w-3" />
                      Received {new Date(token.receivedAt).toLocaleDateString('en-IN')} • Valid till{' '}
                      {expiry.toLocaleDateString('en-IN')}
                      {expired ? ' (lapsed)' : ''}
                    </span>
                    <span>{token.refundable ? 'Refundable' : 'Non-refundable'}</span>
                    {token.paymentReference && <span>Ref: {token.paymentReference}</span>}
                  </div>
                  {token.remarks && (
                    <p className="text-sm mt-3 bg-secondary/10 p-2 rounded-md">{token.remarks}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <EOITokenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        leadId={leadId}
        leadName={leadName}
        leadContact={leadContact}
        enquiries={enquiries}
        existingToken={editing}
        onSave={onSaveToken}
      />

      <Dialog open={Boolean(logToken)} onOpenChange={(o) => !o && setLogToken(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Token Audit Log — {logToken?.tokenNumber}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {[...(logToken?.log || [])].reverse().map((entry) => (
              <div key={entry.id} className="border rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="capitalize">
                    {entry.action.replace(/_/g, ' ')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.at).toLocaleString('en-IN')}
                  </span>
                </div>
                {entry.remarks && <p className="text-sm mb-2">{entry.remarks}</p>}
                <div className="space-y-1">
                  {entry.changes.map((c, i) => (
                    <div key={i} className="text-xs flex flex-wrap gap-1">
                      <span className="font-medium">{c.field}:</span>
                      <span className="text-muted-foreground line-through">{c.from}</span>
                      <span>→</span>
                      <span>{c.to}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {(logToken?.log || []).length === 0 && (
              <p className="text-sm text-muted-foreground">No entries yet.</p>
            )}
            <Separator />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadTokens;
