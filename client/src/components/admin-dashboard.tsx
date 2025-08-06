import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Download, BarChart3 } from "lucide-react";
import { useState } from "react";
import { TimesheetWithTasks } from "@shared/schema";

interface UserStats {
  id: string;
  username: string;
  role: string;
  todayHours: number;
  tasksToday: number;
  completedTasks: number;
  isActive: boolean;
}

export function AdminDashboard() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const { data: users, isLoading } = useQuery<UserStats[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: userTimesheets } = useQuery<TimesheetWithTasks[]>({
    queryKey: ["/api/admin/users", selectedUserId, "timesheets"],
    enabled: !!selectedUserId,
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-gray-400";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <span>Admin Dashboard</span>
              <p className="text-sm font-normal text-gray-500">
                Real-time team activity overview
              </p>
            </div>
          </CardTitle>
          
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!users || users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No team members found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <Card key={user.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-semibold text-sm">
                          {getInitials(user.username)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900" data-testid={`text-user-name-${user.id}`}>
                          {user.username}
                        </h3>
                        <p className="text-sm text-gray-500 capitalize">{user.role}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(user.isActive)}`} title={user.isActive ? "Online" : "Offline"}></div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Today's Hours:</span>
                      <span className="font-medium text-gray-900" data-testid={`text-user-hours-${user.id}`}>
                        {user.todayHours}h
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tasks Today:</span>
                      <span className="font-medium text-gray-900" data-testid={`text-user-tasks-${user.id}`}>
                        {user.tasksToday}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Current Status:</span>
                      <Badge 
                        variant={user.isActive ? "default" : "secondary"}
                        className={user.isActive ? "bg-green-100 text-green-700" : ""}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="w-full mt-3 text-primary hover:text-primary-foreground"
                        onClick={() => setSelectedUserId(user.id)}
                        data-testid={`button-view-details-${user.id}`}
                      >
                        View Details →
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>
                          {user.username}'s Timesheet History
                        </DialogTitle>
                      </DialogHeader>
                      <UserTimesheetDetails 
                        timesheets={userTimesheets || []} 
                        userName={user.username}
                      />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// User Timesheet Details Component
function UserTimesheetDetails({ 
  timesheets, 
  userName 
}: { 
  timesheets: TimesheetWithTasks[];
  userName: string;
}) {
  const formatDuration = (minutes: number) => {
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

  if (timesheets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No timesheet data available for {userName}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timesheets.map((timesheet) => (
        <Card key={timesheet.id}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {new Date(timesheet.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardTitle>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Total: <span className="font-bold">{formatDuration(timesheet.totalHours)}</span>
                </span>
                <Badge variant={timesheet.isSubmitted ? "default" : "secondary"}>
                  {timesheet.isSubmitted ? "Submitted" : "Draft"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            {timesheet.tasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No tasks recorded</p>
            ) : (
              <div className="space-y-2">
                {timesheet.tasks.map((task) => {
                  const start = new Date(task.startTime);
                  const end = new Date(task.endTime);
                  const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                  
                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{task.name}</div>
                        {task.description && (
                          <div className="text-sm text-gray-500">{task.description}</div>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{start.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} - {end.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="font-medium">{formatDuration(duration)}</span>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
