export const COGNITIVE_TASKS = [
  "Remember",
  "Explain",
  "Apply",
  "Evaluate",
  "Create",
];

export const LEARNER_ACTIVITY_GROUPS = [
  {
    id: "receptive",
    label: "Receptive Instruction",
    chartColor: "#378ADD",
    activities: [
      "Lecture Participation",
      "Video / Recording Review",
      "Reading",
      "Podcast / Audio Review",
      "eLearning — Read, Watch, Listen",
    ],
  },
  {
    id: "generative",
    label: "Generative Processing",
    chartColor: "#1D9E75",
    activities: [
      "eLearning — Interactive",
      "Q&A with Instructor / Expert",
      "Recap & Debrief",
      "Reflection",
      "Facilitated Group Activity",
      "Concept Mapping / Mind Mapping",
      "Pre-Training / Advance Organizer",
    ],
  },
  {
    id: "guided-practice",
    label: "Guided Practice",
    chartColor: "#BA7517",
    activities: [
      "Worked Example Review",
      "eLearning — Simulate & Practice",
      "Software / Tool Practice",
      "Documentation Practice",
      "Job Aid & Reference Lookup Practice",
      "Shadowing & Job Observation",
    ],
  },
  {
    id: "applied-social",
    label: "Applied & Social Learning",
    chartColor: "#993C1D",
    activities: [
      "Role Play / Mock Conversation",
      "Scenario-Based Exercise",
      "Live Group Discussion",
      "Asynchronous Group Discussion",
      "Peer Teaching",
      "Live Customer Practice",
      "Mentorship / Coaching",
      "Icebreaker / Community Building",
    ],
  },
  {
    id: "assessment",
    label: "Assessment",
    chartColor: "#534AB7",
    activities: [
      "Knowledge Check",
      "Self Assessment",
      "Peer Assessment",
      "Procedural Skills Assessment",
      "Written Graded Assessment",
      "Graded Practice Conversation",
    ],
  },
  {
    id: "engagement",
    label: "Engagement & Motivation",
    chartColor: "#3B6D11",
    activities: [
      "Learning Game",
    ],
  },
];

export const LEARNER_ACTIVITIES = LEARNER_ACTIVITY_GROUPS.flatMap((g) =>
  g.activities.map((a) => ({ label: a, group: g.id }))
);

export const ACTIVITY_GROUP_MAP: Record<string, string> = Object.fromEntries(
  LEARNER_ACTIVITY_GROUPS.flatMap((g) =>
    g.activities.map((a) => [a, g.id])
  )
);

export const MEDIA_GROUPS = [
  {
    id: "document",
    label: "Documents & Text",
    activities: [
      "Text Document",
      "Spreadsheet",
      "Activity Sheet / Workbook",
      "Online Article / Web Page",
    ],
  },
  {
    id: "visual-presentation",
    label: "Visual Presentation",
    activities: [
      "Slideshow",
      "Infographic / Visual Aid",
    ],
  },
  {
    id: "audio-video",
    label: "Audio & Video",
    activities: [
      "Audio Recording / Podcast",
      "Recorded Lecture",
      "Produced Instructional Video",
    ],
  },
  {
    id: "interactive-digital",
    label: "Interactive Digital",
    activities: [
      "eLearning Module",
      "Quiz / Survey",
      "Live System / Application",
      "Digital Workspace / Notebook",
    ],
  },
  {
    id: "collaborative",
    label: "Collaborative & Social",
    activities: [
      "Collaborative Platform",
      "Discussion Channel",
    ],
  },
  {
    id: "live-experiential",
    label: "Live & Experiential",
    activities: [
      "Guest Speaker / SME Session",
      "VR / AR",
    ],
  },
];

export const MEDIA_OPTIONS = MEDIA_GROUPS.flatMap((g) =>
  g.activities.map((m) => ({ label: m, group: g.id }))
);

export const MEDIA_GROUP_MAP: Record<string, string> = Object.fromEntries(
  MEDIA_GROUPS.flatMap((g) =>
    g.activities.map((m) => [m, g.id])
  )
);

export const DELIVERY_METHODS = [
  "Instructor-Led",
  "Self-Paced",
  "On-the-Job Training",
  "Microlearning",
];

export const CONTENT_TYPES = [
  "Facts / Concepts",
  "Workflow — Operations / Admin / Support",
  "Procedural — Software / Tools",
  "Procedural — Communication Skills",
  "Problem-Solving — Software / Tools",
  "Problem-Solving — Communication Skills",
];

export const TRANSFER_LEVELS = [
  "Near Transfer",
  "Far Transfer",
];

export const INSTRUCTIONAL_MODES = [
  "Receptive",
  "Directive",
  "Guided Discovery",
];

export const PLAN_OPTIONS = [
  "Keep",
  "Remove",
  "Rebrand",
  "Minor Change",
  "Major Update",
  "Merge w/ Below",
  "Add to Above",
  "Split",
  "New Addition",
];

export const TIME_ZONES = [
  { value: "UTC-08:00", label: "UTC-08:00 (US Pacific)" },
  { value: "UTC-07:00", label: "UTC-07:00 (US Mountain)" },
  { value: "UTC-06:00", label: "UTC-06:00 (US Central)" },
  { value: "UTC-05:00", label: "UTC-05:00 (US Eastern)" },
  { value: "UTC+01:00", label: "UTC+01:00 (Central Europe)" },
  { value: "UTC+02:00", label: "UTC+02:00 (Eastern Europe)" },
  { value: "UTC+03:00", label: "UTC+03:00 (Moscow)" },
  { value: "UTC+05:30", label: "UTC+05:30 (India)" },
  { value: "UTC+07:00", label: "UTC+07:00 (Thailand)" },
  { value: "UTC+08:00", label: "UTC+08:00 (Philippines)" },
  { value: "UTC+09:00", label: "UTC+09:00 (Japan)" },
  { value: "UTC+11:00", label: "UTC+11:00 (New South Wales)" },
];
