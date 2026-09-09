import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  DollarSign,
  Utensils,
  Compass,
  Car,
  Palmtree,
  ShoppingBag,
  Sparkles,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/utils/formatCurrency";
import { ItineraryDay, Activity } from "@/types";

interface ItineraryTimelineProps {
  days: ItineraryDay[];
  groupSize: number;
  onAddActivity: (dayId: string, activity: Omit<Activity, "id">) => void;
  onDeleteActivity: (dayId: string, activityId: string) => void;
  isHostOrOrganizer?: boolean;
}

const CATEGORY_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  food: { icon: Utensils, color: "text-amber-500 bg-amber-500/10 border-amber-500/20", label: "Dining & Food" },
  sightseeing: { icon: Compass, color: "text-blue-500 bg-blue-500/10 border-blue-500/20", label: "Sightseeing" },
  adventure: { icon: Sparkles, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20", label: "Adventure" },
  leisure: { icon: Palmtree, color: "text-purple-500 bg-purple-500/10 border-purple-500/20", label: "Leisure & Relax" },
  transport: { icon: Car, color: "text-orange-500 bg-orange-500/10 border-orange-500/20", label: "Transport" },
  shopping: { icon: ShoppingBag, color: "text-pink-500 bg-pink-500/10 border-pink-500/20", label: "Shopping" },
};

