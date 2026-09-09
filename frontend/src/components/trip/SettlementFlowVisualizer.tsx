import React, { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  CreditCard,
  DollarSign,
  QrCode,
  Sparkles,
  TrendingUp,
  TrendingDown,
  UserCheck,
  Check,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatCurrency } from "@/utils/formatCurrency";
import { TripMember, Expense } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface Settlement {
  from: string;
  to: string;
  amount: number;
}

interface SettlementFlowVisualizerProps {
  settlements: Settlement[];
  members: TripMember[];
  expenses: Expense[];
  onSettleAll?: () => void;
  isSettling?: boolean;
}

export function SettlementFlowVisualizer({
  settlements,
  members,
  expenses,
  onSettleAll,
  isSettling = false,
}: SettlementFlowVisualizerProps) {
  const { toast } = useToast();
  const [settledMap, setSettledMap] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const getMemberName = (id: string) => {
    const member = members.find((m) => String(m.userId) === String(id) || m.name === id);
    return member?.name || id || "Traveller";
  };

  const getMemberAvatar = (id: string) => {
    const member = members.find((m) => String(m.userId) === String(id) || m.name === id);
    return member?.avatar;
  };

  const handleCopyUpi = (name: string, amount: number, key: string) => {
    const sanitizedName = name.toLowerCase().replace(/\s+/g, "");
    const pseudoUpi = `${sanitizedName}@upi`;
    navigator.clipboard.writeText(pseudoUpi);
    setCopiedKey(key);
    toast({
      title: "UPI ID Copied!",
      description: `Copied ${pseudoUpi} (Amount: ${formatCurrency(amount)}) to clipboard.`,
    });
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleSettled = (key: string) => {
    setSettledMap((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate Net Balances for each member
  const memberBalances: Record<string, number> = {};
  members.forEach((m) => {
    memberBalances[m.name || m.userId] = 0;
  });

  expenses.forEach((e) => {
    const payer = e.paidByName || getMemberName(e.paidBy);
    const splitCount = e.splitAmong?.length || members.length || 1;
    const splitAmount = e.amount / splitCount;

    memberBalances[payer] = (memberBalances[payer] || 0) + e.amount;

    if (e.splitAmong && e.splitAmong.length > 0) {
      e.splitAmong.forEach((memberId) => {
        const debtorName = getMemberName(memberId);
        memberBalances[debtorName] = (memberBalances[debtorName] || 0) - splitAmount;
      });
    } else {
      members.forEach((m) => {
        const name = m.name || m.userId;
        memberBalances[name] = (memberBalances[name] || 0) - splitAmount;
      });
    }
  });

  const allSettled =
    settlements.length > 0 &&
    settlements.every((_, idx) => settledMap[`${settlements[idx].from}-${settlements[idx].to}-${idx}`]);

  return (
    <div className="space-y-6">
      {/* Top Balances Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(memberBalances).map(([name, balance]) => {
          const isCreditor = balance > 0.5;
          const isDebtor = balance < -0.5;
          const isSettled = Math.abs(balance) <= 0.5;

          return (
            <div
              key={name}
              className={`rounded-xl border p-3.5 flex items-center justify-between transition-all ${
                isCreditor
                  ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20"
                  : isDebtor
                  ? "border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20"
                  : "border-border/60 bg-card/40"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center font-bold text-xs">
                  {name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground line-clamp-1">{name}</h4>
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    {isCreditor ? (
                      <span className="text-emerald-500 flex items-center gap-0.5 font-medium">
                        <TrendingUp className="h-3 w-3" /> Gets back
                      </span>
                    ) : isDebtor ? (
                      <span className="text-rose-500 flex items-center gap-0.5 font-medium">
                        <TrendingDown className="h-3 w-3" /> Owes group
                      </span>
                    ) : (
                      <span className="text-muted-foreground flex items-center gap-0.5">
                        <CheckCircle2 className="h-3 w-3 text-muted-foreground" /> All settled
                      </span>
                    )}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-sm font-bold font-heading ${
                    isCreditor
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isDebtor
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-muted-foreground"
                  }`}
                >
                  {isCreditor ? `+${formatCurrency(balance)}` : isDebtor ? `-${formatCurrency(Math.abs(balance))}` : "₹0"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Flow Visualizer */}
      <div className="rounded-2xl border border-border/80 bg-card/70 backdrop-blur-sm p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-border/50">
          <div>
            <h3 className="font-heading font-bold text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Smart Debt Settlement Plan
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Greedy graph reduction minimizes total payments to just {settlements.length} direct transfers.
            </p>
          </div>

          {settlements.length > 0 && onSettleAll && (
            <Button
              onClick={onSettleAll}
              disabled={isSettling}
              size="sm"
              className="gap-2 bg-gradient-to-r from-primary to-violet-600 shadow-sm"
            >
              <UserCheck className="h-4 w-4" />
              {isSettling ? "Recalculating..." : "Optimize Settlements"}
            </Button>
          )}
        </div>

        {settlements.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-500/80 mb-2" />
            <p className="font-medium text-foreground">All balances are settled!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add new expenses to automatically compute optimized group settlements.
            </p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {settlements.map((settlement, idx) => {
              const fromName = getMemberName(settlement.from);
              const toName = getMemberName(settlement.to);
              const flowKey = `${settlement.from}-${settlement.to}-${idx}`;
              const isMarkedSettled = !!settledMap[flowKey];

              return (
                <div
                  key={flowKey}
                  className={`group relative overflow-hidden rounded-xl border transition-all duration-300 p-4 ${
                    isMarkedSettled
                      ? "border-emerald-500/30 bg-emerald-500/5 opacity-70"
                      : "border-border/80 bg-background/80 hover:border-primary/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Visual Flow Path */}
                    <div className="flex items-center gap-3 flex-1">
                      {/* Debtor (From) */}
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center font-bold text-xs">
                          {fromName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                            PAYS
                          </span>
                          <span className="text-sm font-bold text-foreground">{fromName}</span>
                        </div>
                      </div>

                      {/* Directional Connector with Amount Pill */}
                      <div className="flex-1 flex flex-col items-center px-2">
                        <div className="flex items-center gap-1 text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                          <span>{formatCurrency(settlement.amount)}</span>
                        </div>
                        <div className="w-full flex items-center mt-1">
                          <div className="h-0.5 flex-1 bg-gradient-to-r from-rose-500/40 via-primary/40 to-emerald-500/40" />
                          <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0 -ml-1" />
                        </div>
                      </div>

                      {/* Creditor (To) */}
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block text-right">
                            RECEIVES
                          </span>
                          <span className="text-sm font-bold text-foreground">{toName}</span>
                        </div>
                        <div className="h-9 w-9 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold text-xs">
                          {toName.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Quick Payment & Settlement Actions */}
                    <div className="flex items-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/40 justify-end">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 text-xs gap-1.5 border-border/80"
                              onClick={() => handleCopyUpi(toName, settlement.amount, flowKey)}
                            >
                              {copiedKey === flowKey ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  <span className="text-emerald-500">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copy UPI</span>
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Copy UPI address to send ₹{settlement.amount}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button
                        variant={isMarkedSettled ? "secondary" : "default"}
                        size="sm"
                        className={`h-8 text-xs gap-1.5 ${
                          isMarkedSettled ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : ""
                        }`}
                        onClick={() => toggleSettled(flowKey)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {isMarkedSettled ? "Settled" : "Mark Done"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default SettlementFlowVisualizer;
