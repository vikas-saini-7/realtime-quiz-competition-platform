You are a senior backend engineer designing a scalable backend for a REAL-TIME QUIZ / MCQ TEST PLATFORM (like Kahoot).

The backend must be production-ready, scalable, and cleanly architected.

========================
TECH STACK (MANDATORY)
========================
- NestJS (TypeScript)
- PostgreSQL (Neon DB – serverless Postgres)
- Drizzle ORM (with schema-first approach)
- JWT Authentication
- bcrypt for password hashing
- Socket.io (NestJS WebSocket Gateway)
- Redis (Upstash or equivalent) for realtime state & leaderboard
- Zod or class-validator for validation

========================
PRODUCT REQUIREMENTS
========================
The platform allows:
- Hosts to create quizzes (MCQ based)
- Users to join quizzes via link or QR
- Real-time quiz execution
- One question at a time
- Speed-based scoring (faster = more points)
- Negative marking for wrong answers
- Live leaderboard
- Final results broadcasted to users

========================
ROLES
========================
- HOST
- USER

========================
DATABASE (DRIZZLE + NEON)
========================
Design Drizzle schemas with proper relations and indexes.

Entities required:

1. users
- id (uuid, primary key)
- name
- email (unique, indexed)
- password_hash
- role (enum: HOST | USER)
- created_at

2. quizzes
- id
- title
- description
- host_id (FK → users.id)
- status (enum: DRAFT | SCHEDULED | LIVE | COMPLETED)
- scheduled_at
- created_at

3. questions
- id
- quiz_id (FK)
- question_text
- option_a
- option_b
- option_c
- option_d
- correct_option
- time_limit (seconds)
- base_score
- negative_score
- order_index

4. attempts
- id
- quiz_id
- user_id
- total_score
- joined_at
- completed_at

5. answers
- id
- attempt_id
- question_id
- selected_option
- is_correct
- time_taken
- score_awarded

Use:
- drizzle-orm
- drizzle-kit
- neon-serverless driver
- Proper foreign keys
- Index frequently queried columns

========================
AUTHENTICATION
========================
Implement JWT-based authentication with:
- Register
- Login
- Get current user
- Role-based guards (HOST / USER)
- Password hashing using bcrypt
- JWT strategy usable for HTTP and WebSocket connections

Auth APIs:
- POST /auth/register
- POST /auth/login
- GET /auth/me

========================
REALTIME (WEBSOCKETS)
========================
Create a NestJS WebSocket Gateway:

QuizGateway responsibilities:
- authenticate socket connection
- join quiz room (quiz:{quizId})
- track joined users
- allow HOST to start quiz
- broadcast questions one by one
- receive answers
- calculate score using:
  score = baseScore + (remainingTime * multiplier)
- apply negative marking
- update Redis leaderboard
- broadcast leaderboard updates
- end quiz and persist results

Redis should store:
- active quiz users
- current question index
- timers
- live leaderboard

========================
MODULE STRUCTURE
========================
Use feature-based NestJS modules:

src/
 ├── auth/
 ├── users/
 ├── quizzes/
 ├── questions/
 ├── attempts/
 ├── answers/
 ├── realtime/
 ├── leaderboard/
 ├── database/
 │    ├── drizzle.config.ts
 │    ├── schema/
 │    └── neon.client.ts
 ├── redis/
 ├── common/
 └── main.ts

Each module must contain:
- controller
- service
- dto
- guards (if needed)

========================
CODING RULES
========================
- No business logic in controllers
- Use DTOs with validation
- Strong typing everywhere
- Environment-based config
- Clean error handling
- Write real code (no pseudocode)

========================
OUTPUT EXPECTATION
========================
Generate:
1. Drizzle schema files
2. Neon DB connection setup
3. Auth module (controller, service, guards)
4. User module
5. Quiz module skeleton
6. WebSocket gateway skeleton
7. Redis integration
8. Folder structure
9. Example .env variables
10. main.ts bootstrap code

Explain briefly why key architectural decisions were made.

Assume this system will scale to 100k+ concurrent users.
