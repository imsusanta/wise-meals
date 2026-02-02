
# NourishWise - Meal Planning App for Adults 50+

## Overview
A full-featured, accessible meal planning application designed specifically for adults 50 and older. Built with user accounts, cloud sync, and AI-powered recipe generation to create personalized, health-conscious meal plans.

---

## Phase 1: Foundation & Design System

### Accessibility-First Design System
- **Typography**: Large, readable fonts (18px body, 24px+ headers) with adjustable font size setting
- **Color Palette**: 
  - Soft sage green (primary actions, health indicators)
  - Warm orange/coral (accents, encouragement)
  - Calm blue (hydration, calm UI elements)
  - High contrast dark text on light backgrounds
- **Touch Targets**: All buttons minimum 48x48px for easy tapping
- **Layout**: Clean, uncluttered with generous white space

### Navigation Structure
- **Bottom Navigation Bar** with 4 labeled icons:
  1. 🏠 Home
  2. 📅 Plan
  3. 🍳 Recipes
  4. 🛒 List

---

## Phase 2: User Authentication & Backend

### User Accounts (Lovable Cloud + Supabase)
- Email/password registration and login
- Secure session management with cloud sync
- User profile data persistence

### Database Structure
- User profiles with health settings
- Meal plans (weekly schedules)
- Saved recipes and favorites
- Shopping lists
- Caregiver/family member connections

---

## Phase 3: Onboarding Flow

### Welcome & Setup (5 screens)
1. **Welcome Screen**: App benefits and warm introduction
2. **Health Profile**: 
   - Age range selection
   - Dietary restrictions multi-select (diabetes-friendly, heart-healthy, low-sodium, etc.)
3. **Allergies & Intolerances**: Common allergens checklist (nuts, dairy, gluten, shellfish, etc.)
4. **Cooking Preferences**:
   - Skill level (beginner, comfortable, experienced)
   - Household size (1, 2, 3-4, 5+)
5. **Budget & Summary**: Weekly budget range and profile review

---

## Phase 4: Home Dashboard

### Today's View
- **Today's Meals**: Prominent display of breakfast, lunch, dinner, and snacks for the day
- **"What Should I Eat Now?"**: Quick AI-powered suggestion button based on time of day and preferences
- **Hydration Tracker**: Simple water intake reminder with visual progress
- **Weekly Nutrition Summary**: Friendly color-coded overview (green = balanced, yellow = needs attention)
- **Health Tip of the Day**: Rotating motivational and educational content

---

## Phase 5: Meal Planner (Weekly View)

### Calendar Interface
- **7-Day Overview**: Visual weekly calendar showing all planned meals
- **Meal Management**:
  - Drag-and-drop meal assignment
  - Swap meals between days
  - Mark as "prepared" or "skipped"
- **AI Auto-Generate**: One-tap button to fill the week based on health profile
- **Nutritional Balance Indicator**: Simple color-coded daily/weekly health score
- **"Low Energy Day" Filter**: Quick access to meals under 15 minutes prep

---

## Phase 6: Recipe Browser & AI Generation

### Recipe Discovery
- **Large Recipe Cards**: Big, appetizing images with clear labels
- **Smart Filters**:
  - Prep time (under 15 min, 15-30 min, 30-60 min)
  - Health conditions (from user's profile)
  - Cuisine type
  - Difficulty level
- **Voice Search**: Microphone option for hands-free searching

### AI Recipe Generation
- **On-Demand Creation**: Describe what you want and AI generates a personalized recipe
- **Health-Aware**: Recipes respect user's dietary restrictions and health conditions
- **Customizable Servings**: Easy scaling for 1-4 people

### Recipe Detail Page
- **Step-by-Step Mode**: Large text, one instruction at a time option
- **Ingredient Checklist**: Tap to check off as you go
- **Nutrition Panel**: Calories, sodium, fiber, protein prominently displayed
- **Actions**: 
  - Add to meal plan
  - Add ingredients to shopping list
  - Print recipe
  - Save to favorites

---

## Phase 7: Smart Grocery List

### Automated List Building
- **Auto-Generated**: Pulls ingredients from weekly meal plan
- **Store Organization**: Grouped by section (produce, dairy, proteins, pantry, frozen)
- **Management Features**:
  - Check items as purchased
  - Adjust quantities
  - Add custom items
  - Estimated cost calculator
- **Sharing**: Send list via text or email to family members

---

## Phase 8: Health Profile & Settings

### Profile Management
- **Update Anytime**: Modify dietary needs, allergies, preferences
- **Font Size Slider**: Adjust app-wide text size for comfort
- **Notification Controls**: Enable/disable reminders

### Health Features
- **Medication Reminders**: Optional meal-time medication alerts
- **Food-Drug Interaction Warnings**: Alerts about potential interactions (e.g., grapefruit + statins)
- **Doctor Visit Export**: Generate PDF summary of eating habits and nutrition

### Special Modes
- **"Cooking for One" Mode**: Auto-scales all recipes to single servings
- **Emergency Contact**: Store important contact information

---

## Phase 9: Advanced Features

### Caregiver/Family Access
- Invite family members or caregivers
- View-only or edit permissions
- Shared shopping lists

### Leftover Transformer
- Input what leftovers you have
- AI suggests new meal ideas using those ingredients

### Weekly Email Digest
- Optional weekly summary of meals, nutrition, and health tips
- Printable format for fridge or caregiver reference

---

## Technical Architecture

### Frontend
- React with TypeScript
- Tailwind CSS with custom accessibility theme
- Mobile-first responsive design
- Offline support for viewing saved recipes

### Backend (Lovable Cloud)
- User authentication with Supabase Auth
- PostgreSQL database for all user data
- Edge functions for AI recipe generation via Lovable AI
- Secure health data handling

### Accessibility Standards
- WCAG AA compliance
- Screen reader compatible
- Keyboard navigation support
- High contrast mode

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
