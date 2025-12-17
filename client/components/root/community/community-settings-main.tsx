import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { CommunitySettingsSidebar } from "./community-settings-sidebar";
import { useCommunitySettings } from "@/features/slices/community-settings";

// importing different settings
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
    comm: CommunityInterface
}

export default function CommunitySettingsMain({ comm } : CommunitySettingsProps) {
  const { activeSection, activeItem } = useCommunitySettings();

  const renderSettingsContent = () => {
    if (activeSection === "General Settings") {
      switch (activeItem) {
        case "Community Info":
          return <GeneralCommunityInfoSettings community={comm}/>;
        case "Welcome Message":
          return <GeneralWelcomeMessageSettings community={comm}/>;
        case "Community Rules":
          return <GeneralCommunityRulesSettings community={comm}/>;
        case "Privacy & Visibility":
          return <GeneralPrivacyPolicySettings community={comm} />;
        default:
          return null;
      }
    }

    if (activeSection === "Members & Roles") {
      switch (activeItem) {
        case "All Members":
          return <MembersRolesAllMembersSettings community={comm}/>;
        case "Pending Requests":
          return <MembersRolesPendingRequestSettings community={comm}/>;
        case "Banned Members":
          return <MembersRolesBannedMembersSettings community={comm}/>;
        case "Moderators & Admins":
          return <MembersRolesAdminsModeratorsSettings community={comm}/>;
        default:
          return null;
      }
    }

    if (activeSection === "Content & Moderation") {
      switch (activeItem) {
        case "Post Approval":
          return <ContentModerationsPostApprovalSettings community={comm}/>;
        case "Reported Posts":
          return <ContentModerationsReportedPostsSettings community={comm}/>;
        default:
          return null;
      }
    }

    return null;
  };

  return (
    <SidebarProvider className="size-full relative">
      <CommunitySettingsSidebar className="sticky top-0 left-0" />

      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">Community Settings</BreadcrumbLink>
              </BreadcrumbItem>

              {activeSection && (
                <>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem className="hidden md:block">
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

        <div className="flex flex-1 flex-col gap-4 p-6">
          {renderSettingsContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
