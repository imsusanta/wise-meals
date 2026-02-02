import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Pill, Plus, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string | null;
  frequency: string | null;
  take_with_food: boolean;
  food_interactions: string[];
  notes: string | null;
}

// Common medication-food interactions database
const FOOD_INTERACTIONS: Record<string, string[]> = {
  "warfarin": ["Limit green leafy vegetables (Vitamin K can affect blood thinning)", "Avoid cranberry juice in large amounts", "Limit alcohol consumption"],
  "coumadin": ["Limit green leafy vegetables (Vitamin K can affect blood thinning)", "Avoid cranberry juice in large amounts"],
  "statin": ["Avoid grapefruit and grapefruit juice (can increase medication levels)", "Limit alcohol consumption"],
  "atorvastatin": ["Avoid grapefruit and grapefruit juice", "Avoid large amounts of oat bran"],
  "simvastatin": ["Avoid grapefruit and grapefruit juice", "Limit alcohol"],
  "lisinopril": ["Avoid potassium-rich foods in excess (bananas, oranges)", "Avoid salt substitutes with potassium"],
  "metformin": ["Take with food to reduce stomach upset", "Limit alcohol consumption"],
  "levothyroxine": ["Take on empty stomach, 30-60 min before food", "Avoid calcium and iron supplements within 4 hours", "Avoid high-fiber foods at same time"],
  "synthroid": ["Take on empty stomach", "Avoid soy products within 4 hours", "Avoid walnuts within 4 hours"],
  "omeprazole": ["Avoid eating within 30 minutes of taking", "Limit acidic foods"],
  "amlodipine": ["Avoid grapefruit juice", "Limit alcohol"],
  "metoprolol": ["Take with food", "Avoid alcohol"],
  "aspirin": ["Take with food to reduce stomach irritation", "Limit alcohol"],
  "ibuprofen": ["Take with food or milk", "Avoid alcohol"],
  "prednisone": ["Take with food", "Limit sodium/salt intake", "Ensure adequate calcium and vitamin D"],
  "ciprofloxacin": ["Avoid dairy products within 2 hours", "Avoid calcium-fortified foods within 2 hours"],
  "tetracycline": ["Avoid dairy products", "Avoid antacids with calcium, magnesium, or aluminum"],
  "digoxin": ["Avoid high-fiber foods at the same time", "Limit licorice consumption"],
  "lithium": ["Maintain consistent salt intake", "Stay well hydrated", "Avoid sudden changes in caffeine intake"],
  "maoi": ["Avoid aged cheeses", "Avoid cured meats", "Avoid fermented foods", "Avoid red wine", "Avoid soy sauce"],
};

