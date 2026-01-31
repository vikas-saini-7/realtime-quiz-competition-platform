# Real-Time Quiz Competition Platform - API Documentation

## Base URL

```
REST API: http://localhost:3000/api
WebSocket: ws://localhost:3000/quiz
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <access_token>
```

---

## Data Models

### User

```typescript
{
  id: string; // UUID
  name: string; // User's display name
  email: string; // Unique email address
  role: "HOST" | "USER"; // HOST can create quizzes, USER can only participate
  createdAt: Date;
}
```

### Quiz

```typescript
{
  id: string;           // UUID
  title: string;        // Quiz title
  description: string | null;
  hostId: string;       // UUID of the host user
  status: "DRAFT" | "SCHEDULED" | "LIVE" | "COMPLETED";
  scheduledAt: Date | null;
  createdAt: Date;
  questionCount?: number; // Only in some responses
}
```

### Question

```typescript
{
  id: string; // UUID
  quizId: string; // UUID of parent quiz
  questionText: string; // The question content
  optionA: string; // First option
  optionB: string; // Second option
  optionC: string; // Third option
  optionD: string; // Fourth option
  correctOption: "A" | "B" | "C" | "D"; // Only visible to HOST
  timeLimit: number; // Seconds (default: 30, min: 5, max: 120)
  baseScore: number; // Points for correct answer (default: 100)
  negativeScore: number; // Penalty for wrong answer (default: 25)
  orderIndex: number; // Question order (0-based)
}
```

### Attempt

```typescript
{
  id: string; // UUID
  quizId: string; // UUID of the quiz
  userId: string; // UUID of the participant
  totalScore: number; // Accumulated score
  joinedAt: Date; // When user joined the quiz
  completedAt: Date | null; // When quiz was completed
}
```

### Answer

```typescript
{
  id: string; // UUID
  attemptId: string; // UUID of the attempt
  questionId: string; // UUID of the question
  selectedOption: "A" | "B" | "C" | "D" | null;
  isCorrect: boolean;
  timeTaken: number; // Milliseconds
  scoreAwarded: number; // Points earned/lost for this answer
}
```

---

## REST API Endpoints

### Authentication

#### POST /api/auth/register

Register a new user account.

**Public:** Yes

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "HOST" // Optional: "HOST" or "USER" (default: "USER")
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "HOST"
  }
}
```

**Validation Rules:**

- `name`: Required, non-empty string
- `email`: Required, valid email format, unique
- `password`: Required, minimum 6 characters
- `role`: Optional, must be "HOST" or "USER"

---

#### POST /api/auth/login

Login with existing credentials.

**Public:** Yes

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "HOST"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid credentials

---

#### GET /api/auth/me

Get current authenticated user's profile.

**Protected:** Yes

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "HOST",
  "createdAt": "2026-01-31T10:00:00.000Z"
}
```

---

### Users

#### GET /api/users

Get all users (for admin purposes).

**Protected:** Yes

**Response (200):**

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "HOST",
    "createdAt": "2026-01-31T10:00:00.000Z"
  }
]
```

---

#### GET /api/users/:id

Get a specific user by ID.

**Protected:** Yes

**Path Parameters:**

- `id`: UUID of the user

**Response (200):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "HOST",
  "createdAt": "2026-01-31T10:00:00.000Z"
}
```

---

### Quizzes

#### POST /api/quizzes

Create a new quiz.

**Protected:** Yes  
**Required Role:** HOST

**Request Body:**

```json
{
  "title": "JavaScript Fundamentals",
  "description": "Test your JS knowledge!",
  "scheduledAt": "2026-02-01T15:00:00.000Z" // Optional
}
```

**Response (201):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "JavaScript Fundamentals",
  "description": "Test your JS knowledge!",
  "hostId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT",
  "scheduledAt": "2026-02-01T15:00:00.000Z",
  "createdAt": "2026-01-31T10:00:00.000Z"
}
```

---

#### GET /api/quizzes

Get all quizzes.

**Protected:** Yes

**Response (200):**

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "JavaScript Fundamentals",
    "description": "Test your JS knowledge!",
    "hostId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "DRAFT",
    "scheduledAt": "2026-02-01T15:00:00.000Z",
    "createdAt": "2026-01-31T10:00:00.000Z"
  }
]
```

---

#### GET /api/quizzes/my-quizzes

