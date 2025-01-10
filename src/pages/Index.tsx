import { WeeklyBoard } from "@/components/WeeklyBoard";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <header className="py-8 text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
          Workout Routine Planner
        </h1>
      </header>
      
      <main>
        <WeeklyBoard />
      </main>
      
      <footer className="py-6 text-center text-gray-400 mt-8">
        <p className="mb-2">Workout Routine Planner, a Portfolio Product of Unfit.fit</p>
        <p>Contact: +8801886-102806</p>
      </footer>
    </div>
  );
};

export default Index;