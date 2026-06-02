# HMG Academy Ultimate Ecosystem v6.0 (Enterprise Gold Standard)

Welcome to **Learnhub Class V6**, the definitive and absolute pinnacle of the HMG Academy static LMS platforms. Engineered specifically to comply with both the Nigerian National Curriculum (NECO/WAEC) and British standard Year 7-9 syllabi (Cambridge Checkpoint), Class V6 moves far beyond basic presentation layouts to establish a cohesive, interactive, and gamified academic command center.

---

## 🚀 Key V6 Enterprise Feature Set (Zero-API Cost Architecture)

Learnhub Class V6 represents a breakthrough in static educational technologies. By utilizing browser-executed client-side compilers, it delivers advanced, interactive, and inclusive tools with **absolutely zero server fees, database costs, or API keys**.

### 1. The Virtual STEM Lab & Solver Hub (`tools.html`)
A standalone visual laboratory that provides real-time computational answers:
*   **Mathematics Solvers**: Solves any linear equation ($ax + b = c$) and quadratic systems ($ax^2 + bx + c = 0$) with clean, step-by-step logic.
*   **Computer Science Base Converters**: Seamless decimal-to-binary-to-octal conversions, coupled with a string-to-binary ASCII byte block generator.
*   **Chemistry Bohr Lab**: Displays real-time electronic shells, protons, neutrons, and draws vector Bohr atomic diagrams for elements 1 to 10.

### 2. National Scholar Leaderboard (Gamified Competition)
To drive study consistency, Class V6 features a simulated national leaderboard. Students earn experience points through lesson reads (10 Pts), active checks (5 Pts), quiz scores (max 200 Pts), and streaks. They are dynamically ranked against high-performing scholars from other states in Nigeria.

### 3. Decoupled Certificate Verification Signature Engine
Certificates awarded on Class V6 can be validated on-the-fly without database requests. When a student passes, a base64-encoded signature containing their credentials is compiled into a serial key:
`HMG-CERT-[topicId]-[base64_hash]`
Pasting this key in the "Verify Certificates" dashboard modal decodes the signature dynamically to verify achievement.

### 4. Dynamic SVG Performance Analytics Charts
The main dashboard includes dual visual charts generated directly inside pure-JS vectors:
*   *Subject Completion Bar Chart*: Tracks real-time subject-by-subject syllabus coverage.
*   *Performance Trend Line Graph*: Plots a running line tracking the student's 5 most recent quiz outcomes.

### 5. High-Fidelity Inclusive Accessibility Panel
Every lesson features real-time **Text-to-Speech (TTS) Voice Narration** (Web Speech API), dynamic text scaling (14px–28px), inclusive Dyslexic reading styles, and complete High-Contrast Dark Mode settings saved directly to browser cache memory.

---

## 📂 System Architecture
```
class v6/
├── assets/
│   └── js/
│       ├── dashboard.js       <-- Analytics, Streak calculation, Leaderboard, Verifier
│       ├── lesson.js          <-- Notebook auto-saver, TTS engine, Bohr model generator
│       ├── library.js         <-- Global indexer and resource search engine
│       ├── planner.js         <-- Academic study calendar sync tool
│       └── quiz.js            <-- Core assessment engine & cert hash generator
├── data/
│   └── curriculum/
│       ├── map.json           <-- The master 3x3x3 curriculum blueprint
│       └── topics/            <-- 54 highly detailed term-by-term JSON files
├── index.html                 <-- Unified high-conversion entry portal
├── dashboard.html             <-- Centralized Student Command Center
├── lesson.html                <-- Dynamic interactive visual textbook player
├── quiz.html                  <-- formal assessment evaluation portal
├── library.html               <-- Global resource repository index
├── planner.html               <-- Academic planning tool
├── tools.html                 <-- Virtual STEM Lab & Solver Hub
├── certificate.html           <-- Premium gold-sealed credential generator
├── DEPLOYMENT.md              <-- Detailed multi-platform deployment manual
└── README.md                  <-- System overview documentation
```

---

## 🎓 Complete 54-Topic Blended Curriculum Grid

Class V6 contains the most comprehensive Junior Secondary curriculum database, structuring 54 fully detailed lessons across three core subjects and all academic terms:

| Class Level | Subject | Term 1 Topics | Term 2 Topics | Term 3 Topics |
| :--- | :--- | :--- | :--- | :--- |
| **JSS 1 / Year 7** | **Mathematics** | 1. Number Bases<br>2. Fractions & Decimals | 1. Algebraic Expressions<br>2. Linear Equations | 1. Plane Geometry<br>2. Area & Perimeter |
| | **Computer Science** | 1. Foundations of Computing<br>2. Computer Hardware | 1. Digital Literacy<br>2. Word Processing Mastery | 1. ICT in Society<br>2. Digital Ethics & Security |
| | **Basic Science** | 1. Living & Non-Living Things<br>2. The Human Body | 1. Health & Disease<br>2. Environmental Pollution | 1. Force & Energy<br>2. Space Science (Solar System) |
| **JSS 2 / Year 8** | **Mathematics** | 1. Indices & Powers<br>2. Standard Form | 1. Linear Inequalities<br>2. Simple Interest & Percentages | 1. Pythagoras' Theorem<br>2. Volume of Solid Prisms |
| | **Computer Science** | 1. Computational Thinking<br>2. Logic & Flowcharts | 1. Programming Variables<br>2. Control Structures | 1. Computer Networks<br>2. Spreadsheet Engineering |
| | **Basic Science** | 1. Thermal Energy (Heat)<br>2. Kinetic Theory of Matter | 1. Animal Digestion<br>2. Circulatory Machinery | 1. Simple Machines<br>2. Wave Mechanics (Light/Sound) |
| **JSS 3 / Year 9** | **Mathematics** | 1. Quadratic Equations<br>2. Simultaneous Equations | 1. Trigonometric Ratios<br>2. Elevation & Depression | 1. Spheres & Cones Geometry<br>2. Probability Concepts |
| | **Computer Science** | 1. Intro to Data Science<br>2. Web Technologies | 1. Database Management<br>2. Software Development Life Cycle | 1. Cybersecurity and Firewalls<br>2. Emerging Technologies |
| | **Basic Science** | 1. Radioactivity & Atoms<br>2. Chemical Bonding | 1. Human Genetics & Heredity<br>2. Earth Resources (Crude Oil) | 1. Electricity & Magnetism<br>2. Environmental Conservation |

---

*HMG Academy concepts • "Learning Deliberately. Teaching Authentically."*