Get quizzes created by the current host.

**Protected:** Yes  
**Required Role:** HOST

**Response (200):**

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "JavaScript Fundamentals",
    "description": "Test your JS knowledge!",
    "hostId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "DRAFT",
    "scheduledAt": null,
    "createdAt": "2026-01-31T10:00:00.000Z"
  }
]
```

---

#### GET /api/quizzes/live

Get all currently live quizzes (available for participants to join).

**Protected:** Yes

**Response (200):**

```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "title": "JavaScript Fundamentals",
    "description": "Test your JS knowledge!",
    "hostId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "LIVE",
    "scheduledAt": null,
    "createdAt": "2026-01-31T10:00:00.000Z"
  }
]
```

---

#### GET /api/quizzes/:id

Get a specific quiz by ID.

**Protected:** Yes

**Path Parameters:**

- `id`: UUID of the quiz

**Response (200):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "JavaScript Fundamentals",
  "description": "Test your JS knowledge!",
  "hostId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT",
  "scheduledAt": null,
  "createdAt": "2026-01-31T10:00:00.000Z"
}
```

**Error Responses:**

- `404 Not Found`: Quiz not found

---

#### GET /api/quizzes/:id/with-questions

Get a quiz with all its questions.

**Protected:** Yes

**Path Parameters:**

- `id`: UUID of the quiz

**Response (200):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "JavaScript Fundamentals",
  "description": "Test your JS knowledge!",
  "hostId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "DRAFT",
  "scheduledAt": null,
  "createdAt": "2026-01-31T10:00:00.000Z",
  "questions": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440001",
      "quizId": "660e8400-e29b-41d4-a716-446655440001",
      "questionText": "What is the output of typeof null?",
      "optionA": "null",
      "optionB": "object",
      "optionC": "undefined",
      "optionD": "string",
      "correctOption": "B",
      "timeLimit": 30,
      "baseScore": 100,
      "negativeScore": 25,
      "orderIndex": 0
    }
  ]
}
```

---

#### PUT /api/quizzes/:id

Update a quiz.

**Protected:** Yes  
**Required Role:** HOST (owner only)

**Path Parameters:**

- `id`: UUID of the quiz

**Request Body:**

```json
{
  "title": "Advanced JavaScript",
  "description": "Updated description",
  "status": "SCHEDULED",
  "scheduledAt": "2026-02-01T18:00:00.000Z"
}
```

**Response (200):**

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "title": "Advanced JavaScript",
  "description": "Updated description",
  "hostId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "SCHEDULED",
  "scheduledAt": "2026-02-01T18:00:00.000Z",
  "createdAt": "2026-01-31T10:00:00.000Z"
}
```

---

#### DELETE /api/quizzes/:id

Delete a quiz.

**Protected:** Yes  
**Required Role:** HOST (owner only)

**Path Parameters:**

- `id`: UUID of the quiz

**Response (200):**

```json
{
  "message": "Quiz deleted successfully"
}
```

---

### Questions

#### POST /api/questions

Create a single question.

**Protected:** Yes  
**Required Role:** HOST

**Request Body:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "questionText": "What is the output of typeof null?",
  "optionA": "null",
  "optionB": "object",
  "optionC": "undefined",
  "optionD": "string",
  "correctOption": "B",
  "timeLimit": 30,
  "baseScore": 100,
  "negativeScore": 25,
  "orderIndex": 0
}
```

**Response (201):**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440001",
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "questionText": "What is the output of typeof null?",
  "optionA": "null",
  "optionB": "object",
  "optionC": "undefined",
  "optionD": "string",
  "correctOption": "B",
  "timeLimit": 30,
  "baseScore": 100,
  "negativeScore": 25,
  "orderIndex": 0
}
```

**Validation Rules:**

- `quizId`: Required, valid UUID
- `questionText`: Required, non-empty string
- `optionA`, `optionB`, `optionC`, `optionD`: Required, non-empty strings
- `correctOption`: Required, one of "A", "B", "C", "D"
- `timeLimit`: Optional, number between 5-120 (default: 30)
- `baseScore`: Optional, minimum 0 (default: 100)
- `negativeScore`: Optional, minimum 0 (default: 25)
- `orderIndex`: Required, minimum 0

---

#### POST /api/questions/bulk

Create multiple questions at once.

**Protected:** Yes  
**Required Role:** HOST

