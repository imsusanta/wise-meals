# NourishWise - Meal Planning App for Adults 50+

## Overview
A full-featured, accessible meal planning application designed specifically for adults 50 and older. Built with user accounts, cloud sync, and AI-powered recipe generation to create personalized, health-conscious meal plans.

---

## Feature Priority Matrix

| Priority | Feature | Why It Matters |
|----------|---------|----------------|
| 🥇 Must Have | Large fonts & simple UI | Useless if they can't see/navigate |
| 🥇 Must Have | Health condition filters | Core value proposition |
| 🥇 Must Have | Easy recipe viewing | Basic functionality |
| 🥇 Must Have | Medication-food alerts | Safety critical |
| 🥈 Should Have | Auto grocery list | Huge time saver |
| 🥈 Should Have | Reminder system | Drives daily usage |
| 🥈 Should Have | Recipe scaling (1-2 people) | Practical need |
| 🥈 Should Have | Voice features | Accessibility |
| 🥉 Nice to Have | Family sharing | Builds trust |
| 🥉 Nice to Have | Budget tracking | Added value |
| 🥉 Nice to Have | Leftover management | Reduces waste |

---

## 🏥 Health-Centric Features

### 1. Health Condition-Based Meal Plans
- **Diabetes-friendly** - Low glycemic index foods, sugar tracking
- **Heart-healthy** - Low sodium, low cholesterol recipes
- **Blood Pressure control** - DASH diet options
- **Bone health** - Calcium & Vitamin D rich meals
- **Kidney-friendly** - Low potassium, low phosphorus options
- **Anti-inflammatory** - For arthritis and joint pain
- **GERD/Acid reflux friendly** - Avoid trigger foods

### 2. Medication-Food Interaction Alerts
- Example: "If you take blood thinners, limit green leafy vegetables (Vitamin K)"
- "Avoid grapefruit if you're on cholesterol medication (statins)"
- "Take this meal 2 hours after your medication"
- User inputs their medications, app warns about conflicts

### 3. Simple Nutrition Tracking
- **Protein** - Critical for maintaining muscle mass after 50
- **Fiber** - Digestive health
- **Hydration tracker** - Elderly often forget to drink water
- **Sodium/Salt** - Important for BP control
- **Calcium & Vitamin D** - Bone strength

---

## 👁️ Accessibility Features (Extremely Important)

### 4. Vision-Friendly Design ✅
- Large text - Adjustable font size (small, medium, large, extra-large)
- High contrast mode - Dark text on light background
- Large buttons - Minimum 48x48px tap targets
- No fancy fonts - Simple, readable typography
- Avoid light gray text - Hard to read for aging eyes

### 5. Voice Features
- Voice commands - "What's for dinner tonight?"
- Read recipes aloud - Hands are busy while cooking
- Voice search - No typing needed
- Voice input for grocery list - "Add eggs to my list"

### 6. Motor-Friendly Interface ✅
- Simple gestures - No complex swipes
- Minimal scrolling - Important info visible upfront
- Undo button - Easy to fix mistakes
- No time-limited actions - Give users enough time

---

## 🍳 Cooking Convenience Features

