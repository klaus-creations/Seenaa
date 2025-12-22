"use client";

import { useTheme } from "@/features/slices/theme";
import { useGetMe, useUpdatePreferences } from "@/lib/hooks/users/useUsers";
import { useSignOut } from "@/lib/hooks/auth/useSignOut";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Palette
} from "lucide-react";
import { ProfileTheme } from "@/types/user";

export default function Settings() {
  const { isDarkMode, setTheme } = useTheme();
  const { data: user } = useGetMe();
  const updatePrefs = useUpdatePreferences();
  const { mutate: signOut, isPending: isLoggingOut } = useSignOut();

  const togglePreference = (key: string, value: boolean) => {
    updatePrefs.mutate({ [key]: value });
  };

  const changeProfileTheme = (theme: ProfileTheme) => {
    updatePrefs.mutate({ profileTheme: theme });
  };

  return (
    <div className="w-full py-6 px-4">
      <h2 className="text-xl font-extrabold mb-6">Settings</h2>

      <div className="space-y-1">
        <div className="py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary/50">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <Label className="text-[15px] font-semibold">Profile Style</Label>
              <p className="text-xs text-muted-foreground">Current: {user?.profileTheme || 'Default'}</p>
            </div>
          </div>
          <select
            className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer"
            value={user?.profileTheme}
            onChange={(e) => changeProfileTheme(e.target.value as ProfileTheme)}
          >
            {Object.values(ProfileTheme).map((t) => (
              <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary/50">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <Label className="text-[15px] font-semibold">Show Activity Status</Label>
              <p className="text-xs text-muted-foreground">Let others see when you're online</p>
            </div>
          </div>
          <Switch
            onCheckedChange={(checked) => togglePreference("showActivityStatus", checked)}
          />
        </div>



        <div className="py-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-secondary/50">
              {isDarkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <Label className="text-[15px] font-semibold">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">Toggle application theme</p>
            </div>
          </div>
          <Switch
            checked={isDarkMode}
            onCheckedChange={(checked) => setTheme(checked)}
          />
        </div>



        <div className="pt-8">
          <Button
            variant="ghost"
            className="w-full justify-between text-destructive hover:text-destructive hover:bg-destructive/5 px-4 h-12 rounded-xl"
            onClick={() => signOut()}
            disabled={isLoggingOut}
          >
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5" />
              <span className="font-bold">Log out</span>
            </div>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </Button>
        </div>
      </div>
    </div>
  );
}
