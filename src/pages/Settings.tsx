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

      <div className="container px-4 py-6 space-y-6">
        {/* User Info */}
        <Card>
          <CardContent className="flex items-center gap-4 py-6">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-lg">
                {profile?.full_name || "Guest User"}
              </p>
              <p className="text-sm text-muted-foreground truncate">{user?.email || "No email"}</p>
            </div>
          </CardContent>
        </Card>

        {/* Health Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Health Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Health Conditions */}
            {profile?.dietary_restrictions && profile.dietary_restrictions.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Health Conditions
                </Label>
                <div className="flex flex-wrap gap-2">
                  {profile.dietary_restrictions.map((restriction) => (
                    <Badge key={restriction} variant="secondary">
                      {DIETARY_RESTRICTION_LABELS[restriction as DietaryRestriction] || restriction}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Allergies */}
            {profile?.allergies && profile.allergies.length > 0 && (
              <div>
                <Label className="text-sm text-muted-foreground mb-2 block">
                  Allergies
                </Label>
                <div className="flex flex-wrap gap-2">
                  {profile.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive">
                      {ALLERGY_LABELS[allergy as Allergy] || allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Link 
              to="/onboarding"
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="block font-medium">Update Health Profile</span>
                  <span className="text-sm text-muted-foreground">
                    Dietary needs, allergies, preferences
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>

            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <span className="block font-medium">Family & Caregivers</span>
                  <span className="text-sm text-muted-foreground">
                    Share access with loved ones
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Medications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Pill className="h-5 w-5 text-primary" />
              Medications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MedicationManager />
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base">Text Size</Label>
                <span className="text-sm text-muted-foreground font-medium">
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
                <span className="text-sm">A</span>
                <span className="text-base">A</span>
                <span className="text-lg">A</span>
                <span className="text-xl">A</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Meal reminders, hydration, and tips
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={handleNotificationsChange}
              />
            </div>
          </CardContent>
        </Card>

        {/* Health & Safety */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Health & Safety
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Food-Drug Warnings</Label>
                <p className="text-sm text-muted-foreground">
                  Alert about potential interactions
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors -mx-4 cursor-pointer">
              <span className="font-medium">Emergency Contact</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Data & Export */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Data & Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full h-14">
              <FileText className="h-5 w-5 mr-2" />
              Export for Doctor Visit
            </Button>
          </CardContent>
        </Card>

        {/* Sign Out */}
        <Button 
          variant="outline" 
          className="w-full h-14 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <LogOut className="h-5 w-5 mr-2" />
          )}
          Sign Out
        </Button>

        {/* App Version */}
        <p className="text-center text-sm text-muted-foreground">
          NourishWise v1.0.0
        </p>
      </div>
    </div>
  );
}
