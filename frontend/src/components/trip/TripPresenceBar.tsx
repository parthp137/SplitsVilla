import React from "react";
import { Users, Eye, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { TripMember } from "@/types";

interface TripPresenceBarProps {
  members: TripMember[];
  currentUserId?: string;
}

export function TripPresenceBar({ members, currentUserId }: TripPresenceBarProps) {
  // Simulate active / recently online status across group members
  const activeMembers = members.slice(0, 5);

  return (
    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-card/60 backdrop-blur-md px-3 py-1.5 shadow-sm">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium pr-1">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="hidden sm:inline">Active Now:</span>
      </div>

      {/* Stacked avatars with live rings */}
      <div className="flex -space-x-2 overflow-hidden">
        {activeMembers.map((member, i) => {
          const isMe = String(member.userId) === String(currentUserId);
          const initial = member.name ? member.name.charAt(0).toUpperCase() : "U";

          return (
            <TooltipProvider key={member.userId || i}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative inline-block">
                    <div className="h-7 w-7 rounded-full ring-2 ring-background bg-gradient-to-tr from-primary/80 to-violet-500 text-white font-bold text-[10px] flex items-center justify-center cursor-pointer transition-transform hover:scale-110 hover:z-10 shadow-sm">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        initial
                      )}
                    </div>
                    {/* Tiny active green dot */}
                    <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-background" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  <p className="font-semibold">{member.name} {isMe ? "(You)" : ""}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{member.role} • Viewing trip</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {members.length > 5 && (
        <span className="text-[11px] font-semibold text-muted-foreground pl-1">
          +{members.length - 5}
        </span>
      )}
    </div>
  );
}

export default TripPresenceBar;
