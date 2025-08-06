import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";
import { format } from "date-fns";
import { TimesheetWithTasks } from "@shared/schema";

export default function PastTimesheetsPage() {
  const { user } = useAuth();
  
  const { data: timesheets, isLoading } = useQuery<TimesheetWithTasks[]>({
    queryKey: ["/api/timesheets"],
  });

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700";
      case "in-progress": return "bg-blue-100 text-blue-700";
      case "on-hold": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading timesheets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/" data-testid="button-back">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-primary" />
                <h1 className="text-xl font-semibold text-gray-900">Past Timesheets</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Welcome back, {user?.username}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!timesheets || timesheets.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No timesheets found</h3>
              <p className="text-gray-500">Start tracking your time to see your timesheets here.</p>
              <Button className="mt-4" asChild>
                <Link href="/" data-testid="button-start-tracking">
                  Start Tracking Time
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {timesheets.map((timesheet) => (
              <Card key={timesheet.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50 pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span data-testid={`text-date-${timesheet.id}`}>
                        {format(new Date(timesheet.date), "EEEE, MMMM do, yyyy")}
                      </span>
                    </CardTitle>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Total Hours</div>
                        <div className="text-xl font-bold text-gray-900" data-testid={`text-hours-${timesheet.id}`}>
                          {formatDuration(timesheet.totalHours)}
                        </div>
                      </div>
                      <Badge 
                        variant={timesheet.isSubmitted ? "default" : "secondary"}
                        className={timesheet.isSubmitted ? "bg-green-100 text-green-700" : ""}
                      >
                        {timesheet.isSubmitted ? (
                          <>
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </>
                        ) : (
                          "Draft"
                        )}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  {timesheet.tasks.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No tasks recorded for this date
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Task</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Time</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Duration</th>
                            <th className="text-left py-3 px-6 font-medium text-gray-700">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {timesheet.tasks.map((task) => {
                            const start = new Date(task.startTime);
                            const end = new Date(task.endTime);
                            const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
                            
                            return (
                              <tr key={task.id} className="hover:bg-gray-50" data-testid={`row-task-${task.id}`}>
                                <td className="py-4 px-6">
                                  <div className="font-medium text-gray-900">{task.name}</div>
                                  {task.description && (
                                    <div className="text-sm text-gray-500">{task.description}</div>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-gray-600">
                                  {format(start, "HH:mm")} - {format(end, "HH:mm")}
                                </td>
                                <td className="py-4 px-6 font-medium text-gray-900">
                                  {formatDuration(duration)}
                                </td>
                                <td className="py-4 px-6">
                                  <Badge 
                                    variant="outline"
                                    className={getStatusColor(task.status)}
                                  >
                                    {task.status === "completed" && "Completed"}
                                    {task.status === "in-progress" && "In Progress"}
                                    {task.status === "on-hold" && "On Hold"}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
