import React from "react";
import { AlertTriangle, Trash2, Eye, ShieldCheck } from "lucide-react";
import { Community } from "@/types/community";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/config/axios";

interface Props {
  community: Community;
}

interface Report {
  id: string;
  targetType: "post" | "comment" | "member";
  targetId: string;
  reason: string;
  reporter: { id: string; name: string };
  createdAt: string;
  // Included purely for UI preview
  targetContentPreview?: string;
}

export default function ContentModerationsReportedPostsSettings({ community }: Props) {
  const queryClient = useQueryClient();

  // --- 1. Fetch Reports ---
  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["community-reports", community.id],
    queryFn: async () => {
      // Endpoint expectation: GET /community/:id/reports
      const res = await apiClient.get(`/community/${community.id}/reports`);
      return res.data;
    },
  });

  // --- 2. Resolve Report Mutation ---
  const { mutate: resolveReport } = useMutation({
    mutationFn: async ({ reportId, action }: { reportId: string; action: "keep" | "delete" | "dismiss" }) => {
      // Endpoint expectation: POST /community/reports/:id/resolve
      return apiClient.post(`/community/reports/${reportId}/resolve`, { action });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community-reports", community.id] });
    },
  });

  if (isLoading) return <div className="p-4 text-gray-500">Loading reports...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Reported Content</h3>
        <p className="text-sm text-gray-500">
          Investigate reports submitted by community members.
        </p>
      </div>

      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Type</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reason</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Reported By</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {reports?.map((report) => (
              <tr key={report.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    report.targetType === 'post' ? 'bg-blue-100 text-blue-800' :
                    report.targetType === 'member' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.targetType.toUpperCase()}
                  </span>
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate" title={report.reason}>
                  {report.reason}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {report.reporter.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {new Date(report.createdAt).toLocaleDateString()}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                  <div className="flex justify-end gap-2">
                    {/* View Context */}
                    <button
                       className="text-gray-400 hover:text-gray-600"
                       title="View Content"
                       onClick={() => alert(`Preview content ID: ${report.targetId}`)} // Replace with modal trigger
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Keep / Dismiss Report */}
                    <button
                      onClick={() => resolveReport({ reportId: report.id, action: "dismiss" })}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Keep Content (Dismiss Report)"
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>

                    {/* Delete Content */}
                    <button
                      onClick={() => {
                        if(window.confirm("Are you sure? This will delete the content."))
                          resolveReport({ reportId: report.id, action: "delete" })
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reports?.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center text-gray-500">
                    <AlertTriangle className="h-8 w-8 mb-2 text-gray-300" />
                    <span>No active reports. Good job!</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
