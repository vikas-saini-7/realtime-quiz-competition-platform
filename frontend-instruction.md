You are a senior frontend engineer building the FRONTEND for a REAL-TIME QUIZ / COMPETITION PLATFORM.

The backend already exists and exposes REST APIs + WebSocket events.

**IMPORTANT:** All API endpoints, request/response formats, and WebSocket events are documented in `API-DOCUMENTATION.md`. Use that file as the single source of truth for:

- REST API base URL: `http://localhost:3000/api`
- WebSocket URL: `ws://localhost:3000/quiz`
- All endpoint paths, request bodies, and response schemas
- WebSocket event names and payloads
- Data models (User, Quiz, Question, Attempt, Answer)
- Authentication headers and JWT handling

========================
TECH STACK (MANDATORY)
========================

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui (use wherever possible)
- Tabler Icons (@tabler/icons-react)
- Socket.io client
- Zustand (light global state)
- React Query / TanStack Query
- NextAuth (JWT-based)
- QR code support
- Deployed on Vercel

========================
DESIGN SYSTEM
========================

- Minimalistic
- Clean
- Professional
- Neutral colors
- No flashy animations
- No gradients
- No gamified childish UI
- Good spacing & typography
- shadcn/ui components preferred over custom ones

========================
LAYOUT & UI/UX GUIDELINES
========================

- Follow best possible layout patterns
- Create UI/UX friendly interfaces
- Minimal modern sections only
- Avoid extra/unnecessary information
- Keep content scannable and digestible
- Use proper visual hierarchy
- Consistent spacing using Tailwind's spacing scale
- Mobile-first responsive design

ICONS:

- Use Tabler Icons library (@tabler/icons-react)
- Icons should be used wherever possible to improve scannability
- If an icon is not available in Tabler, create a custom SVG component
- Icon sizes: sm (16px), md (20px), lg (24px), xl (32px)
- Use icons for:
  - Navigation items
  - Action buttons
  - Status indicators
  - Empty states
  - Feature highlights
  - Form field labels (where helpful)

SECTIONS TO INCLUDE:

- Header with logo + navigation + user menu
- Sidebar (for dashboard layouts)
- Main content area with proper max-width
- Footer (minimal, on public pages only)
- Breadcrumbs (for nested routes)
- Loading skeletons (not spinners)
- Empty states with helpful CTAs
- Error states with recovery options

========================
USER ROLES
========================

- HOST
- USER

========================
CORE FLOWS
========================

1. AUTH

- Login
- Register
- JWT-based session
- Protected routes
- Role-aware UI (HOST vs USER)

2. HOST FLOW

- Dashboard (list quizzes)
- Create quiz (manual or AI-generated)
- Add/edit questions
- Schedule quiz
- Generate share link + QR
- Live quiz control screen
  - show joined users
  - start quiz
  - show live leaderboard
  - end quiz
- Final results view

3. USER FLOW

- Browse available live quizzes
- Join quiz via link / QR
- Enter name or login
- Lobby screen (waiting)
- Live quiz screen
  - one question at a time
  - countdown timer
  - MCQ selection
- Result screen

4. USER PROFILE FLOW

- View profile info
- View quiz history (past attempts)
- See scores and rankings

5. LANDING PAGE

- Hero section with platform description
- Quick actions (Login / Register / Join Quiz)
- Role-based redirect after auth

========================
REALTIME (See API-DOCUMENTATION.md for full details)
========================

- Connect to backend via Socket.io at `ws://localhost:3000/quiz`
- Pass JWT token in handshake: `{ auth: { token: 'Bearer <token>' } }`
- Join room using quizId

Host Events (emit):

- host:initialize → Initialize quiz session
- host:start → Start the quiz
- host:next-question → Show next question
- host:end-quiz → End quiz early

Participant Events (emit):

- participant:join → Join a live quiz
- participant:answer → Submit answer
- participant:leave → Leave quiz
- leaderboard:get → Get current standings

Broadcast Events (listen):

