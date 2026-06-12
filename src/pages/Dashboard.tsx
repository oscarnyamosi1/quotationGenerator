import { useEffect } from "react";
import { Link } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, CalendarDays, TrendingUp, FilePlus, Clock } from "lucide-react";
import { format } from "date-fns";
import { Contract } from "@/types";

const statusColor: Record<Contract["status"], string> = {
  draft: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
};

export default function Dashboard() {
  const { contracts, loadData, isLoading } = useAppStore();

  useEffect(() => {
    loadData();
  }, [loadData]);

  const today = new Date();
  const upcoming = contracts.filter((c) => {
    if (!c.client?.eventDate) return false;
    try {
      return new Date(c.client.eventDate) >= today;
    } catch {
      return false;
    }
  });

  const totalRevenue = contracts.reduce((sum, c) => sum + (c.costs?.total ?? 0), 0);
  const recent = contracts.slice(0, 5);

  const formatCurrency = (n: number) =>
    n >= 1000 ? `Ksh ${(n / 1000).toFixed(0)}K` : `Ksh ${n}`;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {format(today, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link href="/contracts/new">
          <Button data-testid="button-new-contract" className="gap-2">
            <FilePlus className="w-4 h-4" />
            New Contract
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card data-testid="card-total-contracts">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Total Contracts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-primary">{contracts.length}</span>
              <FileText className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-upcoming-events">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-primary">{upcoming.length}</span>
              <CalendarDays className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-revenue-estimate">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Revenue Estimate
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</span>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card data-testid="card-drafts">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-primary">
                {contracts.filter((c) => c.status === "draft").length}
              </span>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Contracts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Recent Contracts</h2>
          <Link href="/contracts">
            <span className="text-sm text-primary hover:underline cursor-pointer">View all</span>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm mb-4">No contracts yet. Create your first one.</p>
              <Link href="/contracts/new">
                <Button size="sm" data-testid="button-create-first-contract">
                  Create Contract
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recent.map((c) => (
              <Link key={c.id} href={`/contracts/${c.id}/edit`}>
                <a data-testid={`row-contract-${c.id}`}>
                  <Card className="hover:border-primary/40 transition-colors cursor-pointer">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm text-foreground truncate">
                              {c.client?.name || "Unknown Client"}
                            </p>
                            <Badge
                              className={`text-xs ${statusColor[c.status]} border-0 capitalize`}
                            >
                              {c.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {c.client?.eventType || "—"} &bull; Q#{c.quotationNumber}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-semibold text-primary">
                            {c.costs?.total ? `Ksh ${c.costs.total.toLocaleString()}` : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {c.client?.eventDate
                              ? (() => {
                                  try { return format(new Date(c.client.eventDate), "MMM d, yyyy"); }
                                  catch { return c.client.eventDate; }
                                })()
                              : "—"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
