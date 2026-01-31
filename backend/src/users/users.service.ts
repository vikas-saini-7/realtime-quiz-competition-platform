import { Injectable, Inject } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE_CONNECTION, Database } from '../database';
import { users, User, NewUser } from '../database/schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly db: Database,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return result[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const result = await this.db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0] || null;
  }

  async create(userData: NewUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        ...userData,
        email: userData.email.toLowerCase(),
      })
      .returning();
    return result[0];
  }

  async findAll(): Promise<User[]> {
    return this.db.select().from(users);
  }

  async updateUser(id: string, data: Partial<NewUser>): Promise<User | null> {
    const result = await this.db
      .update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.db.delete(users).where(eq(users.id, id)).returning();
    return result.length > 0;
  }
}
