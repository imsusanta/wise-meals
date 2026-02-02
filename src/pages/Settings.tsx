import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
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
  Users
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Settings() {
  const [fontSize, setFontSize] = useState([18]);
  const [notifications, setNotifications] = useState(true);
  const [medicationReminders, setMedicationReminders] = useState(false);
  const [foodInteractionWarnings, setFoodInteractionWarnings] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader 
        title="Settings" 
        showBack
      />

      <div className="container px-4 py-6 space-y-6">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <Link 
              to="/settings/health-profile"
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-muted-foreground" />
                <span>Health Profile</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
            <Link 
              to="/settings/caregivers"
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <span>Family & Caregivers</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Accessibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Accessibility
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base mb-4 block">
                Font Size: {fontSize[0]}px
              </Label>
              <Slider
                value={fontSize}
                onValueChange={setFontSize}
                min={14}
                max={24}
                step={2}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-2">
                <span>Smaller</span>
                <span>Larger</span>
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
                  Meal reminders and tips
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base">Medication Reminders</Label>
                  <p className="text-sm text-muted-foreground">
                    Reminders with meals
                  </p>
                </div>
              </div>
              <Switch
                checked={medicationReminders}
                onCheckedChange={setMedicationReminders}
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
              <Switch
                checked={foodInteractionWarnings}
                onCheckedChange={setFoodInteractionWarnings}
              />
            </div>
            <Link 
              to="/settings/emergency-contact"
              className="flex items-center justify-between p-4 rounded-lg hover:bg-muted transition-colors -mx-4"
            >
              <span>Emergency Contact</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
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
        >
          <LogOut className="h-5 w-5 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