**Request Body:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "questions": [
    {
      "questionText": "What is the output of typeof null?",
      "optionA": "null",
      "optionB": "object",
      "optionC": "undefined",
      "optionD": "string",
      "correctOption": "B",
      "timeLimit": 30,
      "baseScore": 100,
      "negativeScore": 25,
      "orderIndex": 0
    },
    {
      "questionText": "Which is not a JavaScript data type?",
      "optionA": "string",
      "optionB": "boolean",
      "optionC": "integer",
      "optionD": "symbol",
      "correctOption": "C",
      "timeLimit": 30,
      "baseScore": 100,
      "negativeScore": 25,
      "orderIndex": 1
    }
  ]
}
```

**Response (201):**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "quizId": "660e8400-e29b-41d4-a716-446655440001",
    "questionText": "What is the output of typeof null?",
    ...
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440002",
    "quizId": "660e8400-e29b-41d4-a716-446655440001",
    "questionText": "Which is not a JavaScript data type?",
    ...
  }
]
```

---

#### GET /api/questions/quiz/:quizId

Get all questions for a quiz.

**Protected:** Yes

**Path Parameters:**

- `quizId`: UUID of the quiz

**Response (200):**

```json
[
  {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "quizId": "660e8400-e29b-41d4-a716-446655440001",
    "questionText": "What is the output of typeof null?",
    "optionA": "null",
    "optionB": "object",
    "optionC": "undefined",
    "optionD": "string",
    "correctOption": "B",
    "timeLimit": 30,
    "baseScore": 100,
    "negativeScore": 25,
    "orderIndex": 0
  }
]
```

---

#### GET /api/questions/:id

Get a specific question by ID.

**Protected:** Yes

**Path Parameters:**

- `id`: UUID of the question

**Response (200):**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440001",
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "questionText": "What is the output of typeof null?",
  "optionA": "null",
  "optionB": "object",
  "optionC": "undefined",
  "optionD": "string",
  "correctOption": "B",
  "timeLimit": 30,
  "baseScore": 100,
  "negativeScore": 25,
  "orderIndex": 0
}
```

---

#### PUT /api/questions/:id

Update a question.

**Protected:** Yes  
**Required Role:** HOST (quiz owner only)

**Path Parameters:**

- `id`: UUID of the question

**Request Body:**

```json
{
  "questionText": "Updated question text?",
  "optionA": "Updated option A",
  "correctOption": "A",
  "timeLimit": 45
}
```

**Response (200):**

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440001",
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "questionText": "Updated question text?",
  "optionA": "Updated option A",
  "optionB": "object",
  "optionC": "undefined",
  "optionD": "string",
  "correctOption": "A",
  "timeLimit": 45,
  "baseScore": 100,
  "negativeScore": 25,
  "orderIndex": 0
}
```

---

#### DELETE /api/questions/:id

Delete a question.

**Protected:** Yes  
**Required Role:** HOST (quiz owner only)

**Path Parameters:**

- `id`: UUID of the question

**Response (200):**

```json
{
  "message": "Question deleted successfully"
}
```

---

### Attempts

#### POST /api/attempts

Create or get an existing attempt for a quiz.

**Protected:** Yes

