import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MedicationManager } from "@/components/medications/MedicationManager";
import { 
  User, 
  Bell, 
  Type, 
  Heart, 
  Shield, 
  FileText,
  LogOut,
  ChevronRight,
  Pill,
  Users,
  Loader2,
  Eye
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { DIETARY_RESTRICTION_LABELS, ALLERGY_LABELS, type DietaryRestriction, type Allergy } from "@/types/health-profile";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, updateProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const [fontSize, setFontSize] = useState([18]);
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    if (profile) {
      const fontSizeMap: Record<string, number> = {
        small: 16,
        medium: 18,
        large: 20,
        "extra-large": 22,
      };
      setFontSize([fontSizeMap[profile.font_size_preference || "medium"] || 18]);
      setNotifications(profile.notifications_enabled ?? true);
    }
  }, [profile]);

  const handleFontSizeChange = async (value: number[]) => {
    setFontSize(value);
    const fontSizeMap: Record<number, string> = {
      16: "small",
      18: "medium",
      20: "large",
      22: "extra-large",
    };
    
    // Apply to document
    const fontSizeClass = {
      16: 'font-scale-sm',
      18: 'font-scale-md',
      20: 'font-scale-lg',
      22: 'font-scale-xl',
    };
    document.documentElement.classList.remove('font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl');
    document.documentElement.classList.add(fontSizeClass[value[0] as keyof typeof fontSizeClass] || 'font-scale-md');
    
    await updateProfile({ font_size_preference: fontSizeMap[value[0]] || "medium" });
  };

  const handleNotificationsChange = async (checked: boolean) => {
    setNotifications(checked);
    await updateProfile({ notifications_enabled: checked });
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOut();
    toast({
      title: "Signed out",
      description: "See you next time!",
    });
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Settings" 
        showBack
      />

      <div className="container px-4 py-4 space-y-4 animate-fade-in">
        {/* User Info - Native Card Style */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 active:scale-[0.99] transition-transform tap-highlight-none">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg">
                {profile?.full_name || "Guest User"}
              </p>
              <p className="text-sm text-muted-foreground truncate">{user?.email || "No email"}</p>
            </div>
          </div>
        </div>

        {/* Health Profile Section */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Health Profile</span>
            </div>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Health Conditions */}
            {profile?.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wide">
                  Health Conditions
                </Label>
                <div className="flex flex-wrap gap-2">
                  {profile.dietary_restrictions.map((restriction) => (
                    <Badge key={restriction} variant="secondary" className="rounded-full">
                      {DIETARY_RESTRICTION_LABELS[restriction as DietaryRestriction] || restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {profile?.allergies && profile.allergies.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground mb-2 block uppercase tracking-wide">
                  Allergies
                </Label>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="rounded-full">
                      {ALLERGY_LABELS[allergy as Allergy] || allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* List Items */}
          <Link 
            to="/onboarding"
            className="flex items-center justify-between px-4 py-3.5 border-t border-border/30 active:bg-muted/50 transition-colors tap-highlight-none"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium text-sm">Update Health Profile</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>

          <div className="flex items-center justify-between px-4 py-3.5 border-t border-border/30 active:bg-muted/50 transition-colors tap-highlight-none cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-accent" />
              </div>
              <span className="font-medium text-sm">Family & Caregivers</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Medications Section */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Medications</span>
            </div>
          </div>
          <div className="p-4">
            <MedicationManager />
          </div>
        </div>

        {/* Accessibility */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Accessibility</span>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-sm font-medium">Text Size</Label>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                {fontSize[0]}px
              </span>
            </div>
            <Slider
              value={fontSize}
              onValueChange={handleFontSizeChange}
              min={16}
              max={22}
              step={2}
              className="w-full"
            />
            <div className="flex justify-between text-muted-foreground mt-3">
              <span className="text-xs">A</span>
              <span className="text-sm">A</span>
              <span className="text-base">A</span>
              <span className="text-lg">A</span>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                <Bell className="h-4 w-4 text-secondary" />
              </div>
              <div>
                <span className="font-medium text-sm block">Push Notifications</span>
                <span className="text-xs text-muted-foreground">Reminders & tips</span>
              </div>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={handleNotificationsChange}
            />
          </div>
        </div>

        {/* Health & Safety */}
        <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Health & Safety</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/30">
            <div>
              <span className="font-medium text-sm block">Food-Drug Warnings</span>
              <span className="text-xs text-muted-foreground">Alert about interactions</span>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between px-4 py-3.5 active:bg-muted/50 transition-colors tap-highlight-none cursor-pointer">
            <span className="font-medium text-sm">Emergency Contact</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        {/* Export */}
        <Button 
          variant="outline" 
          className="w-full h-12 rounded-2xl font-medium active:scale-[0.98] transition-transform"
        >
          <FileText className="h-4 w-4 mr-2" />
          Export for Doctor Visit
        </Button>

        {/* Sign Out */}
        <Button 
          variant="ghost" 
          className="w-full h-12 rounded-2xl text-destructive hover:text-destructive hover:bg-destructive/10 font-medium active:scale-[0.98] transition-transform"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-4 w-4 mr-2" />
          )}
          Sign Out
        </Button>

        {/* App Version */}
        <p className="text-center text-xs text-muted-foreground pb-4">
          NourishWise v1.0.0
        </p>
      </div>
    </div>
  );
}