function getTimeSlot(timeStr: string): "morning" | "afternoon" | "evening" {
  if (!timeStr) return "morning";
  const hour = parseInt(timeStr.split(":")[0], 10);
  if (isNaN(hour)) return "morning";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

const TIME_SLOT_HEADERS = {
  morning: { title: "Morning (6 AM - 12 PM)", icon: Sun, color: "text-amber-400" },
  afternoon: { title: "Afternoon (12 PM - 5 PM)", icon: Sunset, color: "text-orange-400" },
  evening: { title: "Evening & Night (5 PM onwards)", icon: Moon, color: "text-indigo-400" },
};

export function ItineraryTimeline({
  days,
  groupSize,
  onAddActivity,
  onDeleteActivity,
  isHostOrOrganizer = true,
}: ItineraryTimelineProps) {
  const [selectedDayId, setSelectedDayId] = useState<string>(days[0]?.id || "day-1");
  const [openModal, setOpenModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    title: "",
    time: "09:00",
    category: "sightseeing" as Activity["category"],
    location: "",
    notes: "",
    estimatedCost: 0,
  });

  const activeDay = days.find((d) => d.id === selectedDayId) || days[0];

  // Calculate total day budget and per-person cost
  const dayActivities = activeDay?.activities || [];
  const dayTotalCost = dayActivities.reduce((acc, a) => acc + (a.estimatedCost || 0), 0);
  const dayPerPersonCost = Math.round(dayTotalCost / Math.max(groupSize, 1));

  // Group activities into time slots
  const slots: Record<"morning" | "afternoon" | "evening", Activity[]> = {
    morning: [],
    afternoon: [],
    evening: [],
  };

  dayActivities.forEach((act) => {
    const slot = getTimeSlot(act.time);
    slots[slot].push(act);
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActivity.title.trim()) return;

    onAddActivity(activeDay.id, {
      title: newActivity.title.trim(),
      time: newActivity.time,
      category: newActivity.category,
      location: newActivity.location.trim() || undefined,
      notes: newActivity.notes.trim() || undefined,
      estimatedCost: Number(newActivity.estimatedCost) || 0,
    });

    setNewActivity({
      title: "",
      time: "09:00",
      category: "sightseeing",
      location: "",
      notes: "",
      estimatedCost: 0,
    });
    setOpenModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Day Selector Ribbon with Cost Rollups */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {days.map((day) => {
          const totalCost = day.activities.reduce((sum, a) => sum + (a.estimatedCost || 0), 0);
          const isSelected = day.id === selectedDayId;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`flex-shrink-0 text-left rounded-xl p-3 border transition-all duration-200 min-w-[140px] ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-sm"
                  : "border-border/70 bg-card/50 hover:bg-card/90"
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-xs font-bold ${isSelected ? "text-primary" : "text-foreground"}`}>
                  Day {day.dayNumber}
                </span>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4">
                  {day.activities.length} acts
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{day.date || `Day ${day.dayNumber}`}</p>
              {totalCost > 0 && (
                <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                  {formatCurrency(totalCost)}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Day Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading text-lg font-bold text-foreground">
              Day {activeDay?.dayNumber} Schedule
            </h3>
            <span className="text-sm text-muted-foreground">• {activeDay?.date}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organized time blocks with estimated group budgets
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Daily Budget Pill */}
          <div className="rounded-xl bg-muted/60 px-3.5 py-2 text-right border border-border/60">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block font-semibold">
              Day Total / Per Person
            </span>
            <div className="flex items-baseline gap-1.5 justify-end">
              <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(dayTotalCost)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({formatCurrency(dayPerPersonCost)}/pers)
              </span>
            </div>
          </div>

          {isHostOrOrganizer && (
            <Dialog open={openModal} onOpenChange={setOpenModal}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm">
                  <Plus className="h-4 w-4" /> Add Activity
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="font-heading">
                    Add Activity to Day {activeDay?.dayNumber}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleCreate} className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Activity Title</label>
                    <Input
                      placeholder="e.g. Scuba Diving at Grand Island"
                      value={newActivity.title}
                      onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Time</label>
                      <Input
                        type="time"
                        value={newActivity.time}
                        onChange={(e) => setNewActivity({ ...newActivity, time: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Category</label>
                      <Select
                        value={newActivity.category}
                        onValueChange={(val: any) => setNewActivity({ ...newActivity, category: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sightseeing">Sightseeing</SelectItem>
                          <SelectItem value="food">Dining & Food</SelectItem>
                          <SelectItem value="adventure">Adventure</SelectItem>
                          <SelectItem value="leisure">Leisure</SelectItem>
                          <SelectItem value="transport">Transport</SelectItem>
                          <SelectItem value="shopping">Shopping</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Location (Optional)</label>
                      <Input
                        placeholder="e.g. Baga Beach"
                        value={newActivity.location}
                        onChange={(e) => setNewActivity({ ...newActivity, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Est. Total Cost (₹)</label>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={newActivity.estimatedCost || ""}
                        onChange={(e) => setNewActivity({ ...newActivity, estimatedCost: Number(e.target.value) })}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Notes (Optional)</label>
                    <Input
                      placeholder="e.g. Bring extra towels and sunscreen"
                      value={newActivity.notes}
                      onChange={(e) => setNewActivity({ ...newActivity, notes: e.target.value })}
                    />
                  </div>

                  <Button type="submit" className="w-full mt-2">
                    Save Activity
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Visual Timeline Grouped by Time Slots */}
      <div className="space-y-6">
        {(["morning", "afternoon", "evening"] as const).map((slotKey) => {
          const slotActivities = slots[slotKey];
          const header = TIME_SLOT_HEADERS[slotKey];
          const SlotIcon = header.icon;

          return (
            <div key={slotKey} className="space-y-3">
              {/* Slot Header */}
              <div className="flex items-center gap-2 px-1">
                <SlotIcon className={`h-4 w-4 ${header.color}`} />
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {header.title}
                </h4>
                <div className="h-px flex-1 bg-border/60" />
              </div>

              {slotActivities.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">
                  No activities planned for this time window.
                </div>
              ) : (
                <div className="relative pl-6 space-y-3 border-l-2 border-primary/30 ml-2">
                  {slotActivities.map((act) => {
                    const cat = CATEGORY_CONFIG[act.category] || CATEGORY_CONFIG.sightseeing;
                    const CatIcon = cat.icon;

                    return (
                      <div
                        key={act.id}
                        className="group relative rounded-xl border border-border/80 bg-card/80 p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
                      >
                        {/* Timeline Bullet */}
                        <div className="absolute -left-[31px] top-5 h-3.5 w-3.5 rounded-full border-2 border-primary bg-background" />

                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className={`text-[11px] font-semibold flex items-center gap-1 ${cat.color}`}>
                                <CatIcon className="h-3 w-3" />
                                {cat.label}
                              </Badge>
                              <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {act.time}
                              </span>
                            </div>

                            <h5 className="font-heading font-bold text-base text-foreground pt-1">
                              {act.title}
                            </h5>

                            {act.location && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-primary" /> {act.location}
                              </p>
                            )}

                            {act.notes && (
                              <p className="text-xs text-muted-foreground/80 italic mt-1">
                                💬 {act.notes}
                              </p>
                            )}
                          </div>

                          <div className="text-right flex flex-col items-end gap-2 shrink-0">
                            {act.estimatedCost && act.estimatedCost > 0 ? (
                              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-right">
                                <span className="text-[10px] text-muted-foreground block">Cost</span>
                                <span className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                                  {formatCurrency(act.estimatedCost)}
                                </span>
                              </div>
                            ) : null}

                            {isHostOrOrganizer && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => onDeleteActivity(activeDay.id, act.id)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ItineraryTimeline;
