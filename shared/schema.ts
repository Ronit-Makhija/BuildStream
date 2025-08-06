import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum("role", ["employee", "admin"]);
export const statusEnum = pgEnum("status", ["completed", "in-progress", "on-hold"]);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").default("employee").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  status: statusEnum("status").default("completed").notNull(),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const timesheets = pgTable("timesheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  totalHours: integer("total_hours").notNull(), // in minutes
  isSubmitted: boolean("is_submitted").default(false).notNull(),
  submittedAt: timestamp("submitted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
  timesheets: many(timesheets),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
}));

export const timesheetsRelations = relations(timesheets, ({ one }) => ({
  user: one(users, {
    fields: [timesheets.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Task name is required"),
  startTime: z.string().transform((str) => new Date(str)),
  endTime: z.string().transform((str) => new Date(str)),
});

export const insertTimesheetSchema = createInsertSchema(timesheets).omit({
  id: true,
  userId: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTimesheet = z.infer<typeof insertTimesheetSchema>;
export type Timesheet = typeof timesheets.$inferSelect;

// Combined types for API responses
export type TaskWithUser = Task & {
  user: User;
};

export type TimesheetWithTasks = Timesheet & {
  tasks: Task[];
};