**Request Body:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response (200/201):**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440001",
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "totalScore": 0,
  "joinedAt": "2026-01-31T10:00:00.000Z",
  "completedAt": null
}
```

---

#### GET /api/attempts/my-attempts

Get all attempts by the current user.

**Protected:** Yes

**Response (200):**

```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440001",
    "quizId": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "totalScore": 350,
    "joinedAt": "2026-01-31T10:00:00.000Z",
    "completedAt": "2026-01-31T10:30:00.000Z"
  }
]
```

---

#### GET /api/attempts/quiz/:quizId

Get all attempts for a specific quiz.

**Protected:** Yes

**Path Parameters:**

- `quizId`: UUID of the quiz

**Response (200):**

```json
[
  {
    "id": "880e8400-e29b-41d4-a716-446655440001",
    "quizId": "660e8400-e29b-41d4-a716-446655440001",
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "totalScore": 350,
    "joinedAt": "2026-01-31T10:00:00.000Z",
    "completedAt": "2026-01-31T10:30:00.000Z"
  }
]
```

---

#### GET /api/attempts/:id

Get a specific attempt by ID.

**Protected:** Yes

**Path Parameters:**

- `id`: UUID of the attempt

**Response (200):**

```json
{
  "id": "880e8400-e29b-41d4-a716-446655440001",
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "totalScore": 350,
  "joinedAt": "2026-01-31T10:00:00.000Z",
  "completedAt": "2026-01-31T10:30:00.000Z"
}
```

---

### Answers

#### GET /api/answers/attempt/:attemptId

Get all answers for an attempt.

**Protected:** Yes

**Path Parameters:**

- `attemptId`: UUID of the attempt

**Response (200):**

```json
[
  {
    "id": "990e8400-e29b-41d4-a716-446655440001",
    "attemptId": "880e8400-e29b-41d4-a716-446655440001",
    "questionId": "770e8400-e29b-41d4-a716-446655440001",
    "selectedOption": "B",
    "isCorrect": true,
    "timeTaken": 15000,
    "scoreAwarded": 130
  }
]
```

---

#### GET /api/answers/:id

Get a specific answer by ID.

**Protected:** Yes

**Path Parameters:**

- `id`: UUID of the answer

**Response (200):**

```json
{
  "id": "990e8400-e29b-41d4-a716-446655440001",
  "attemptId": "880e8400-e29b-41d4-a716-446655440001",
  "questionId": "770e8400-e29b-41d4-a716-446655440001",
  "selectedOption": "B",
  "isCorrect": true,
  "timeTaken": 15000,
  "scoreAwarded": 130
}
```

---

### Leaderboard

#### GET /api/leaderboard/:quizId

Get the leaderboard for a quiz.

**Protected:** Yes

**Path Parameters:**

- `quizId`: UUID of the quiz

**Query Parameters:**

- `limit`: Number of entries to return (default: 10)

**Response (200):**

```json
[
  {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "userName": "John Doe",
    "score": 450,
    "rank": 1
  },
  {
    "userId": "550e8400-e29b-41d4-a716-446655440001",
    "userName": "Jane Smith",
    "score": 380,
    "rank": 2
  }
]
```

---

#### GET /api/leaderboard/:quizId/my-position

Get the current user's position in the leaderboard.

**Protected:** Yes

**Path Parameters:**

- `quizId`: UUID of the quiz

**Response (200):**

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "userName": "John Doe",
  "score": 450,
  "rank": 1
}
```

---

## WebSocket API

### Connection

Connect to WebSocket server at `ws://localhost:3000/quiz`

**Authentication:**
Pass JWT token in one of these ways:

1. In handshake auth: `{ auth: { token: "Bearer <token>" } }`
2. In query params: `?token=<token>`
3. In headers: `Authorization: Bearer <token>`

```javascript
import { io } from "socket.io-client";

const socket = io("ws://localhost:3000/quiz", {
  auth: {
    token: "Bearer <access_token>",
  },
});
```

---

### Host Events (Emit)

#### host:initialize

Initialize a quiz session (makes it LIVE).

**Required Role:** HOST (quiz owner)

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**

```json
{
  "success": true,
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "state": {
    "quizId": "660e8400-e29b-41d4-a716-446655440001",
    "hostId": "550e8400-e29b-41d4-a716-446655440000",
    "status": "waiting",
    "currentQuestionIndex": -1,
    "totalQuestions": 10
  }
}
```

---

#### host:start

Start the quiz (allow questions to begin).

**Required Role:** HOST (quiz owner)

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**

```json
{
  "success": true
}
```

---

#### host:next-question

Advance to the next question.

**Required Role:** HOST (quiz owner)

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**

```json
{
  "success": true,
  "questionIndex": 0
}
```

Or when quiz is finished:

```json
{
  "success": true,
  "finished": true
}
```

---

#### host:end-quiz

End the quiz immediately.

**Required Role:** HOST (quiz owner)

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**

```json
{
  "success": true
}
```

---

### Participant Events (Emit)

#### participant:join

Join a live quiz.

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**

```json
{
  "success": true,
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "attemptId": "880e8400-e29b-41d4-a716-446655440001",
  "quizTitle": "JavaScript Fundamentals",
  "status": "waiting",
  "currentQuestionIndex": -1
}
```

---

#### participant:answer