- quiz:started → Quiz has begun
- quiz:question → New question displayed
- quiz:question-ended → Time up, shows correct answer + leaderboard
- quiz:ended → Final results
- participant:joined → New participant count
- participant:left → Updated participant count
- answer:received → Personal answer feedback

========================
ROUTING STRUCTURE (APP ROUTER)
========================
Use clean, feature-based routes:

/ (Landing page - public)

/auth
/auth/login
/auth/register

/host
/host/dashboard
/host/create-quiz
/host/quiz/[quizId]
/host/quiz/[quizId]/edit
/host/quiz/[quizId]/live
/host/quiz/[quizId]/results

/play
/play/browse (discover live quizzes)
/play/join/[quizId]
/play/lobby/[quizId]
/play/quiz/[quizId]
/play/result/[quizId]

/user
/user/profile
/user/history (past quiz attempts)

/not-found (404 error page)

========================
COMPONENT STRATEGY
========================

- Use shadcn/ui for:
  - Button
  - Card
  - Input
  - Label
  - Table
  - Badge
  - Dialog
  - Sheet
  - Tabs
  - Progress
- Custom components only when necessary
- No over-abstraction

========================
STATE MANAGEMENT
========================

- Auth state → NextAuth
- Quiz runtime state → Zustand
- Server data → React Query
- Socket instance → Singleton hook

========================
FOLDER STRUCTURE
========================
src/
├── app/
├── components/
│ ├── ui/ (shadcn)
│ ├── quiz/
│ ├── layout/
├── hooks/
├── lib/
├── services/
├── store/
├── types/
└── styles/

========================
CODING RULES
========================

- Type everything
- No inline styles
- No over-engineering
- Components should be readable
- Handle loading & error states
- Minimal comments, clear naming

========================
OUTPUT EXPECTATION
========================
Generate:

1. App router structure
2. Layouts (auth / host / play)
3. shadcn-based UI components
4. Auth pages
5. Host dashboard UI
6. User quiz UI
7. Socket connection setup
8. Zustand store for live quiz
9. API service layer
10. Minimal styling with Tailwind

Do NOT write backend code.
Use `API-DOCUMENTATION.md` for all endpoint paths and data schemas.
Explain only important architectural decisions.

========================
API REFERENCE (Quick Reference - See API-DOCUMENTATION.md for full details)
========================

REST Endpoints:

- POST /api/auth/register - Register user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

- GET /api/quizzes - List all quizzes
- GET /api/quizzes/my-quizzes - Host's quizzes (HOST only)
- GET /api/quizzes/live - List live quizzes
- POST /api/quizzes - Create quiz (HOST only)
- GET /api/quizzes/:id - Get quiz
- GET /api/quizzes/:id/with-questions - Get quiz with questions
- PUT /api/quizzes/:id - Update quiz (HOST only)
- DELETE /api/quizzes/:id - Delete quiz (HOST only)

- POST /api/questions - Create question (HOST only)
- POST /api/questions/bulk - Bulk create questions (HOST only)
- GET /api/questions/quiz/:quizId - Get questions by quiz
- PUT /api/questions/:id - Update question (HOST only)
- DELETE /api/questions/:id - Delete question (HOST only)

- POST /api/attempts - Create/get attempt
- GET /api/attempts/my-attempts - User's attempts
- GET /api/attempts/quiz/:quizId - Attempts by quiz

- GET /api/answers/attempt/:attemptId - Answers by attempt

- GET /api/leaderboard/:quizId - Get leaderboard
- GET /api/leaderboard/:quizId/my-position - User's position

Key Data Models:

- User: { id, name, email, role: "HOST"|"USER" }
- Quiz: { id, title, description, hostId, status: "DRAFT"|"SCHEDULED"|"LIVE"|"COMPLETED" }
- Question: { id, quizId, questionText, optionA/B/C/D, correctOption, timeLimit, baseScore }
- Attempt: { id, quizId, userId, totalScore, joinedAt, completedAt }
- Leaderboard Entry: { userId, userName, score, rank }

