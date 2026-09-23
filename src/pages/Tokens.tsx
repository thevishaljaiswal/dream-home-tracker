import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Coins, Trophy, Search, IndianRupee, ListOrdered } from 'lucide-react';
import { EOIToken } from '@/types/token';
import {
  PRIORITY_RULES,
  TOKEN_CATEGORIES,
  TOKEN_STATUSES,
  TOKEN_TYPES,
  labelOf,
  statusBadgeClass,
  statusOf,
} from '@/lib/eoiMasters';
import { isAllotmentEligible, loadTokens, rankTokens, saveTokens } from '@/lib/tokenStore';
import { formatINR, formatINRShort } from '@/lib/currency';

const Tokens = () => {
  const navigate = useNavigate();
  const [tokens, setTokens] = useState<EOIToken[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');

  useEffect(() => {
    const ranked = rankTokens(loadTokens());
    saveTokens(ranked);
    setTokens(ranked);
  }, []);

  const projects = useMemo(
    () => Array.from(new Set(tokens.map((t) => t.projectName).filter(Boolean))),
    [tokens]
  );

  const filtered = useMemo(
    () =>
      tokens.filter((t) => {
        const q = search.trim().toLowerCase();
        const matchesSearch =
          !q ||
          t.tokenNumber.toLowerCase().includes(q) ||
          t.leadName.toLowerCase().includes(q) ||
          t.projectName.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
        const matchesProject = projectFilter === 'all' || t.projectName === projectFilter;
        return matchesSearch && matchesStatus && matchesProject;
      }),
    [tokens, search, statusFilter, projectFilter]
  );

  const stats = useMemo(() => {
    const live = tokens.filter((t) => !['refunded', 'cancelled', 'expired'].includes(t.status));
    return {
      total: tokens.length,
      collected: live.reduce((s, t) => s + (t.amount || 0), 0),
      eligible: tokens.filter(isAllotmentEligible).length,
      converted: tokens.filter((t) => t.status === 'converted').length,
    };
  }, [tokens]);

  const queue = useMemo(
    () =>
      tokens
        .filter(isAllotmentEligible)
        .sort((a, b) => {
          if (a.projectName !== b.projectName) return a.projectName.localeCompare(b.projectName);
          return (a.allotmentRank || 999) - (b.allotmentRank || 999);
        }),
    [tokens]
  );

  return (
    <div className="min-h-screen pb-20">
      <Header />
      <main className="container-custom pt-28 md:pt-32">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Coins className="h-7 w-7 text-primary" /> Project Launch EOI Tokens
          </h1>
          <p className="text-muted-foreground mt-1">
            Controlled token transactions linked to prospects, with allotment priority ranking.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Total Tokens</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <IndianRupee className="h-3 w-3" /> Live Token Value
              </p>
              <p className="text-2xl font-bold">{formatINRShort(stats.collected)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Allotment Eligible</p>
              <p className="text-2xl font-bold">{stats.eligible}</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">Converted to Booking</p>
              <p className="text-2xl font-bold">{stats.converted}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="register">
          <TabsList>
            <TabsTrigger value="register">Token Register</TabsTrigger>
            <TabsTrigger value="allotment">Allotment Priority</TabsTrigger>
            <TabsTrigger value="masters">Masters</TabsTrigger>
          </TabsList>

          <TabsContent value="register" className="mt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search token no., prospect or project"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="md:w-56"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  {TOKEN_STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="md:w-56"><SelectValue placeholder="Project" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All projects</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card className="glass-card">
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Token No.</TableHead>
                      <TableHead>Prospect</TableHead>
                      <TableHead>Project / Unit</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                      <TableHead className="text-right">Rank</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="font-medium">{t.tokenNumber}</TableCell>
                        <TableCell>{t.leadName}</TableCell>
                        <TableCell className="text-sm">
                          {t.projectName}
                          <span className="text-muted-foreground"> • {t.unitConfiguration}</span>
                        </TableCell>
                        <TableCell className="text-sm">{labelOf(TOKEN_CATEGORIES, t.category)}</TableCell>
                        <TableCell>{formatINR(t.amount)}</TableCell>
                        <TableCell>
                          <Badge className={statusBadgeClass(t.status)}>
                            {statusOf(t.status)?.label || t.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{t.priorityScore}</TableCell>
                        <TableCell className="text-right">
                          {t.allotmentRank ? `#${t.allotmentRank}` : '—'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/lead/${t.leadId}`)}>
                            Open Lead
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filtered.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-10 text-muted-foreground">
                          No tokens found. Create an EOI token from a lead's Tokens tab.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allotment" className="mt-6 space-y-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListOrdered className="h-5 w-5" /> Priority Queue (per project)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Prospect</TableHead>
                      <TableHead>Config</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queue.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>
                          <Badge variant={t.allotmentRank === 1 ? 'default' : 'outline'} className="gap-1">
                            {t.allotmentRank === 1 && <Trophy className="h-3 w-3" />}#{t.allotmentRank}
                          </Badge>
                        </TableCell>
                        <TableCell>{t.projectName}</TableCell>
                        <TableCell>{t.leadName}</TableCell>
                        <TableCell>{t.unitConfiguration}</TableCell>
                        <TableCell className="text-sm">{t.tokenNumber}</TableCell>
                        <TableCell>{formatINR(t.amount)}</TableCell>
                        <TableCell className="text-right font-semibold">{t.priorityScore}</TableCell>
                      </TableRow>
                    ))}
                    {queue.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                          No verified tokens in the allotment queue yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Priority / Allotment Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {PRIORITY_RULES.map((r) => (
                  <div key={r.value} className="flex items-start justify-between gap-4 border-b pb-3 last:border-0 last:pb-0">
                    <div>
                      <p className="text-sm font-medium">{r.label}</p>
                      <p className="text-xs text-muted-foreground">{r.description}</p>
                    </div>
                    <Badge variant="outline">max {r.maxPoints} pts</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="masters" className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg">Token Category Master</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {TOKEN_CATEGORIES.map((c) => (
                  <div key={c.value} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{c.label}</p>
                      <Badge variant="outline">weight {c.weight}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.description}</p>
                    <p className="text-xs mt-1">
                      Min {formatINRShort(c.minAmount)} • Validity {c.defaultValidityDays} days •{' '}
                      {c.refundable ? 'Refundable' : 'Non-refundable'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader><CardTitle className="text-lg">Token Type Master</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {TOKEN_TYPES.map((t) => (
                  <div key={t.value} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{t.label}</p>
                      <Badge variant="outline">weight {t.weight}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="glass-card lg:col-span-2">
              <CardHeader><CardTitle className="text-lg">Token Status Master (controlled transitions)</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {TOKEN_STATUSES.map((s) => (
                  <div key={s.value} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={statusBadgeClass(s.value)}>{s.label}</Badge>
                      <span className="text-xs text-muted-foreground">{s.description}</span>
                    </div>
                    <p className="text-xs mt-1">
                      Allowed next:{' '}
                      {s.next.length
                        ? s.next.map((n) => statusOf(n)?.label || n).join(', ')
                        : 'Terminal status'}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Tokens;
