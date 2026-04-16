import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Loader, X, ChevronDown, Filter, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  createdAt: Date;
  isDefault?: boolean;
}

export interface AdvancedFilterProps {
  onFilterChange: (filters: Record<string, any>) => void;
  activeFilters: Record<string, any>;
  hasActiveFilters: boolean;
  onReset: () => void;
}

/**
 * Advanced Filter UI Component
 * Provides filter presets, save/load, and better UX for complex searches
 */
export function AdvancedFilters({
  onFilterChange,
  activeFilters,
  hasActiveFilters,
  onReset,
}: AdvancedFilterProps) {
  const { toast } = useToast();
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Load presets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("searchPresets");
    if (saved) {
      try {
        setPresets(
          JSON.parse(saved).map((p: any) => ({
            ...p,
            createdAt: new Date(p.createdAt),
          }))
        );
      } catch (error) {
        console.error("Failed to load presets:", error);
      }
    }
  }, []);

  // Save presets to localStorage
  useEffect(() => {
    localStorage.setItem("searchPresets", JSON.stringify(presets));
  }, [presets]);

  const saveCurrentFiltersAsPreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for this filter preset",
        variant: "destructive",
      });
      return;
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName,
      filters: activeFilters,
      createdAt: new Date(),
    };

    setPresets([...presets, newPreset]);
    setPresetName("");
    toast({
      title: "Preset saved",
      description: `"${presetName}" has been saved`,
    });
  };

  const loadPreset = (preset: FilterPreset) => {
    onFilterChange(preset.filters);
    setSelectedPreset(preset.id);
    toast({
      title: "Preset loaded",
      description: `"${preset.name}" has been applied`,
    });
  };

  const deletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    if (selectedPreset === id) setSelectedPreset(null);
    toast({
      title: "Preset deleted",
      description: "The filter preset has been removed",
    });
  };

  const makePresetDefault = (id: string) => {
    setPresets(
      presets.map((p) => ({
        ...p,
        isDefault: p.id === id,
      }))
    );
  };

  return (
    <div className="space-y-4">
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-2"
        >
          <span className="text-xs font-medium text-muted-foreground">Active:</span>
          {Object.entries(activeFilters).map(([key, value]) => (
            value !== undefined &&
            value !== null &&
            value !== "" && (
              <Badge key={key} variant="secondary" className="max-w-xs truncate">
                {key}: {String(value).substring(0, 15)}
              </Badge>
            )
          ))}
          <Button
            size="sm"
            variant="ghost"
            onClick={onReset}
            className="h-6 px-2 text-xs"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Clear
          </Button>
        </motion.div>
      )}

      {/* Presets Manager */}
      <motion.div
        layout
        className="relative"
      >
        <Button
          onClick={() => setShowPresets(!showPresets)}
          variant="outline"
          size="sm"
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter Presets
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              showPresets ? "rotate-180" : ""
            }`}
          />
        </Button>

        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 z-40 bg-background border border-primary/20 rounded-lg shadow-lg overflow-hidden"
            >
              <Card className="border-0 rounded-none">
                {/* Save Current Filters */}
                <CardHeader className="pb-3 border-b border-primary/10">
                  <CardTitle className="text-sm">Save Current Search</CardTitle>
                </CardHeader>
                <CardContent className="pt-3 border-b border-primary/10 pb-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Preset name..."
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      className="text-sm h-8"
                    />
                    <Button
                      size="sm"
                      onClick={saveCurrentFiltersAsPreset}
                      disabled={!hasActiveFilters || !presetName}
                      className="h-8"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </CardContent>

                {/* Saved Presets */}
                {presets.length > 0 ? (
                  <CardContent className="pt-3 space-y-2 max-h-48 overflow-y-auto">
                    {presets.map((preset) => (
                      <motion.div
                        key={preset.id}
                        layout
                        className={`p-2 rounded-lg border transition-all cursor-pointer group ${
                          selectedPreset === preset.id
                            ? "border-primary/50 bg-primary/10"
                            : "border-primary/20 hover:border-primary/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <button
                            onClick={() => loadPreset(preset)}
                            className="flex-1 text-left"
                          >
                            <div className="text-sm font-medium flex items-center gap-1">
                              <Loader className="h-3 w-3" />
                              {preset.name}
                              {preset.isDefault && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs h-5"
                                >
                                  Default
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {Object.keys(preset.filters).length} filters
                            </p>
                          </button>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => makePresetDefault(preset.id)}
                              className="p-1 hover:bg-muted rounded text-xs"
                              title="Make default"
                            >
                              ⭐
                            </button>
                            <button
                              onClick={() => deletePreset(preset.id)}
                              className="p-1 hover:bg-destructive/10 rounded text-destructive"
                              title="Delete"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </CardContent>
                ) : (
                  <CardContent className="pt-3 pb-3 text-center">
                    <p className="text-xs text-muted-foreground">
                      No presets saved yet
                    </p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default AdvancedFilters;