========================
ENVIRONMENT VARIABLES
========================

Create `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_WS_URL=ws://localhost:3000/quiz
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3001
```

========================
TYPE DEFINITIONS (src/types/index.ts)
========================

```typescript
// User types
export type UserRole = "HOST" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

// Quiz types
export type QuizStatus = "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED";

export interface Quiz {
  id: string;
  title: string;
  description: string | null;
  hostId: string;
  status: QuizStatus;
  scheduledAt: string | null;
  createdAt: string;
  questionCount?: number;
}

export interface QuizWithQuestions extends Quiz {
  questions: Question[];
}

// Question types
export type OptionLetter = "A" | "B" | "C" | "D";

export interface Question {
  id: string;
  quizId: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: OptionLetter;
  timeLimit: number;
  baseScore: number;
  negativeScore: number;
  orderIndex: number;
}

// For creating questions (without correctOption for participants)
export interface QuestionForParticipant {
  id: string;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  timeLimit: number;
}

// Attempt types
export interface Attempt {
  id: string;
  quizId: string;
  userId: string;
  totalScore: number;
  joinedAt: string;
  completedAt: string | null;
}

// Leaderboard types
export interface LeaderboardEntry {
  userId: string;
  userName: string;
  score: number;
  rank: number;
}

// WebSocket payload types
export interface QuizQuestionEvent {
  questionIndex: number;
  totalQuestions: number;
  question: QuestionForParticipant;
  startTime: number;
  endTime: number;
}

export interface QuizQuestionEndedEvent {
  questionIndex: number;
  correctOption: OptionLetter;
  leaderboard: LeaderboardEntry[];
}

export interface QuizEndedEvent {
  quizId: string;
  finalLeaderboard: LeaderboardEntry[];
}

export interface AnswerReceivedEvent {
  questionId: string;
  isCorrect: boolean;
  scoreAwarded: number;
  totalScore: number;
}

export interface ParticipantJoinedEvent {
  userId: string;
  userName: string;
  participantCount: number;
}
```

========================
ZUSTAND STORE STRUCTURE (src/store/quiz-store.ts)
========================

```typescript
import { create } from "zustand";

interface QuizState {
  // Connection
  isConnected: boolean;

  // Quiz session
  quizId: string | null;
  attemptId: string | null;
  quizTitle: string | null;

  // Current question
  currentQuestion: QuestionForParticipant | null;
  questionIndex: number;
  totalQuestions: number;
  questionStartTime: number | null;
  questionEndTime: number | null;

  // Answer state
  selectedOption: OptionLetter | null;
  hasAnswered: boolean;
  lastAnswerResult: AnswerReceivedEvent | null;

  // Scores
  totalScore: number;
  leaderboard: LeaderboardEntry[];

  // Participants (for host)
  participantCount: number;

  // Quiz status
  status: "idle" | "waiting" | "active" | "between_questions" | "finished";

  // Actions
  setConnected: (connected: boolean) => void;
  joinQuiz: (quizId: string, attemptId: string, title: string) => void;
  setQuestion: (event: QuizQuestionEvent) => void;
  submitAnswer: (option: OptionLetter) => void;
  setAnswerResult: (result: AnswerReceivedEvent) => void;
  updateLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setParticipantCount: (count: number) => void;
  endQuiz: (finalLeaderboard: LeaderboardEntry[]) => void;
  reset: () => void;
}
```

========================
SOCKET HOOK PATTERN (src/hooks/useSocket.ts)
========================

```typescript
// Singleton socket instance pattern
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token: `Bearer ${token}` },
      autoConnect: false,
    });
  }
  return socket;
}

export function useSocket() {
  // Return socket instance and connection helpers
  // Handle connect, disconnect, event listeners
  // Clean up on unmount
}
```

========================
API SERVICE PATTERN (src/services/api.ts)
========================

