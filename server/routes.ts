import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Task routes
  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(req.user!.id, taskData);
      
      // Calculate total hours for the day
      const date = taskData.date;
      const dayTasks = await storage.getTasksByUserAndDate(req.user!.id, date);
      const totalMinutes = dayTasks.reduce((sum, t) => {
        const start = new Date(t.startTime);
        const end = new Date(t.endTime);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);
      
      // Update timesheet
      await storage.createOrUpdateTimesheet(req.user!.id, date, totalMinutes);
      
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid task data' });
    }
  });

  app.get("/api/tasks/:date", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { date } = req.params;
    const tasks = await storage.getTasksByUserAndDate(req.user!.id, date);
    res.json(tasks);
  });

  app.put("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { id } = req.params;
      const task = await storage.getTaskById(id);
      
      if (!task || task.userId !== req.user!.id) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Check if timesheet is already submitted
      const timesheet = await storage.getTimesheetByUserAndDate(req.user!.id, task.date);
      if (timesheet?.isSubmitted) {
        return res.status(400).json({ error: 'Cannot edit tasks after timesheet submission' });
      }

      const updates = insertTaskSchema.partial().parse(req.body);
      const updatedTask = await storage.updateTask(id, updates);
      
      // Recalculate total hours for the day
      const dayTasks = await storage.getTasksByUserAndDate(req.user!.id, task.date);
      const totalMinutes = dayTasks.reduce((sum, t) => {
        const start = new Date(t.startTime);
        const end = new Date(t.endTime);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60);
      }, 0);
      
      await storage.createOrUpdateTimesheet(req.user!.id, task.date, totalMinutes);
      
      res.json(updatedTask);
    } catch (error) {
      res.status(400).json({ error: error instanceof Error ? error.message : 'Invalid update data' });
    }
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { id } = req.params;
    const task = await storage.getTaskById(id);
    
    if (!task || task.userId !== req.user!.id) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Check if timesheet is already submitted
    const timesheet = await storage.getTimesheetByUserAndDate(req.user!.id, task.date);
    if (timesheet?.isSubmitted) {
      return res.status(400).json({ error: 'Cannot delete tasks after timesheet submission' });
    }

    await storage.deleteTask(id);
    
    // Recalculate total hours for the day
    const dayTasks = await storage.getTasksByUserAndDate(req.user!.id, task.date);
    const totalMinutes = dayTasks.reduce((sum, t) => {
      const start = new Date(t.startTime);
      const end = new Date(t.endTime);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);
    
    await storage.createOrUpdateTimesheet(req.user!.id, task.date, totalMinutes);
    
    res.sendStatus(204);
  });

  // Timesheet routes
  app.get("/api/timesheets", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const timesheets = await storage.getTimesheetsByUser(req.user!.id);
    res.json(timesheets);
  });

  app.get("/api/timesheets/:date", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { date } = req.params;
    const timesheet = await storage.getTimesheetByUserAndDate(req.user!.id, date);
    const tasks = await storage.getTasksByUserAndDate(req.user!.id, date);
    
    res.json({
      timesheet,
      tasks,
    });
  });

  app.post("/api/timesheets/:date/submit", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const { date } = req.params;
    const timesheet = await storage.getTimesheetByUserAndDate(req.user!.id, date);
    
    if (!timesheet) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    if (timesheet.isSubmitted) {
      return res.status(400).json({ error: 'Timesheet already submitted' });
    }

    const submitted = await storage.submitTimesheet(timesheet.id);
    res.json(submitted);
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(403);
    }
    
    const users = await storage.getAllUsersWithTodayStats();
    res.json(users);
  });

  app.get("/api/admin/users/:userId/timesheets", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.role !== 'admin') {
      return res.sendStatus(403);
    }
    
    const { userId } = req.params;
    const timesheets = await storage.getTimesheetsByUser(userId);
    res.json(timesheets);
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = await storage.getTasksByUserAndDate(req.user!.id, today);
    
    // Calculate today's hours
    const todayMinutes = todayTasks.reduce((sum, task) => {
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0);

    // Calculate week's hours (last 7 days)
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 6);
    const timesheets = await storage.getTimesheetsByUser(req.user!.id, 7);
    const weekMinutes = timesheets
      .filter(ts => ts.date >= weekStart.toISOString().split('T')[0])
      .reduce((sum, ts) => sum + ts.totalHours, 0);

    const completedTasks = todayTasks.filter(t => t.status === 'completed').length;

    res.json({
      todayHours: Math.round(todayMinutes / 60 * 10) / 10,
      weekHours: Math.round(weekMinutes / 60 * 10) / 10,
      tasksToday: todayTasks.length,
      completedTasks,
      status: todayTasks.length > 0 ? 'Active' : 'Inactive'
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
