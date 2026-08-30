import React, { useState } from "react";
import { ThemeProvider } from "./theme/ThemeContext";
import { ToastProvider } from "./components/Toast";
import { HabitProvider, useHabits, NewHabitInput } from "./store/HabitStore";
import { Navbar } from "./components/Navbar";
import { TodayView } from "./views/TodayView";
import { CalendarView } from "./views/CalendarView";
import { HabitsView } from "./views/HabitsView";
import { StatsView } from "./views/StatsView";
import { HabitDetailView } from "./views/HabitDetailView";
import { HabitFormModal } from "./components/HabitFormModal";
import { TabType, Habit } from "./types";

function MainContent() {
  const { addHabit, updateHabit } = useHabits();
  const [activeTab, setActiveTab] = useState<TabType>("today");
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  // Habit modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState<Habit | null>(null);

  const handleOpenNewHabit = () => {
    setHabitToEdit(null);
    setIsFormOpen(true);
  };

  const handleEditHabit = (habit: Habit) => {
    setHabitToEdit(habit);
    setIsFormOpen(true);
  };

  const handleSaveHabit = (data: NewHabitInput) => {
    if (habitToEdit) {
      updateHabit(habitToEdit.id, data);
    } else {
      addHabit(data);
    }
  };

  const handleSelectTab = (tab: TabType) => {
    setSelectedHabitId(null);
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F17] text-[#0F172A] dark:text-[#F8FAFC] transition-colors">
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        onOpenNewHabit={handleOpenNewHabit}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-8 pt-6 sm:pt-8">
        {selectedHabitId ? (
          <HabitDetailView
            habitId={selectedHabitId}
            onBack={() => setSelectedHabitId(null)}
            onEditHabit={handleEditHabit}
          />
        ) : (
          <>
            {activeTab === "today" && (
              <TodayView
                onOpenDetail={(id) => setSelectedHabitId(id)}
                onOpenNewHabit={handleOpenNewHabit}
                onOpenEdit={handleEditHabit}
              />
            )}
            {activeTab === "calendar" && (
              <CalendarView
                onOpenDetail={(id) => setSelectedHabitId(id)}
                onOpenNewHabit={handleOpenNewHabit}
              />
            )}
            {activeTab === "habits" && (
              <HabitsView
                onOpenDetail={(id) => setSelectedHabitId(id)}
                onEditHabit={handleEditHabit}
                onOpenNewHabit={handleOpenNewHabit}
              />
            )}
            {activeTab === "stats" && <StatsView />}
          </>
        )}
      </main>

      {/* Habit Creation / Edit Modal */}
      <HabitFormModal
        isOpen={isFormOpen}
        habitToEdit={habitToEdit}
        onClose={() => {
          setIsFormOpen(false);
          setHabitToEdit(null);
        }}
        onSave={handleSaveHabit}
      />
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <HabitProvider>
          <MainContent />
        </HabitProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