```typescript
// Use axios or fetch with interceptors
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add auth interceptor
api.interceptors.request.use((config) => {
  const token = getAccessToken(); // from session/storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Export typed service functions
export const authService = {
  register: (data: RegisterDto) =>
    api.post<AuthResponse>("/auth/register", data),
  login: (data: LoginDto) => api.post<AuthResponse>("/auth/login", data),
  getMe: () => api.get<User>("/auth/me"),
};

export const quizService = {
  getAll: () => api.get<Quiz[]>("/quizzes"),
  getMyQuizzes: () => api.get<Quiz[]>("/quizzes/my-quizzes"),
  getLive: () => api.get<Quiz[]>("/quizzes/live"),
  getById: (id: string) => api.get<Quiz>(`/quizzes/${id}`),
  getWithQuestions: (id: string) =>
    api.get<QuizWithQuestions>(`/quizzes/${id}/with-questions`),
  create: (data: CreateQuizDto) => api.post<Quiz>("/quizzes", data),
  update: (id: string, data: UpdateQuizDto) =>
    api.put<Quiz>(`/quizzes/${id}`, data),
  delete: (id: string) => api.delete(`/quizzes/${id}`),
};

// ... similar for questions, attempts, leaderboard
```

========================
REACT QUERY HOOKS (src/hooks/queries/)
========================

```typescript
// Example: useQuizzes.ts
export function useMyQuizzes() {
  return useQuery({
    queryKey: ["quizzes", "my"],
    queryFn: () => quizService.getMyQuizzes().then((res) => res.data),
  });
}

export function useQuizWithQuestions(quizId: string) {
  return useQuery({
    queryKey: ["quiz", quizId, "questions"],
    queryFn: () => quizService.getWithQuestions(quizId).then((res) => res.data),
    enabled: !!quizId,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: quizService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quizzes"] });
    },
  });
}
```

========================
KEY UI COMPONENTS TO BUILD
========================

1. QuizCard - Display quiz info in dashboard
2. QuestionForm - Create/edit question with 4 options
3. CountdownTimer - Visual timer with progress ring
4. OptionButton - MCQ option with selected/correct/wrong states
5. LeaderboardTable - Ranked list with highlights
6. ParticipantCounter - Show joined users count
7. QRCodeDisplay - Generate QR for quiz join link
8. QuizStatusBadge - DRAFT/SCHEDULED/LIVE/COMPLETED badges
9. ScoreDisplay - Animated score updates
10. WaitingScreen - Lobby with pulse animation

========================
UX CONSIDERATIONS
========================

1. Loading States
   - Skeleton loaders for lists
   - Spinner for actions
   - Disabled buttons during mutations

2. Error Handling
   - Toast notifications for errors
   - Retry buttons for failed requests
   - Graceful socket disconnection handling

3. Optimistic Updates
   - Show answer selection immediately
   - Update score optimistically on answer

4. Accessibility
   - Keyboard navigation for options (A/B/C/D keys)
   - Focus management during quiz
   - Screen reader announcements for timer

5. Mobile Responsive
   - Full-width options on mobile
   - Bottom-fixed answer buttons
   - Swipe gestures for navigation

6. Sound Effects (Optional)
   - Timer tick sound in last 5 seconds
   - Correct/wrong answer sounds
   - Quiz start/end sounds

========================
SCORING DISPLAY LOGIC
========================

Score calculation happens on backend, but display:

- Base score: 100 points
- Speed bonus: +2 points per remaining second
- Wrong answer: -25 points (negative marking)

Show breakdown after each answer:

```
✓ Correct! +130 points
  Base: 100 | Speed Bonus: +30
```

========================
MIDDLEWARE FOR PROTECTED ROUTES
========================

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Protect /host routes - require HOST role
  if (pathname.startsWith("/host")) {
    if (!token) return redirectToLogin(request);
    // Verify HOST role
  }

  // Protect /play routes - require any authenticated user
  if (pathname.startsWith("/play")) {
    if (!token) return redirectToLogin(request);
  }
}
```