### 7. Recipe Scaling (Portion Adjustment)
- Cook for 1-2 people (empty nesters don't need family-sized recipes)
- "Make half portion" button
- Leftover storage instructions
- "This recipe freezes well" indicator

### 8. Smart Recipe Filters
- Cooking time - 15 min, 30 min, 1 hour
- Difficulty level - Easy, Medium, Hard
- "Low energy day" mode - Shows only the simplest recipes
- One-pot meals - Less cleanup
- No-cook options - Salads, sandwiches
- Soft food options - For dental issues

### 9. Step-by-Step Cooking Mode
- One step shown at a time (large text)
- Photo or video for each step
- Built-in timer ("Boil for 5 minutes" - tap to start timer)
- "Read this step aloud" button
- Keep screen awake while cooking

### 10. Leftover Management
- "What can I make with leftovers?" feature
- Suggests tomorrow's meal using today's extra food
- Storage instructions (how long it lasts in fridge/freezer)
- Reduces food waste and saves money

---

## 🛒 Grocery & Budget Features

### 11. Smart Grocery List ✅ (Basic)
- Auto-generated from weekly meal plan
- Organized by store section (produce, dairy, meat, etc.)
- Checkbox to mark items as bought
- Share list via SMS/WhatsApp/Email
- Print option (many seniors prefer paper lists)

### 12. Budget-Friendly Options
- Estimated weekly cost shown for meal plans
- Cheaper substitutes suggested ("Use chicken thighs instead of breast - saves $3")
- Seasonal produce recommendations (cheaper & fresher)
- "Under $50 this week" meal plan filter
- Fixed income friendly options

---

## 👨‍👩‍👧 Family & Caregiver Features

### 13. Caregiver/Family Access
- Invite family members to view meal plans
- Adult children can monitor parents' nutrition from afar
- Caregiver can plan meals for elderly person
- Different permission levels (view only vs. edit)

### 14. Doctor/Nutritionist Sharing
- Export weekly meal plan as PDF
- Nutrition summary report for doctor visits
- Track eating patterns over time
- Notes section for health appointments

---

## ⏰ Reminder & Alert System

### 15. Smart Reminders
- Meal time reminders ("It's lunch time!")
- Hydration reminders (every 2 hours)
- "Take medication with food" alerts
- Grocery shopping day reminder
- "Your bananas expire tomorrow" - use them up alerts

### 16. Gentle Notifications
- Not too frequent (annoying for elderly)
- Easy to customize or turn off
- Large, readable notification text
- Sound + visual alerts (some have hearing issues)

---

## 🎯 Simplicity Features

### 17. Clean Dashboard ✅
- Today's 3 meals visible at a glance
- Water intake progress
- One clear "Plan my week" button
- No cluttered interface
- Minimal options on screen

### 18. Favorites & Repeat Meals
- Save favorite recipes
- "Make this every Monday" option
- Quick repeat last week's plan
- Familiar meals reduce decision fatigue

### 19. Offline Access
- View saved recipes without internet
- Grocery list works offline
- Important for areas with poor connectivity
- Syncs when back online

---

## 💡 Engagement & Motivation

### 20. Daily Health Tips ✅
- Short, actionable tips
- "Did you know?" nutrition facts
- Gentle encouragement, not lecturing
- Celebrate small wins ("You drank 8 glasses today!")

### 21. Progress Tracking (Simple)
- Weekly nutrition summary (visual, not numbers)
- Green = good, Yellow = needs attention
- "You ate 5 servings of vegetables this week!"
- No overwhelming data/charts

---

## 🚨 Safety Features

### 22. Allergy & Intolerance Warnings ✅ (Onboarding)
- Set allergies once, warns every time
- Highlights allergens in recipes
- Suggests safe substitutes
- Cross-contamination warnings

### 23. Emergency Information
- Store emergency contact
- Medical conditions summary
- Can be shared quickly if needed

---

## Key Design Principles

1. **Simplicity over features** - Don't overwhelm with options
2. **Big and clear** - Everything should be easy to see and tap
3. **Forgiveness** - Easy to undo mistakes, no permanent actions
4. **Consistency** - Same layout on every screen
5. **Trust** - Be transparent about health recommendations
6. **Respect** - Never condescending or "baby-ish" design

---

## Implementation Phases

### Phase 1: Foundation ✅
- [x] Accessibility-first design system (18px base, 48px touch targets)
- [x] High-contrast color palette (sage green, coral, calm blue)
- [x] Bottom navigation (Home, Plan, Recipes, List)
- [x] Reusable layout components
- [x] Onboarding flow with health profile capture

### Phase 2: Authentication & Database (Next)
- [ ] User authentication (email/password)
- [ ] Profiles table with health settings
- [ ] Meal plans table
- [ ] Recipes table
- [ ] Shopping lists table
- [ ] RLS policies for user data

### Phase 3: Core Features
- [ ] Recipe browser with smart filters
- [ ] AI recipe generation (Lovable AI)
- [ ] Weekly meal planner with drag-drop
- [ ] Auto-generated grocery list

### Phase 4: Health Safety Features
- [ ] Medication-food interaction alerts
- [ ] Allergen warnings in recipes
- [ ] Nutrition tracking (protein, fiber, sodium)
- [ ] Hydration tracker improvements

### Phase 5: Accessibility Enhancements
- [ ] Font size slider in Settings
- [ ] Voice search integration
- [ ] Read aloud functionality
- [ ] Step-by-step cooking mode with timers

### Phase 6: Advanced Features
- [ ] Caregiver/family access
- [ ] PDF export for doctors
- [ ] Leftover management AI
- [ ] Budget tracking & substitutes
- [ ] Offline mode with sync

---

## Technical Architecture

### Frontend
- React with TypeScript
- Tailwind CSS with custom accessibility theme
- Zustand for state management
- Mobile-first responsive design

### Backend (Lovable Cloud)
- User authentication with Supabase Auth
- PostgreSQL database for all user data
- Edge functions for AI recipe generation via Lovable AI
- Secure health data handling with RLS

### Accessibility Standards
- WCAG AA compliance
- Screen reader compatible
- Keyboard navigation support
- High contrast mode
- Minimum 48x48px touch targets

---

## User Experience Principles

### Tone & Voice
- Warm and encouraging ("Great choice for your heart health!")
- Simple language, no medical jargon
- Celebrate small wins
- Positive framing of health tips

### Performance
- Fast loading times
- Minimal animations (reduce motion sickness concerns)
- Works on older devices
- Graceful offline degradation