export function MedicationManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [newMedName, setNewMedName] = useState("");
  const [newMedDosage, setNewMedDosage] = useState("");
  const [newMedFrequency, setNewMedFrequency] = useState("");
  const [newMedWithFood, setNewMedWithFood] = useState(false);
  const [newMedNotes, setNewMedNotes] = useState("");

  useEffect(() => {
    fetchMedications();
  }, [user]);

  const fetchMedications = async () => {
    if (!user) return;
    
    setIsLoading(true);
    const { data, error } = await supabase
      .from("medications")
      .select("*")
      .eq("user_id", user.id)
      .order("name");

    if (!error && data) {
      setMedications(data);
    }
    setIsLoading(false);
  };

  const getInteractionsForMedication = (medName: string): string[] => {
    const lowerName = medName.toLowerCase();
    const interactions: string[] = [];
    
    for (const [drug, warnings] of Object.entries(FOOD_INTERACTIONS)) {
      if (lowerName.includes(drug) || drug.includes(lowerName)) {
        interactions.push(...warnings);
      }
    }
    
    // Remove duplicates
    return [...new Set(interactions)];
  };

  const handleAddMedication = async () => {
    if (!user || !newMedName.trim()) return;
    
    setIsSaving(true);
    
    const foodInteractions = getInteractionsForMedication(newMedName);
    
    const { data, error } = await supabase
      .from("medications")
      .insert({
        user_id: user.id,
        name: newMedName,
        dosage: newMedDosage || null,
        frequency: newMedFrequency || null,
        take_with_food: newMedWithFood,
        food_interactions: foodInteractions,
        notes: newMedNotes || null,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Couldn't add medication",
        description: error.message,
        variant: "destructive",
      });
    } else if (data) {
      setMedications(prev => [...prev, data]);
      toast({
        title: "Medication added",
        description: foodInteractions.length > 0 
          ? `Found ${foodInteractions.length} food interaction(s) to watch for.`
          : "No known food interactions found.",
      });
      
      // Reset form
      setNewMedName("");
      setNewMedDosage("");
      setNewMedFrequency("");
      setNewMedWithFood(false);
      setNewMedNotes("");
      setShowAddDialog(false);
    }
    
    setIsSaving(false);
  };

  const handleDeleteMedication = async (medId: string) => {
    const { error } = await supabase
      .from("medications")
      .delete()
      .eq("id", medId);

    if (!error) {
      setMedications(prev => prev.filter(m => m.id !== medId));
      toast({
        title: "Medication removed",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Medications</h3>
          <p className="text-sm text-muted-foreground">
            Add medications to get food interaction alerts
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>
      </div>

      {medications.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <Pill className="h-12 w-12 text-muted-foreground mb-4" />
            <h4 className="font-semibold mb-2">No medications added</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Add your medications to receive alerts about foods to avoid
            </p>
            <Button variant="outline" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {medications.map((med) => (
            <Card key={med.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Pill className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold">{med.name}</h4>
                    </div>
                    {(med.dosage || med.frequency) && (
                      <p className="text-sm text-muted-foreground">
                        {[med.dosage, med.frequency].filter(Boolean).join(" • ")}
                      </p>
                    )}
                    {med.take_with_food && (
                      <p className="text-sm text-primary mt-1">
                        ⚡ Take with food
                      </p>
                    )}
                    {med.food_interactions && med.food_interactions.length > 0 && (
                      <div className="mt-3 p-3 rounded-lg bg-warning/10 border border-warning/20">
                        <p className="text-sm font-medium text-warning-foreground flex items-center gap-1 mb-2">
                          <AlertTriangle className="h-4 w-4" />
                          Food Interactions:
                        </p>
                        <ul className="space-y-1">
                          {med.food_interactions.map((interaction, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {interaction}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => handleDeleteMedication(med.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Medication Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Medication</DialogTitle>
            <DialogDescription>
              We'll automatically check for known food interactions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="med-name">Medication Name *</Label>
              <Input
                id="med-name"
                placeholder="e.g., Metformin, Lisinopril"
                value={newMedName}
                onChange={(e) => setNewMedName(e.target.value)}
                className="h-12"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="med-dosage">Dosage</Label>
                <Input
                  id="med-dosage"
                  placeholder="e.g., 500mg"
                  value={newMedDosage}
                  onChange={(e) => setNewMedDosage(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="med-frequency">Frequency</Label>
                <Input
                  id="med-frequency"
                  placeholder="e.g., Twice daily"
                  value={newMedFrequency}
                  onChange={(e) => setNewMedFrequency(e.target.value)}
                  className="h-12"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
              <Checkbox
                id="take-with-food"
                checked={newMedWithFood}
                onCheckedChange={(checked) => setNewMedWithFood(checked as boolean)}
              />
              <Label htmlFor="take-with-food" className="cursor-pointer">
                Take with food
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="med-notes">Notes (optional)</Label>
              <Input
                id="med-notes"
                placeholder="Any special instructions"
                value={newMedNotes}
                onChange={(e) => setNewMedNotes(e.target.value)}
                className="h-12"
              />
            </div>

            <Button 
              className="w-full h-12"
              onClick={handleAddMedication}
              disabled={!newMedName.trim() || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Medication
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
