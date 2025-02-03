import { WeeklyBoard } from "@/components/WeeklyBoard";

const Index = () => {
  return (
    <div className="min-h-screen gradient-bg">
      <main>
        <WeeklyBoard />
      </main>
      
      <footer className="py-6 text-center text-gray-400 mt-8">
        <p className="mb-2">Workout Routine Planner, a Portfolio Product of Unfit.fit (formerly HealthyThako)</p>
        <p>Contact: +8801886-102806</p>
      </footer>
    </div>
  );
};

export default Index;