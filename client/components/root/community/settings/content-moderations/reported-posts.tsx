"use client";

import React from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  Trash2,
  Eye,
  ShieldCheck,
  User,
  MessageSquare,
  FileText,
  Flag,
  Calendar,
} from "lucide-react";
import { Community } from "@/types/community";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/axios";

// Components
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  community: Community;
}

interface Report {
  id: string;
  targetType: "post" | "comment" | "member";
  targetId: string;
  reason: string;
  reporter: { id: string; name: string; username?: string };
  createdAt: string;
  targetContentPreview?: string;
}

export default function ContentModerationsReportedPostsSettings({
  community,
}: Props) {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["community-reports", community.id],
    queryFn: async () => {
      const res = await apiClient.get(`/community/${community.id}/reports`);
      return res.data;
    },
  });

  const { mutate: resolveReport, isPending: isResolving } = useMutation({
    mutationFn: async ({
      reportId,
      action,
    }: {
      reportId: string;
      action: "keep" | "delete" | "dismiss";
    }) => {
      return apiClient.post(`/community/reports/${reportId}/resolve`, {
        action,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-reports", community.id],
      });
    },
  });

  const getTargetIcon = (type: string) => {
    switch (type) {
      case "post":
        return <FileText size={14} />;
      case "comment":
        return <MessageSquare size={14} />;
      case "member":
        return <User size={14} />;
      default:
        return <Flag size={14} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-foreground-tertiary font-medium">
          Scanning for reports...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-8 border-b pb-6">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            Reported Content
          </h3>
          <p className="text-sm text-foreground-tertiary mt-1">
            Review content flagged by the community for violations.
          </p>
        </div>
        <Badge
          variant="destructive"
          className="h-7 px-3 text-sm font-bold rounded-full bg-destructive/10 text-destructive border-none"
        >
          {reports?.length || 0} Open Reports
        </Badge>
      </div>

      {/* Transparent List Layout */}
      <div className="flex flex-col">
        {reports?.map((report) => (
          <div
            key={report.id}
            className="group flex flex-col py-8 border-b last:border-0 hover:bg-accent/5 px-2 transition-colors -mx-2 rounded-2xl"
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              {/* Identity & Type Section */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className="relative shrink-0 pt-1">
                  <div className="h-10 w-10 rounded-xl bg-destructive/5 flex items-center justify-center text-destructive ring-1 ring-destructive/20">
                    <Flag size={20} />
                  </div>
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-widest text-destructive">
                      Report Type: {report.targetType}
                    </span>
                    <span className="text-foreground-tertiary text-xs">•</span>
                    <div className="flex items-center gap-1.5 text-xs text-foreground-tertiary">
                      <Calendar size={12} />
                      {formatDistanceToNow(new Date(report.createdAt))} ago
                    </div>
                  </div>

                  {/* Reason Block */}
                  <div className="mt-3 space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground-tertiary/60">
                      Reason for report
                    </p>
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      {report.reason}
                    </p>
                  </div>

                  {/* Reporter Info */}
                  <div className="flex items-center gap-2 mt-4">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[8px] font-bold uppercase bg-accent">
                        {report.reporter.name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] text-foreground-tertiary">
                      Reported by{" "}
                      <span className="font-bold text-foreground-secondary">
                        {report.reporter.name}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end md:self-start shrink-0">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 rounded-full text-foreground-tertiary hover:bg-accent hover:text-foreground"
                        onClick={() =>
                          alert(`Reviewing ID: ${report.targetId}`)
                        }
                      >
                        <Eye size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">
                      View Context
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isResolving}
                        onClick={() =>
                          resolveReport({
                            reportId: report.id,
                            action: "dismiss",
                          })
                        }
                        className="h-10 w-10 rounded-full text-primary hover:bg-primary/10 hover:text-primary"
                      >
                        <ShieldCheck size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">
                      Safe (Dismiss)
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isResolving}
                        onClick={() => {
                          if (
                            window.confirm("Confirm deletion of this content?")
                          )
                            resolveReport({
                              reportId: report.id,
                              action: "delete",
                            });
                        }}
                        className="h-10 w-10 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="font-bold">
                      Delete Content
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Content Preview (If provided) */}
            {report.targetContentPreview && (
              <div className="mt-6 ml-14 p-4 rounded-2xl bg-accent/30 border-l-4 border-destructive/20 italic text-sm text-foreground-secondary leading-relaxed">
                {report.targetContentPreview}
              </div>
            )}
          </div>
        ))}

        {/* Empty State */}
        {reports?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-accent/30 flex items-center justify-center mb-4">
              <ShieldCheck className="h-10 w-10 text-primary opacity-40" />
            </div>
            <p className="text-lg font-bold text-foreground">
              Community is Safe
            </p>
            <p className="text-sm text-foreground-tertiary max-w-xs mt-1">
              There are no pending reports. Your community is following the
              guidelines perfectly.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
