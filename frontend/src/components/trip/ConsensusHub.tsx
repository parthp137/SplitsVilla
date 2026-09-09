import React from "react";
import { ThumbsUp, ThumbsDown, Sparkles, CheckCircle2, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TripMember, VoteSummary } from "@/types";

interface ConsensusHubProps {
  propertyId: string;
  voteSummary?: VoteSummary;
  members: TripMember[];
  totalVotersCount: number;
  isLeading?: boolean;
}

export function ConsensusHub({
  propertyId,
  voteSummary,
  members,
  totalVotersCount,
  isLeading = false,
}: ConsensusHubProps) {
  const upVotes = voteSummary?.up || 0;
  const downVotes = voteSummary?.down || 0;
  const totalVotesCast = upVotes + downVotes;
  const effectiveVoters = Math.max(totalVotersCount, 1);
  
  // Consensus percentage based on upvotes vs total group size
  const consensusPercentage = Math.round((upVotes / effectiveVoters) * 100);
  const isUnanimous = upVotes >= effectiveVoters && effectiveVoters > 1;
  const isConsensusReached = consensusPercentage >= 60;

  // Derive mock/pseudo voter lists from members for visual avatar demonstration if not individually tracked
  const upVoters = members.slice(0, upVotes);
  const downVoters = members.slice(upVotes, upVotes + downVotes);

  return (
    <div className="rounded-xl border border-border/70 bg-card/60 backdrop-blur-sm p-3.5 space-y-3 shadow-sm transition-all hover:border-border">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-medium text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>Group Consensus</span>
          </div>
          {isLeading && (
            <Badge variant="default" className="bg-gradient-to-r from-amber-500 to-orange-500 text-[10px] font-semibold text-white px-2 py-0.5 flex items-center gap-1">
              <Award className="h-3 w-3" /> Top Choice
            </Badge>
          )}
        </div>

        {isUnanimous ? (
          <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[11px] font-medium flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-emerald-500 animate-pulse" />
            100% Unanimous
          </Badge>
        ) : isConsensusReached ? (
          <Badge className="bg-primary/15 text-primary border-primary/30 text-[11px] font-medium flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            {consensusPercentage}% Consensus
          </Badge>
        ) : (
          <span className="text-[11px] text-muted-foreground">
            {totalVotesCast} of {effectiveVoters} voted
          </span>
        )}
      </div>

      {/* Progress meter */}
      <div className="space-y-1">
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary/80">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isUnanimous
                ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                : isConsensusReached
                ? "bg-gradient-to-r from-primary to-violet-500"
                : "bg-muted-foreground/40"
            }`}
            style={{ width: `${Math.min(consensusPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Voter avatars breakdown */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ThumbsUp className="h-3 w-3" />
            <span>{upVotes}</span>
          </div>

          {/* Upvoter Avatar stack */}
          {upVoters.length > 0 && (
            <div className="flex -space-x-1.5 overflow-hidden">
              {upVoters.map((member, idx) => (
                <TooltipProvider key={member.userId || idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block h-5 w-5 rounded-full ring-1.5 ring-emerald-500/60 bg-emerald-100 dark:bg-emerald-950 text-[9px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center uppercase cursor-default">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {member.name} voted Yes 👍
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
        </div>

        {downVotes > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-rose-500 font-medium">
              <ThumbsDown className="h-3 w-3" />
              <span>{downVotes}</span>
            </div>

            {/* Downvoter Avatar stack */}
            <div className="flex -space-x-1.5 overflow-hidden">
              {downVoters.map((member, idx) => (
                <TooltipProvider key={member.userId || idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-block h-5 w-5 rounded-full ring-1.5 ring-rose-500/60 bg-rose-100 dark:bg-rose-950 text-[9px] font-bold text-rose-700 dark:text-rose-300 flex items-center justify-center uppercase cursor-default">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                        ) : (
                          member.name.charAt(0)
                        )}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      {member.name} voted No 👎
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsensusHub;
