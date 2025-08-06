import { users, tasks, timesheets, type User, type InsertUser, type Task, type InsertTask, type Timesheet, type InsertTimesheet, type TaskWithUser, type TimesheetWithTasks } from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gte, between } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createTask(userId: string, task: InsertTask): Promise<Task>;
  getTasksByUserAndDate(userId: string, date: string): Promise<Task[]>;
  getTaskById(taskId: string): Promise<Task | undefined>;
  updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(taskId: string): Promise<void>;
  
  createOrUpdateTimesheet(userId: string, date: string, totalHours: number): Promise<Timesheet>;
  getTimesheetByUserAndDate(userId: string, date: string): Promise<Timesheet | undefined>;
  getTimesheetsByUser(userId: string, limit?: number): Promise<TimesheetWithTasks[]>;
  submitTimesheet(timesheetId: string): Promise<Timesheet | undefined>;
  
  getAllUsersWithTodayStats(): Promise<any[]>;
  
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const [createdTask] = await db
      .insert(tasks)
      .values({ ...task, userId })
      .returning();
    return createdTask;
  }

  async getTasksByUserAndDate(userId: string, date: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.date, date)))
      .orderBy(tasks.startTime);
  }

  async getTaskById(taskId: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    return task || undefined;
  }

  async updateTask(taskId: string, updates: Partial<InsertTask>): Promise<Task | undefined> {
    const [updatedTask] = await db
      .update(tasks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tasks.id, taskId))
      .returning();
    return updatedTask || undefined;
  }

  async deleteTask(taskId: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, taskId));
  }

  async createOrUpdateTimesheet(userId: string, date: string, totalHours: number): Promise<Timesheet> {
    const existing = await this.getTimesheetByUserAndDate(userId, date);
    
    if (existing) {
      const [updated] = await db
        .update(timesheets)
        .set({ totalHours })
        .where(eq(timesheets.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(timesheets)
        .values({ userId, date, totalHours })
        .returning();
      return created;
    }
  }

  async getTimesheetByUserAndDate(userId: string, date: string): Promise<Timesheet | undefined> {
    const [timesheet] = await db
      .select()
      .from(timesheets)
      .where(and(eq(timesheets.userId, userId), eq(timesheets.date, date)));
    return timesheet || undefined;
  }

  async getTimesheetsByUser(userId: string, limit: number = 30): Promise<TimesheetWithTasks[]> {
    const userTimesheets = await db
      .select()
      .from(timesheets)
      .where(eq(timesheets.userId, userId))
      .orderBy(desc(timesheets.date))
      .limit(limit);

    const timesheetsWithTasks = await Promise.all(
      userTimesheets.map(async (timesheet) => {
        const timesheetTasks = await this.getTasksByUserAndDate(userId, timesheet.date);
        return { ...timesheet, tasks: timesheetTasks };
      })
    );

    return timesheetsWithTasks;
  }

  async submitTimesheet(timesheetId: string): Promise<Timesheet | undefined> {
    const [submitted] = await db
      .update(timesheets)
      .set({ isSubmitted: true, submittedAt: new Date() })
      .where(eq(timesheets.id, timesheetId))
      .returning();
    return submitted || undefined;
  }

  async getAllUsersWithTodayStats(): Promise<any[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const allUsers = await db.select().from(users).where(eq(users.role, 'employee'));
    
    const usersWithStats = await Promise.all(
      allUsers.map(async (user) => {
        const todayTasks = await this.getTasksByUserAndDate(user.id, today);
        const totalMinutes = todayTasks.reduce((sum, task) => {
          const start = new Date(task.startTime);
          const end = new Date(task.endTime);
          return sum + (end.getTime() - start.getTime()) / (1000 * 60);
        }, 0);
        
        return {
          ...user,
          todayHours: Math.round(totalMinutes / 60 * 10) / 10,
          tasksToday: todayTasks.length,
          completedTasks: todayTasks.filter(t => t.status === 'completed').length,
          isActive: todayTasks.length > 0,
        };
      })
    );

    return usersWithStats;
  }
}

export const storage = new DatabaseStorage();
