import { WorkoutTemplate } from "./types";

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "1",
    title: "HIIT Interval Training",
    type: "cardio",
    category: "High Intensity",
    duration: "30",
    difficulty: "advanced",
    calories: "400",
    target: "Fat Loss",
    intensity: "high",
    spaceRequired: "moderate",
    equipment: ["Timer", "Mat"],
    targetMuscles: ["Full Body"],
    frequency: "2-3 times per week",
    description: "High-intensity interval training alternating between intense bursts of activity and fixed periods of less-intense activity or rest.",
    benefits: [
      "Improves cardiovascular fitness",
      "Increases metabolism",
      "Burns calories efficiently"
    ],
    tips: [
      "Start with shorter intervals",
      "Focus on form over speed",
      "Stay hydrated"
    ],
    exercises: []
  },
  {
    title: "Upper Body Focus",
    type: "strength",
    category: "Strength Training",
    duration: "45",
    difficulty: "intermediate",
    calories: "320",
    intensity: "medium",
    spaceRequired: "minimal",
    equipment: ["Dumbbells", "Resistance Bands"],
    targetMuscles: ["Chest", "Shoulders", "Arms", "Upper Back"],
    frequency: "2 times per week",
    description: "Comprehensive upper body workout targeting all major muscle groups.",
    benefits: [
      "Builds upper body strength",
      "Improves posture",
      "Enhances functional fitness"
    ],
    alternatives: [
      "Bodyweight exercises",
      "Resistance band only",
      "Machine alternatives"
    ]
  },
  {
    title: "Cycling Session",
    type: "cardio",
    category: "Cardio Training",
    duration: "45",
    difficulty: "intermediate",
    calories: "350",
    intensity: "medium",
    spaceRequired: "minimal",
    equipment: ["Bicycle"],
    targetMuscles: ["Legs", "Core"],
    frequency: "3 times per week",
    description: "A steady cycling session to improve endurance and cardiovascular health.",
    benefits: [
      "Enhances leg strength",
      "Improves cardiovascular fitness",
      "Burns calories effectively"
    ],
    tips: [
      "Maintain a steady pace",
      "Adjust the seat height for comfort",
      "Stay hydrated"
    ]
  },
  {
    title: "Swimming Workout",
    type: "cardio",
    category: "Cardio Training",
    duration: "40",
    difficulty: "intermediate",
    calories: "300",
    intensity: "medium",
    spaceRequired: "spacious",
    equipment: ["Swimsuit", "Goggles"],
    targetMuscles: ["Full Body"],
    frequency: "2-3 times per week",
    description: "A full-body workout that improves strength and endurance through swimming.",
    benefits: [
      "Low-impact exercise",
      "Improves flexibility",
      "Builds endurance"
    ],
    tips: [
      "Focus on your breathing technique",
      "Vary your strokes for a full workout",
      "Warm up before swimming"
    ]
  },
  {
    title: "Jump Rope Circuit",
    type: "cardio",
    category: "Cardio Training",
    duration: "20",
    difficulty: "beginner",
    calories: "250",
    intensity: "low",
    spaceRequired: "minimal",
    equipment: ["Jump Rope"],
    targetMuscles: ["Legs", "Core"],
    frequency: "3-4 times per week",
    description: "A quick and effective cardio workout using a jump rope.",
    benefits: [
      "Improves coordination",
      "Burns calories quickly",
      "Enhances cardiovascular fitness"
    ],
    tips: [
      "Start with short intervals",
      "Focus on your form",
      "Use a proper jump rope"
    ]
  },
  {
    title: "Stair Climbing",
    type: "cardio",
    category: "Cardio Training",
    duration: "25",
    difficulty: "intermediate",
    calories: "280",
    intensity: "medium",
    spaceRequired: "minimal",
    equipment: ["Stairs"],
    targetMuscles: ["Legs", "Glutes"],
    frequency: "2-3 times per week",
    description: "A workout that utilizes stairs for an effective cardio session.",
    benefits: [
      "Strengthens lower body",
      "Improves cardiovascular health",
      "Burns calories efficiently"
    ],
    tips: [
      "Maintain a steady pace",
      "Use handrails if needed",
      "Cool down after your workout"
    ]
  },
  {
    title: "Bodyweight Circuit",
    type: "strength",
    category: "Strength Training",
    duration: "40",
    difficulty: "beginner",
    calories: "280",
    intensity: "medium",
    spaceRequired: "minimal",
    equipment: ["None"],
    targetMuscles: ["Full Body"],
    frequency: "3 times per week",
    description: "A circuit workout using bodyweight exercises to build strength.",
    benefits: [
      "Improves overall strength",
      "Can be done anywhere",
      "Enhances functional fitness"
    ],
    tips: [
      "Focus on form over quantity",
      "Incorporate rest periods",
      "Gradually increase intensity"
    ]
  },
  {
    title: "Resistance Band Workout",
    type: "strength",
    category: "Strength Training",
    duration: "35",
    difficulty: "intermediate",
    calories: "250",
    intensity: "medium",
    spaceRequired: "minimal",
    equipment: ["Resistance Bands"],
    targetMuscles: ["Full Body"],
    frequency: "2-3 times per week",
    description: "A workout using resistance bands to build strength and flexibility.",
    benefits: [
      "Versatile and portable",
      "Targets multiple muscle groups",
      "Improves flexibility"
    ],
    tips: [
      "Choose the right resistance level",
      "Focus on controlled movements",
      "Incorporate a variety of exercises"
    ]
  },
  {
    title: "Dynamic Stretching",
    type: "flexibility",
    category: "Flexibility Training",
    duration: "25",
    difficulty: "beginner",
    calories: "150",
    intensity: "low",
    spaceRequired: "minimal",
    equipment: ["None"],
    targetMuscles: ["Full Body"],
    frequency: "Daily",
    description: "A series of dynamic stretches to improve flexibility and mobility.",
    benefits: [
      "Prepares muscles for activity",
      "Reduces risk of injury",
      "Improves range of motion"
    ],
    tips: [
      "Incorporate into warm-up routines",
      "Focus on major muscle groups",
      "Avoid bouncing movements"
    ]
  },
  {
    title: "Pilates Flow",
    type: "flexibility",
    category: "Flexibility Training",
    duration: "45",
    difficulty: "intermediate",
    calories: "200",
    intensity: "medium",
    spaceRequired: "spacious",
    equipment: ["Mat"],
    targetMuscles: ["Core", "Legs"],
    frequency: "2-3 times per week",
    description: "A Pilates workout focusing on core strength and flexibility.",
    benefits: [
      "Improves core strength",
      "Enhances flexibility",
      "Promotes body awareness"
    ],
    tips: [
      "Focus on controlled movements",
      "Breathe deeply throughout",
      "Maintain proper alignment"
    ]
  },
  {
    title: "Mobility Work",
    type: "flexibility",
    category: "Flexibility Training",
    duration: "30",
    difficulty: "beginner",
    calories: "180",
    intensity: "low",
    spaceRequired: "minimal",
    equipment: ["None"],
    targetMuscles: ["Full Body"],
    frequency: "Daily",
    description: "A series of mobility exercises to improve joint health and flexibility.",
    benefits: [
      "Enhances joint mobility",
      "Reduces stiffness",
      "Improves overall movement quality"
    ],
    tips: [
      "Incorporate into daily routines",
      "Focus on areas of tightness",
      "Use slow and controlled movements"
    ]
  },
  {
    title: "Recovery Session",
    type: "flexibility",
    category: "Flexibility Training",
    duration: "40",
    difficulty: "beginner",
    calories: "160",
    intensity: "low",
    spaceRequired: "minimal",
    equipment: ["None"],
    targetMuscles: ["Full Body"],
    frequency: "As needed",
    description: "A gentle session focused on recovery and relaxation.",
    benefits: [
      "Promotes relaxation",
      "Reduces muscle soreness",
      "Improves flexibility"
    ],
    tips: [
      "Incorporate deep breathing",
      "Focus on areas of tension",
      "Use gentle stretches"
    ]
  },
  {
    title: "Balance Training",
    type: "flexibility",
    category: "Flexibility Training",
    duration: "35",
    difficulty: "intermediate",
    calories: "190",
    intensity: "medium",
    spaceRequired: "minimal",
    equipment: ["None"],
    targetMuscles: ["Legs", "Core"],
    frequency: "2 times per week",
    description: "Exercises focused on improving balance and stability.",
    benefits: [
      "Enhances coordination",
      "Improves core strength",
      "Reduces risk of falls"
    ],
    tips: [
      "Incorporate into daily routines",
      "Use a stable surface for support",
      "Gradually increase difficulty"
    ]
  },
  {
    title: "High-Intensity Cardio",
    type: "cardio",
    category: "High Intensity",
    duration: "35",
    difficulty: "advanced",
    calories: "450",
    intensity: "high",
    spaceRequired: "minimal",
    equipment: ["None"],
    targetMuscles: ["Full Body"],
    frequency: "2-3 times per week",
    description: "A high-intensity cardio workout to boost endurance and burn calories.",
    benefits: [
      "Improves cardiovascular fitness",
      "Burns calories quickly",
      "Enhances stamina"
    ],
    tips: [
      "Incorporate intervals for intensity",
      "Stay hydrated",
      "Cool down after workouts"
    ]
  },
  {
    title: "Endurance Building",
    type: "cardio",
    category: "Endurance Training",
    duration: "60",
    difficulty: "advanced",
    calories: "500",
    intensity: "high",
    spaceRequired: "spacious",
    equipment: ["None"],
    targetMuscles: ["Full Body"],
    frequency: "3-4 times per week",
    description: "A workout designed to build endurance through sustained activity.",
    benefits: [
      "Enhances cardiovascular endurance",
      "Improves overall fitness",
      "Burns calories effectively"
    ],
    tips: [
      "Maintain a steady pace",
      "Incorporate rest periods",
      "Gradually increase duration"
    ]
  },
  {
    title: "Weight Loss Focus",
    type: "strength",
    category: "Weight Loss",
    duration: "45",
    difficulty: "intermediate",
    calories: "400",
    intensity: "medium",
    spaceRequired: "minimal",
    equipment: ["Dumbbells"],
    targetMuscles: ["Full Body"],
    frequency: "3 times per week",
    description: "A strength training workout focused on weight loss and toning.",
    benefits: [
      "Burns calories",
      "Builds lean muscle",
      "Improves metabolism"
    ],
    tips: [
      "Incorporate compound movements",
      "Focus on form",
      "Stay consistent"
    ]
  },
  {
    title: "Muscle Gain",
    type: "strength",
    category: "Strength Training",
    duration: "50",
    difficulty: "advanced",
    calories: "350",
    intensity: "high",
    spaceRequired: "minimal",
    equipment: ["Weights"],
    targetMuscles: ["Full Body"],
    frequency: "3-4 times per week",
    description: "A workout designed to build muscle mass and strength.",
    benefits: [
      "Increases muscle size",
      "Improves strength",
      "Enhances overall fitness"
    ],
    tips: [
      "Focus on progressive overload",
      "Incorporate rest days",
      "Stay hydrated"
    ]
  },
  {
    title: "Active Recovery",
    type: "flexibility",
    category: "Recovery",
    duration: "30",
    difficulty: "beginner",
    calories: "150",
    intensity: "low",
    spaceRequired: "minimal",
    equipment: ["None"],
    targetMuscles: ["Full Body"],
    frequency: "As needed",
    description: "A gentle session focused on recovery and mobility.",
    benefits: [
      "Promotes recovery",
      "Reduces muscle soreness",
      "Improves flexibility"
    ],
    tips: [
      "Incorporate light movements",
      "Focus on breathing",
      "Stay relaxed"
    ]
  },
];
