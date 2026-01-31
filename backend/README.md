# Realtime Quiz Competition Platform - Backend

A scalable backend for a real-time quiz/MCQ test platform built with NestJS, PostgreSQL (Neon DB), Drizzle ORM, and Socket.IO.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **PostgreSQL** - via Neon DB (serverless Postgres)
- **Drizzle ORM** - Type-safe SQL ORM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Socket.IO** - Real-time WebSocket communication
- **Redis** - Real-time state & leaderboard management
- **class-validator** - DTO validation

## Project Structure

```
src/
├── auth/               # Authentication module
│   ├── dto/
│   ├── guards/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/              # Users module
├── quizzes/            # Quiz management
├── questions/          # Question management
├── attempts/           # User quiz attempts
├── answers/            # Answer tracking
├── leaderboard/        # Leaderboard service
├── realtime/           # WebSocket gateway
│   ├── quiz.gateway.ts
│   ├── quiz-state.service.ts
│   └── realtime.module.ts
├── database/           # Database configuration
│   ├── schema/         # Drizzle schemas
│   ├── neon.client.ts
│   └── database.module.ts
├── redis/              # Redis configuration
├── common/             # Shared utilities
│   ├── decorators/
│   ├── filters/
│   └── interceptors/
├── app.module.ts
└── main.ts
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` - Neon DB connection string
- `JWT_SECRET` - Secret for JWT signing
- `REDIS_URL` - Redis/Upstash connection string

### 3. Database Migration

```bash
# Generate migrations
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Run the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Quizzes (HOST only for mutations)

- `POST /api/quizzes` - Create quiz
- `GET /api/quizzes` - Get all quizzes
- `GET /api/quizzes/my-quizzes` - Get host's quizzes
- `GET /api/quizzes/live` - Get live quizzes
- `GET /api/quizzes/:id` - Get quiz by ID
- `PUT /api/quizzes/:id` - Update quiz
- `DELETE /api/quizzes/:id` - Delete quiz

### Questions (HOST only)

- `POST /api/questions` - Create question
- `POST /api/questions/bulk` - Create multiple questions
- `GET /api/questions/quiz/:quizId` - Get questions for quiz
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Leaderboard

- `GET /api/leaderboard/:quizId` - Get quiz leaderboard
- `GET /api/leaderboard/:quizId/my-position` - Get user's position

## WebSocket Events

### Connection

Connect to `/quiz` namespace with JWT token:

```javascript
const socket = io('http://localhost:3000/quiz', {
  auth: { token: 'your-jwt-token' },
});
```

### Host Events

| Event                | Payload      | Description              |
| -------------------- | ------------ | ------------------------ |
| `host:initialize`    | `{ quizId }` | Initialize quiz session  |
| `host:start`         | `{ quizId }` | Start the quiz           |
| `host:next-question` | `{ quizId }` | Advance to next question |
| `host:end-quiz`      | `{ quizId }` | End the quiz             |

### Participant Events

| Event                | Payload                                  | Description    |
| -------------------- | ---------------------------------------- | -------------- |
| `participant:join`   | `{ quizId }`                             | Join a quiz    |
| `participant:answer` | `{ quizId, questionId, selectedOption }` | Submit answer  |
| `participant:leave`  | `{ quizId }`                             | Leave the quiz |

### Shared Events

| Event             | Payload              | Description     |
| ----------------- | -------------------- | --------------- |
| `leaderboard:get` | `{ quizId, limit? }` | Get leaderboard |

### Server Events (Listen)

| Event                 | Description                            |
| --------------------- | -------------------------------------- |
| `quiz:started`        | Quiz has started                       |
| `quiz:question`       | New question received                  |
| `quiz:question-ended` | Question time up, shows correct answer |
| `quiz:ended`          | Quiz finished with final results       |
| `participant:joined`  | New participant joined                 |
| `participant:left`    | Participant left                       |
| `answer:received`     | Answer was received and scored         |

## Scoring System

- **Base Score**: Defined per question (default: 100 points)
- **Speed Bonus**: `remainingTime × 2` additional points for correct answers
- **Negative Marking**: Deducted points for wrong answers (default: 25 points)

Formula: `Score = BaseScore + (RemainingSeconds × SpeedMultiplier)`

## Architecture Decisions

1. **Feature-based modules**: Each feature is self-contained with its own controller, service, and DTOs.

2. **Redis for real-time state**: Quiz state, active users, and leaderboards are stored in Redis for fast access and horizontal scalability.

3. **Drizzle ORM**: Type-safe database operations with PostgreSQL, supporting schema-first development.

4. **WebSocket + JWT**: Same JWT strategy for HTTP and WebSocket authentication.

5. **Separation of concerns**: Controllers handle HTTP, services contain business logic, gateways handle WebSocket.

## Scaling Considerations

- Redis adapter for Socket.IO enables multiple instances
- Neon DB provides serverless scaling
- Stateless authentication with JWT
- Leaderboard uses Redis sorted sets for O(log N) operations
