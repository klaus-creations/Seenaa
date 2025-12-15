import { SearchType } from "@/types/search";
import { Users, FileText, Globe, LayoutGrid, LucideIcon } from "lucide-react";
import { clsx } from "clsx"; // Assuming you use clsx or classnames

interface SearchTabsProps {
  activeTab: SearchType;
  onChange: (tab: SearchType) => void;
}

const tabs: { id: SearchType; label: string; icon: LucideIcon }[] = [
  { id: "all", label: "All", icon: LayoutGrid },
  { id: "people", label: "People", icon: Users },
  { id: "community", label: "Communities", icon: Globe },
  { id: "post", label: "Posts", icon: FileText },
];

export const SearchTabs = ({ activeTab, onChange }: SearchTabsProps) => {
  return (
    <div className="flex space-x-1 bg-secondary/2  p-1 rounded-lg overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "flex items-center px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 whitespace-nowrap",
              isActive
                ? "text-freground font-extrabold"
                : "text-foreground-tertiary hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
