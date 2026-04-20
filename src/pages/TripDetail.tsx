import { useMemo, useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Calendar, Users, Copy, ThumbsUp, ThumbsDown, Plus, Sparkles, X, UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDateRange, formatDate } from "@/utils/formatDate";
import { mockProperties } from "@/utils/mockData";
import PropertyCard from "@/components/property/PropertyCard";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAIBudgetEstimate,
  useCastVote,
  usePropertiesByIds,
  useSettleExpenses,
  useTrip,
  useTripInvites,
  useInviteTripMember,
  useTripVoteSummary,
  useUserSearch,
  useTripExpenses,
  useAddExpense,
} from "@/hooks/useApi";

const tabs = ["Properties", "Expenses", "Itinerary", "AI Budget", "Members", "Bookings"];

export default function TripDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(0);
  const [aiTier, setAiTier] = useState<"budget" | "standard" | "luxury">("standard");
  const [settlements, setSettlements] = useState<Array<{ from: string; to: string; amount: number }>>([]);
  const [openExpenseDialog, setOpenExpenseDialog] = useState(false);
  const [openInviteDialog, setOpenInviteDialog] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [expenseForm, setExpenseForm] = useState({
    description: "",
    amount: "",
    category: "food",
    paidBy: "",
    splitWith: [] as string[],
    receipt: "",
  });
  
  const { data: trip, isLoading: isTripLoading, refetch: refetchTrip } = useTrip(id);
  const { data: invites = [], refetch: refetchInvites } = useTripInvites(id);
  const { mutateAsync: inviteTripMember, isPending: isInviting } = useInviteTripMember();
  const { data: searchResults = [], isLoading: isSearchingUsers } = useUserSearch(memberSearch);
  const { data: expenses = [], isLoading: isExpensesLoading, refetch: refetchExpenses } = useTripExpenses(id);
  const { mutateAsync: addExpense, isPending: isAddingExpense } = useAddExpense();
  const { mutateAsync: settleTripExpenses, isPending: isSettling } = useSettleExpenses();
  const { mutateAsync: estimateBudget, data: aiEstimate, isPending: isEstimating } = useAIBudgetEstimate();
  const savedPropertyIds = useMemo(() => {
    if (!trip?.savedProperties?.length) return [] as string[];
    return Array.from(new Set(trip.savedProperties.map((item) => item.propertyId).filter(Boolean)));
  }, [trip?.savedProperties]);
  const { data: savedProperties = [], isLoading: isSavedPropertiesLoading } = usePropertiesByIds(savedPropertyIds);
  const { data: voteSummary = [] } = useTripVoteSummary(id);
  const { mutateAsync: castVote } = useCastVote();

  const savedPropertyMap = useMemo(() => {
    const map = new Map<string, any>();
    savedProperties.forEach((property) => map.set(property.id, property));
    mockProperties.forEach((property) => {
      if (!map.has(property.id)) {
        map.set(property.id, property);
      }
    });
    return map;
  }, [savedProperties]);

  const voteSummaryMap = useMemo(() => {
    const map = new Map<string, { up: number; down: number; userVote: "up" | "down" | null }>();
    voteSummary.forEach((row) => {
      map.set(row.propertyId, { up: row.up, down: row.down, userVote: row.userVote });
    });
    return map;
  }, [voteSummary]);
  
  // Log trip loading state
  useEffect(() => {
    console.log("📍 TripDetail - ID:", id, "isLoading:", isTripLoading, "trip:", trip);
  }, [id, isTripLoading, trip]);

  const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);
  const memberCount = Math.max(trip?.members.length || 1, 1);
  const perPerson = Math.round(totalExpenses / memberCount);

  const categoryColors: Record<string, string> = {
    food: "bg-orange-100 text-orange-700", transport: "bg-blue-100 text-blue-700",
    activity: "bg-purple-100 text-purple-700", accommodation: "bg-green-100 text-green-700",
    shopping: "bg-pink-100 text-pink-700", other: "bg-muted text-muted-foreground",
  };

  const handleRefreshExpenses = async () => {
    await refetchExpenses();
    toast({ title: "Expenses refreshed" });
  };

  const handleAddActivity = async () => {
    toast({ title: "Add activity feature coming soon", description: "Plan your itinerary in the next update." });
  };

  const handleAddExpense = async () => {
    if (!id || !expenseForm.description || !expenseForm.amount || !expenseForm.paidBy || expenseForm.splitWith.length === 0) {
      toast({ 
        title: "Please fill all fields",
        description: "Name, amount, who paid, and who it's split between are required.",
        variant: "destructive" 
      });
      return;
    }

    try {
      console.log("💰 Adding expense:", expenseForm);
      await addExpense({
        tripId: id,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        category: expenseForm.category,
        paidBy: expenseForm.paidBy,
        splitWith: expenseForm.splitWith,
        currency: trip?.currency || "INR",
        receipt: expenseForm.receipt || undefined,
      });
      
      toast({ title: "Expense added! 💸" });
      setExpenseForm({ description: "", amount: "", category: "food", paidBy: "", splitWith: [], receipt: "" });
      setOpenExpenseDialog(false);
      await refetchExpenses();
    } catch (error: any) {
      console.error("❌ Expense error:", error);
      toast({ 
        title: "Failed to add expense",
        description: error?.message || "Please try again.",
        variant: "destructive" 
      });
    }
  };

  const handleEstimateWithAI = async () => {
    if (!trip) return;
    try {
      const tierMultiplier: Record<typeof aiTier, number> = {
        budget: 0.8,
        standard: 1,
        luxury: 1.35,
      };
      const adjustedPerPerson = Math.round(trip.budgetPerPerson * tierMultiplier[aiTier]);
      const result = await estimateBudget({
        destination: trip.destination,
        nights: trip.nights,
        groupSize: trip.groupSize,
        budgetPerPerson: adjustedPerPerson,
      });
      toast({
        title: "AI budget estimate ready",
        description: `Estimated total: ${formatCurrency(result.estimate)}`,
      });
    } catch (error) {
      toast({ title: "Failed to generate estimate", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleSettleExpenses = async () => {
    if (!id) return;
    try {
      const result = await settleTripExpenses(id);
      const normalized = (result.settlements || []).map((item: any) => ({
        from: item.fromName || item.from || item.payerName || "Member",
        to: item.toName || item.to || item.receiverName || "Member",
        amount: Number(item.amount || 0),
      }));
      setSettlements(normalized);
      toast({ title: "Settlement calculated", description: `${normalized.length} transaction(s) generated` });
    } catch (error) {
      toast({ title: "Could not settle expenses", description: "Please retry.", variant: "destructive" });
    }
  };

  const handleVote = async (propertyId: string, voteType: "up" | "down") => {
    if (!id) return;
    try {
      await castVote({ tripId: id, propertyId, voteType });
      toast({ title: voteType === "up" ? "Upvote added" : "Downvote added" });
    } catch {
      toast({ title: "Vote failed", description: "Please try again.", variant: "destructive" });
    }
  };

  const handleInviteMember = async () => {
    if (!id || !inviteEmail.trim()) {
      toast({ title: "Invite email required", variant: "destructive" });
      return;
    }

    try {
      await inviteTripMember({ tripId: id, email: inviteEmail.trim().toLowerCase() });
      toast({ title: "Invite sent", description: `Invitation sent to ${inviteEmail.trim()}` });
      setInviteEmail("");
      setMemberSearch("");
      setOpenInviteDialog(false);
      await refetchInvites();
    } catch (error: any) {
      toast({
        title: "Invite failed",
        description: error?.message || "Could not send invite right now.",
        variant: "destructive",
      });
    }
  };

  const handleReceiptUpload = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please use an image under 2.5MB.", variant: "destructive" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setExpenseForm((prev) => ({ ...prev, receipt: String(reader.result || "") }));
      toast({ title: "Receipt attached" });
    };
    reader.readAsDataURL(file);
  };

  if (isTripLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="mt-6 h-12 w-full rounded-xl" />
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-72 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-4xl px-4 py-12 text-center lg:px-8">
          <h1 className="font-heading text-2xl font-bold text-foreground">Trip not found</h1>
          <p className="mt-2 text-muted-foreground">This trip may have been removed or you may not have access.</p>
          <Button className="mt-6" asChild>
            <Link to="/dashboard/trips">Back to Trips</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Header */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-heading text-2xl font-extrabold text-foreground lg:text-3xl">{trip.title}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{trip.destination}, {trip.country}</span>
                <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{formatDateRange(trip.checkIn, trip.checkOut)} · {trip.nights} nights</span>
                <span className="flex items-center gap-1"><Users className="h-4 w-4" />{trip.members.length}/{trip.groupSize} members</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                trip.status === "active" ? "bg-success/10 text-success" : trip.status === "planning" ? "bg-info/10 text-info" : "bg-muted text-muted-foreground"
              }`}>{trip.status}</span>
              <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(trip.inviteCode); toast({ title: "Invite code copied!" }); }}>
                <Copy className="mr-1 h-3.5 w-3.5" /> {trip.inviteCode}
              </Button>
            </div>
          </div>
          {/* Member avatars */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex -space-x-2">
              {trip.members.slice(0, 6).map((m) => (
                <div key={m.userId} className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-muted text-sm font-semibold text-foreground" title={m.name}>
                  {m.name[0]}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{trip.members.length} members</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
          {tabs.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`flex-1 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors ${
                i === activeTab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-heading text-xl font-bold text-foreground">Shortlisted Properties</h2>
                <Link to="/search" className="text-sm font-semibold text-primary hover:underline">Search More</Link>
              </div>
              {trip.savedProperties?.length ? (
                <div className="mb-4 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{trip.savedProperties.length} property shortlist{trip.savedProperties.length > 1 ? "s" : ""}</p>
                      <p className="text-sm text-muted-foreground">Saved directly from property detail while planning the trip.</p>
                    </div>
                    <Badge variant="secondary">Saved stays</Badge>
                  </div>
                </div>
              ) : null}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {isSavedPropertiesLoading &&
                  [...Array(3)].map((_, i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
                {!isSavedPropertiesLoading && savedPropertyIds.map((propertyId) => {
                  const p = savedPropertyMap.get(propertyId);
                  const voteRow = voteSummaryMap.get(propertyId) || { up: 0, down: 0, userVote: null };

                  if (!p) {
                    return (
                      <div key={propertyId} className="rounded-xl border border-dashed border-border bg-card p-4">
                        <p className="font-semibold text-foreground">Saved stay unavailable</p>
                        <p className="mt-1 text-sm text-muted-foreground">Property id: {propertyId}</p>
                        <p className="mt-2 text-xs text-muted-foreground">This stay was saved, but details are currently unavailable.</p>
                      </div>
                    );
                  }

                  return (
                    <div key={p.id} className="relative">
                      <Badge className="absolute left-3 top-3 z-10 shadow-sm">Saved</Badge>
                      <PropertyCard property={p} groupSize={trip.groupSize} showPerPerson />
                      <div className="mt-2 flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                        <span>Votes: {voteRow.up} up · {voteRow.down} down</span>
                        <Link className="font-semibold text-primary hover:underline" to={`/property/${p.id}`}>View details</Link>
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          className={`flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-success/10 ${voteRow.userVote === "up" ? "bg-success/10" : ""}`}
                          onClick={() => handleVote(p.id, "up")}
                        >
                          <ThumbsUp className="h-3.5 w-3.5 text-success" /> <span className="font-medium">Upvote</span>
                        </button>
                        <button
                          className={`flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-sm transition-colors hover:bg-destructive/10 ${voteRow.userVote === "down" ? "bg-destructive/10" : ""}`}
                          onClick={() => handleVote(p.id, "down")}
                        >
                          <ThumbsDown className="h-3.5 w-3.5 text-destructive" /> <span className="font-medium">Downvote</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
                {!isSavedPropertiesLoading && savedPropertyIds.length === 0 && (
                  <p className="text-sm text-muted-foreground">No shortlisted stays yet. Save a property from Property Details to see it here.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 1 && (
            <div>
              {/* Summary */}
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { label: "Total", value: formatCurrency(totalExpenses), color: "text-foreground" },
                  { label: "Per Person", value: formatCurrency(perPerson), color: "text-primary" },
                  { label: "Your Share", value: formatCurrency(perPerson), color: "text-info" },
                  { label: "Balance", value: formatCurrency(8500 - perPerson), color: perPerson > 8500 ? "text-destructive" : "text-success" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-medium text-muted-foreground">{s.label}</p>
                    <p className={`mt-1 font-heading text-xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              
              {/* Add Expense Dialog */}
              <Dialog open={openExpenseDialog} onOpenChange={setOpenExpenseDialog}>
                <DialogTrigger asChild>
                  <Button className="mt-6 rounded-lg"><Plus className="mr-2 h-4 w-4" /> Add Expense</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Trip Expense</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Expense Name *</label>
                      <Input 
                        placeholder="e.g., Dinner at restaurant" 
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Amount (₹) *</label>
                      <Input 
                        type="number" 
                        placeholder="1000" 
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      >
                        <option value="food">🍽️ Food</option>
                        <option value="transport">🚗 Transport</option>
                        <option value="accommodation">🏨 Accommodation</option>
                        <option value="activity">🎉 Activity</option>
                        <option value="shopping">🛍️ Shopping</option>
                        <option value="other">📌 Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Who Paid? *</label>
                      <select 
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={expenseForm.paidBy}
                        onChange={(e) => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                      >
                        <option value="">Select member...</option>
                        {trip?.members.map((m) => (
                          <option key={m.userId} value={m.userId}>{m.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Split Between *</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {trip?.members.map((m) => (
                          <label key={m.userId} className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={expenseForm.splitWith.includes(m.userId)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExpenseForm({
                                    ...expenseForm, 
                                    splitWith: [...expenseForm.splitWith, m.userId]
                                  });
                                } else {
                                  setExpenseForm({
                                    ...expenseForm,
                                    splitWith: expenseForm.splitWith.filter(id => id !== m.userId)
                                  });
                                }
                              }}
                              className="rounded"
                            />
                            <span className="text-sm text-foreground">{m.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Bill photo or payment screenshot</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleReceiptUpload(e.target.files?.[0])}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">Optional. Upload helps everyone verify shared expenses.</p>
                      <div className="mt-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">or paste image URL</label>
                        <Input
                          placeholder="https://..."
                          value={expenseForm.receipt.startsWith("data:") ? "" : expenseForm.receipt}
                          onChange={(e) => setExpenseForm({ ...expenseForm, receipt: e.target.value })}
                        />
                      </div>
                      {expenseForm.receipt && (
                        <div className="mt-3 rounded-lg border border-border p-2">
                          <img
                            src={expenseForm.receipt}
                            alt="Receipt preview"
                            className="h-28 w-full rounded object-cover"
                          />
                          <button
                            type="button"
                            className="mt-2 text-xs font-semibold text-destructive"
                            onClick={() => setExpenseForm({ ...expenseForm, receipt: "" })}
                          >
                            Remove attachment
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        className="flex-1"
                        onClick={handleAddExpense} 
                        disabled={isAddingExpense}
                      >
                        {isAddingExpense ? "Adding..." : "Add Expense"}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setOpenExpenseDialog(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Expense list */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-lg font-bold text-foreground">All Expenses</h3>
                  <Button size="sm" variant="outline" onClick={handleRefreshExpenses} disabled={isExpensesLoading}><Plus className="mr-1 h-3.5 w-3.5" /> Refresh</Button>
                </div>
                <div className="mt-4 space-y-2">
                  {isExpensesLoading && <Skeleton className="h-16 w-full rounded-xl" />}
                  {expenses.map((exp) => (
                    <div key={exp.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${categoryColors[exp.category] || categoryColors.other}`}>
                        {exp.category}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{exp.description}</p>
                        <p className="text-xs text-muted-foreground">Paid by {exp.paidByName}</p>
                        {exp.receipt && (
                          <a
                            href={exp.receipt}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block text-xs font-semibold text-primary hover:underline"
                          >
                            View bill/screenshot
                          </a>
                        )}
                      </div>
                      <span className="font-heading text-sm font-bold text-foreground">{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                  {!isExpensesLoading && expenses.length === 0 && <p className="text-sm text-muted-foreground">No expenses added yet.</p>}
                </div>
              </div>
              {/* Settlement */}
              <div className="mt-6 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-foreground">Settlement</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Who owes whom</p>
                  </div>
                  <Button size="sm" onClick={handleSettleExpenses} disabled={isSettling}>
                    {isSettling ? "Calculating..." : "Calculate"}
                  </Button>
                </div>
                <div className="mt-4 space-y-3">
                  {settlements.map((item, idx) => (
                    <div key={`${item.from}-${item.to}-${idx}`} className="flex items-center justify-between rounded-lg bg-background p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10 text-xs font-bold text-destructive">{item.from[0]}</div>
                        <span className="text-sm font-medium text-foreground">{item.from}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">pays</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{item.to}</span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/10 text-xs font-bold text-success">{item.to[0]}</div>
                      </div>
                      <span className="font-heading text-sm font-bold text-primary">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  {settlements.length === 0 && <p className="text-sm text-muted-foreground">Click calculate to generate settlements.</p>}
                </div>
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-4">
              {Array.from({ length: trip.nights }, (_, i) => {
                const date = new Date(trip.checkIn);
                date.setDate(date.getDate() + i);
                return (
                  <div key={i} className="rounded-xl border border-border bg-card p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading text-base font-bold text-foreground">Day {i + 1} — {formatDate(date)}</h3>
                      <Button variant="outline" size="sm" onClick={handleAddActivity}><Plus className="mr-1 h-3.5 w-3.5" /> Add Activity</Button>
                    </div>
                    {i === 0 && (
                      <div className="mt-4 space-y-3">
                        {[
                          { time: "10:00 AM", title: "Check-in at villa", cat: "accommodation" },
                          { time: "01:00 PM", title: "Beach lunch at Curlies", cat: "food" },
                          { time: "04:00 PM", title: "Explore Anjuna Beach", cat: "sightseeing" },
                          { time: "08:00 PM", title: "Group dinner & bonfire", cat: "food" },
                        ].map((act, j) => (
                          <div key={j} className="flex items-start gap-3 border-l-2 border-primary/30 pl-4">
                            <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{act.time}</span>
                            <span className="text-sm text-foreground">{act.title}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {i > 0 && <p className="mt-3 text-sm text-muted-foreground">No activities planned yet</p>}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 3 && (
            <div className="mx-auto max-w-xl">
              <div className="rounded-2xl border border-border bg-card p-6 text-center shadow-card">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <h2 className="mt-4 font-heading text-2xl font-bold text-foreground">AI Budget Estimator</h2>
                <p className="mt-2 text-muted-foreground">Get AI-powered cost estimates for your trip</p>
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
                    <span className="text-sm text-muted-foreground">Destination</span>
                    <span className="text-sm font-semibold text-foreground">{trip.destination}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-semibold text-foreground">{trip.nights} days</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-background px-4 py-3">
                    <span className="text-sm text-muted-foreground">Group Size</span>
                    <span className="text-sm font-semibold text-foreground">{trip.groupSize} people</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  {[
                    { key: "budget", label: "Budget" },
                    { key: "standard", label: "Standard" },
                    { key: "luxury", label: "Luxury" },
                  ].map((tier) => (
                    <button
                      key={tier.key}
                      onClick={() => setAiTier(tier.key as typeof aiTier)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                        aiTier === tier.key
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
                <Button className="mt-6 w-full rounded-xl py-5" onClick={handleEstimateWithAI} disabled={isEstimating}>
                  <Sparkles className="mr-2 h-4 w-4" /> {isEstimating ? "Generating..." : "Estimate with AI"}
                </Button>
                {aiEstimate && (
                  <div className="mt-6 rounded-xl bg-background p-4 text-left">
                    <p className="text-sm text-muted-foreground">Estimated total</p>
                    <p className="font-heading text-2xl font-bold text-foreground">{formatCurrency(aiEstimate.estimate)}</p>
                    {Array.isArray(aiEstimate.tips) && aiEstimate.tips.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {aiEstimate.tips.slice(0, 3).map((tip, idx) => (
                          <li key={`${tip}-${idx}`}>• {tip}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-heading text-xl font-bold text-foreground">Members</h2>
                  <p className="text-sm text-muted-foreground">{trip.members.length} of {trip.groupSize} joined</p>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={openInviteDialog} onOpenChange={setOpenInviteDialog}>
                    <DialogTrigger asChild>
                      <Button size="sm">
                        <UserPlus className="mr-1 h-3.5 w-3.5" /> Invite Collaborator
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Invite collaborator</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground">Search by name or email</label>
                          <Input
                            placeholder="Type name or email"
                            value={memberSearch}
                            onChange={(e) => {
                              const value = e.target.value;
                              setMemberSearch(value);
                              setInviteEmail(value);
                            }}
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-sm font-medium text-foreground">Invite email</label>
                          <Input
                            placeholder="friend@example.com"
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                          />
                        </div>

                        {memberSearch.trim().length >= 2 && (
                          <div className="max-h-44 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
                            {isSearchingUsers && <p className="px-2 py-1 text-xs text-muted-foreground">Searching users...</p>}
                            {!isSearchingUsers && searchResults.length === 0 && (
                              <p className="px-2 py-1 text-xs text-muted-foreground">No matching users found. You can still invite by email.</p>
                            )}
                            {searchResults.map((userResult) => (
                              <button
                                key={userResult.id}
                                type="button"
                                onClick={() => setInviteEmail(userResult.email)}
                                className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-muted"
                              >
                                <span>
                                  <span className="block text-sm font-medium text-foreground">{userResult.name}</span>
                                  <span className="block text-xs text-muted-foreground">{userResult.email}</span>
                                </span>
                                <span className="text-xs font-medium text-primary">Select</span>
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <Button className="flex-1" onClick={handleInviteMember} disabled={isInviting}>
                            {isInviting ? "Sending..." : "Send Invite"}
                          </Button>
                          <Button variant="outline" className="flex-1" onClick={() => setOpenInviteDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(`https://splitsvilla.app/join/${trip.inviteCode}`); toast({ title: "Invite link copied!" }); }}>
                    <Copy className="mr-1 h-3.5 w-3.5" /> Copy Invite Link
                  </Button>
                </div>
              </div>

              {invites.filter((invite) => invite.status === "pending").length > 0 && (
                <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Pending invites</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        refetchInvites();
                        refetchTrip();
                      }}
                    >
                      Refresh
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {invites
                      .filter((invite) => invite.status === "pending")
                      .slice(0, 6)
                      .map((invite) => (
                        <div key={invite.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2">
                          <span className="text-sm text-foreground">{invite.inviteeEmail}</span>
                          <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs font-medium text-info">pending</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {trip.members.map((m) => (
                  <div key={m.userId} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                      {m.name[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">{m.name}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${m.role === "organizer" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                          {m.role}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{m.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{formatCurrency(m.totalContributed)}</p>
                      <p className="text-xs text-muted-foreground">contributed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 5 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Calendar className="h-16 w-16 text-muted" />
              <h3 className="mt-4 font-heading text-xl font-bold text-foreground">No bookings yet</h3>
              <p className="mt-2 text-muted-foreground">Finalize a property to create a booking for this trip</p>
              <Button className="mt-6 rounded-full" onClick={() => setActiveTab(0)}>Browse Properties</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