Submit an answer to the current question.

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "questionId": "770e8400-e29b-41d4-a716-446655440001",
  "selectedOption": "B"
}
```

**Response:**

```json
{
  "success": true,
  "isCorrect": true,
  "scoreAwarded": 130,
  "totalScore": 130
}
```

**Error Cases:**

- "Not accepting answers at this time"
- "Time is up for this question"
- "Already answered this question"

---

#### participant:leave

Leave the quiz.

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Response:**

```json
{
  "success": true
}
```

---

#### leaderboard:get

Get current leaderboard (available to all).

**Payload:**

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "limit": 10
}
```

**Response:**

```json
{
  "success": true,
  "leaderboard": [
    { "userId": "...", "userName": "John", "score": 450, "rank": 1 }
  ]
}
```

---

### Broadcast Events (Listen)

#### quiz:started

Broadcasted when host starts the quiz.

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "message": "Quiz has started!"
}
```

---

#### quiz:question

Broadcasted when a new question is displayed.

```json
{
  "questionIndex": 0,
  "totalQuestions": 10,
  "question": {
    "id": "770e8400-e29b-41d4-a716-446655440001",
    "questionText": "What is the output of typeof null?",
    "optionA": "null",
    "optionB": "object",
    "optionC": "undefined",
    "optionD": "string",
    "timeLimit": 30
  },
  "startTime": 1706698800000,
  "endTime": 1706698830000
}
```

**Note:** `correctOption` is NOT included in broadcasts to participants.

---

#### quiz:question-ended

Broadcasted when question time is up.

```json
{
  "questionIndex": 0,
  "correctOption": "B",
  "leaderboard": [
    { "userId": "...", "userName": "John", "score": 130, "rank": 1 }
  ]
}
```

---

#### quiz:ended

Broadcasted when quiz is completed.

```json
{
  "quizId": "660e8400-e29b-41d4-a716-446655440001",
  "finalLeaderboard": [
    { "userId": "...", "userName": "John", "score": 450, "rank": 1 },
    { "userId": "...", "userName": "Jane", "score": 380, "rank": 2 }
  ]
}
```

---

#### participant:joined

Broadcasted when a new participant joins.

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "userName": "Jane Smith",
  "participantCount": 15
}
```

---

#### participant:left

Broadcasted when a participant leaves.

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440001",
  "participantCount": 14
}
```

---

#### answer:received

Sent directly to the participant after answering.

```json
{
  "questionId": "770e8400-e29b-41d4-a716-446655440001",
  "isCorrect": true,
  "scoreAwarded": 130,
  "totalScore": 130
}
```

---

## Scoring System

### Score Calculation

- **Correct Answer:** `baseScore + (remainingTime * 2)` points
- **Wrong Answer:** `-negativeScore` points
- **No Answer:** 0 points

### Example

- Question with `baseScore: 100`, `negativeScore: 25`, `timeLimit: 30`
- User answers correctly with 15 seconds remaining
- Score: `100 + (15 * 2) = 130 points`

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

Common error codes:

- `400 Bad Request`: Validation errors
- `401 Unauthorized`: Missing or invalid token
- `403 Forbidden`: Insufficient permissions (wrong role)
- `404 Not Found`: Resource not found
- `409 Conflict`: Duplicate resource

---

## Quiz Lifecycle

1. **HOST creates quiz** → Status: `DRAFT`
2. **HOST adds questions** → Still `DRAFT`
3. **HOST initializes via WebSocket** → Status: `LIVE`
4. **Participants join** → Host sees participant count
5. **HOST starts quiz** → Questions begin
6. **HOST sends next-question** → Each question is timed
7. **Time up or HOST ends quiz** → Status: `COMPLETED`

---

## Frontend Implementation Guide

### Key Flows

#### 1. Authentication Flow

```
Register/Login → Store JWT → Use in all API calls
```

#### 2. Host Dashboard Flow

```
Login as HOST → My Quizzes → Create Quiz → Add Questions → Go Live
```

#### 3. Quiz Hosting Flow

```
Select Quiz → Initialize (WebSocket) → Wait for participants → Start → Next Question (loop) → End
```

#### 4. Participant Flow

```
Login → Browse Live Quizzes → Join (WebSocket) → Wait for start → Answer questions → View results
```

### State Management Suggestions

- Store `accessToken` in secure storage
- Store current `user` object in state
- For quiz session: store `quizId`, `attemptId`, `currentQuestion`, `score`
- Use WebSocket events to update UI in real-time
