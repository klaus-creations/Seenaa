"use client";

import React, { useState } from "react";
import { Menu } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { CommunitySettingsSidebar } from "./community-settings-sidebar";
import { useCommunitySettings } from "@/features/slices/community-settings";

// Settings components imports
import GeneralCommunityInfoSettings from "./settings/general/community-info";
import GeneralCommunityRulesSettings from "./settings/general/community-rules";
import GeneralPrivacyPolicySettings from "./settings/general/privacy-policy";
import GeneralWelcomeMessageSettings from "./settings/general/welcome-message";
import MembersRolesAllMembersSettings from "./settings/members-roles/all-members-settings";
import MembersRolesPendingRequestSettings from "./settings/members-roles/pending-request";
import MembersRolesBannedMembersSettings from "./settings/members-roles/banned-members";
import MembersRolesAdminsModeratorsSettings from "./settings/members-roles/admins-moderators";
import ContentModerationsPostApprovalSettings from "./settings/content-moderations/post-approval";
import ContentModerationsReportedPostsSettings from "./settings/content-moderations/reported-posts";

import { Community as CommunityInterface } from "@/types/community";

interface CommunitySettingsProps {
  comm: CommunityInterface;
}

export default function CommunitySettingsMain({
  comm,
}: CommunitySettingsProps) {
  const { activeSection, activeItem } = useCommunitySettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderSettingsContent = () => {
    if (activeSection === "General Settings") {
      switch (activeItem) {
        case "Community Info":
          return <GeneralCommunityInfoSettings community={comm} />;
        case "Welcome Message":
          return <GeneralWelcomeMessageSettings community={comm} />;
        case "Community Rules":
          return <GeneralCommunityRulesSettings community={comm} />;
        case "Privacy & Visibility":
          return <GeneralPrivacyPolicySettings community={comm} />;
        default:
          return null;
      }
    }
    if (activeSection === "Members & Roles") {
      switch (activeItem) {
        case "All Members":
          return <MembersRolesAllMembersSettings community={comm} />;
        case "Pending Requests":
          return <MembersRolesPendingRequestSettings community={comm} />;
        case "Banned Members":
          return <MembersRolesBannedMembersSettings community={comm} />;
        case "Moderators & Admins":
          return <MembersRolesAdminsModeratorsSettings community={comm} />;
        default:
          return null;
      }
    }
    if (activeSection === "Content & Moderation") {
      switch (activeItem) {
        case "Post Approval":
          return <ContentModerationsPostApprovalSettings community={comm} />;
        case "Reported Posts":
          return <ContentModerationsReportedPostsSettings community={comm} />;
        default:
          return null;
      }
    }
    return null;
  };

  return (
    <div className="size-full flex  overflow-hidden">
      <CommunitySettingsSidebar
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      <div className="size-full flex flex-1 flex-col min-w-0 overflow-hidden w-full">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b z-30">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 lg:hidden hover:bg-accent rounded-md text-foreground-secondary"
          >
            <Menu size={20} />
          </button>

          <Separator orientation="vertical" className="hidden lg:block h-6" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden sm:block">
                <BreadcrumbLink href="#">Settings</BreadcrumbLink>
              </BreadcrumbItem>

              {activeSection && (
                <>
                  <BreadcrumbSeparator className="hidden sm:block" />
                  <BreadcrumbItem className="hidden sm:block">
                    <BreadcrumbPage>{activeSection}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}

              {activeItem && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{activeItem}</BreadcrumbPage>
                  </BreadcrumbItem>
                </>
              )}
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        {/* Scrollable Content Container */}
        <main className="overflow-y-auto size-full">
          <div className="size-full p-4">{renderSettingsContent()}</div>
        </main>
      </div>
    </div>
  );
}
