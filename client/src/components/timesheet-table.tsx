import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Edit, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Task } from "@shared/schema";
import { useState } from "react";

export function TimesheetTable() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { data: timesheetData, isLoading } = useQuery<{
    timesheet: any;
    tasks: Task[];
  }>({
    queryKey: ["/api/timesheets", today],
  });

  const submitTimesheetMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/timesheets/${today}/submit`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets", today] });
      toast({
        title: "Timesheet submitted",
        description: "Your timesheet has been submitted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit timesheet",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({
        title: "Task deleted",
        description: "The task has been removed from your timesheet.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const res = await apiRequest("PUT", `/api/tasks/${taskId}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/timesheets", today] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setEditingTask(null);
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditTask = (updates: any) => {
    if (!editingTask) return;
    
    // Convert time strings to ISO format
    const updatedData: any = { ...updates };
    if (updates.startTime) {
      updatedData.startTime = new Date(`${today}T${updates.startTime}:00`).toISOString();
    }
    if (updates.endTime) {
      updatedData.endTime = new Date(`${today}T${updates.endTime}:00`).toISOString();
    }
    
    updateTaskMutation.mutate({
      taskId: editingTask.id,
      updates: updatedData,
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-700">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>;
      case "on-hold":
        return <Badge className="bg-yellow-100 text-yellow-700">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const { timesheet, tasks = [] } = timesheetData || {};
  const totalMinutes = tasks.reduce((sum, task) => {
    const start = new Date(task.startTime);
    const end = new Date(task.endTime);
    return sum + (end.getTime() - start.getTime()) / (1000 * 60);
  }, 0);
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const isSubmitted = timesheet?.isSubmitted;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <span>Today's Timesheet</span>
              <p className="text-sm font-normal text-gray-500">
                {format(new Date(), "EEEE, MMMM do, yyyy")}
              </p>
            </div>
          </CardTitle>
          
          <div className="flex items-center space-x-3">
            <Badge 
              variant={isSubmitted ? "default" : "outline"}
              className={isSubmitted ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}
            >
              {isSubmitted ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Submitted
                </>
              ) : (
                <>
                  <Edit className="h-3 w-3 mr-1" />
                  Editable
                </>
              )}
            </Badge>
            
            {!isSubmitted && tasks.length > 0 && (
              <Button 
                onClick={() => submitTimesheetMutation.mutate()}
                disabled={submitTimesheetMutation.isPending}
                data-testid="button-submit-timesheet"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Submit Day
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks logged today</h3>
            <p className="text-gray-500">Start by adding your first task using the form on the left.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Task</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Start Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">End Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Duration</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {tasks.map((task) => {
                    const start = new Date(task.startTime);
                    const end = new Date(task.endTime);
                    
                    return (
                      <tr key={task.id} className="hover:bg-gray-50" data-testid={`row-task-${task.id}`}>
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{task.name}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500">{task.description}</div>
                          )}
                        </td>
                        <td className="py-4 px-4 text-gray-600">{format(start, "HH:mm")}</td>
                        <td className="py-4 px-4 text-gray-600">{format(end, "HH:mm")}</td>
                        <td className="py-4 px-4 font-medium text-gray-900">
                          {formatDuration(start, end)}
                        </td>
                        <td className="py-4 px-4">
                          {getStatusBadge(task.status)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            {!isSubmitted && (
                              <>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setEditingTask(task)}
                                      data-testid={`button-edit-${task.id}`}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Edit Task</DialogTitle>
                                    </DialogHeader>
                                    <EditTaskForm 
                                      task={task} 
                                      onSave={handleEditTask}
                                      isLoading={updateTaskMutation.isPending}
                                    />
                                  </DialogContent>
                                </Dialog>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteTaskMutation.mutate(task.id)}
                                  disabled={deleteTaskMutation.isPending}
                                  data-testid={`button-delete-${task.id}`}
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Daily Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Total Hours Today:</span>
                  <span className="ml-2 text-lg font-bold text-gray-900" data-testid="text-total-hours">
                    {Math.round(totalMinutes / 60 * 10) / 10}h
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Tasks Completed:</span>
                  <span className="ml-2 text-lg font-bold text-green-600" data-testid="text-completed-tasks">
                    {completedTasks}/{tasks.length}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Edit Task Form Component
function EditTaskForm({ 
  task, 
  onSave, 
  isLoading 
}: { 
  task: Task; 
  onSave: (updates: any) => void;
  isLoading: boolean;
}) {
  const [formData, setFormData] = useState({
    name: task.name,
    description: task.description || "",
    startTime: format(new Date(task.startTime), "HH:mm"),
    endTime: format(new Date(task.endTime), "HH:mm"),
    status: task.status,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="edit-name">Task Name</Label>
        <Input
          id="edit-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          data-testid="input-edit-name"
        />
      </div>
      
      <div>
        <Label htmlFor="edit-description">Description</Label>
        <Input
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          data-testid="input-edit-description"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-start">Start Time</Label>
          <Input
            id="edit-start"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            data-testid="input-edit-start-time"
          />
        </div>
        <div>
          <Label htmlFor="edit-end">End Time</Label>
          <Input
            id="edit-end"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            data-testid="input-edit-end-time"
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="edit-status">Status</Label>
        <Select value={formData.status} onValueChange={(value: "completed" | "in-progress" | "on-hold") => setFormData({ ...formData, status: value })}>
          <SelectTrigger data-testid="select-edit-status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button type="submit" disabled={isLoading} data-testid="button-save-edit">
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
