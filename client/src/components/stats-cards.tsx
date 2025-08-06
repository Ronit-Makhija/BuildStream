import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Calendar, CheckCircle, Activity } from "lucide-react";

interface Stats {
  todayHours: number;
  weekHours: number;
  tasksToday: number;
  completedTasks: number;
  status: string;
}

export function StatsCards() {
  const { data: stats, isLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const { 
    todayHours = 0, 
    weekHours = 0, 
    tasksToday = 0, 
    completedTasks = 0, 
    status = "Inactive" 
  } = stats || {};

  const getStatusColor = (status: string) => {
    return status === "Active" ? "text-green-600" : "text-gray-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Hours</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="stat-today-hours">
                {todayHours}h
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="stat-week-hours">
                {weekHours}h
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasks Today</p>
              <p className="text-2xl font-bold text-gray-900" data-testid="stat-tasks-today">
                {tasksToday}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={`text-lg font-semibold ${getStatusColor(status)}`} data-testid="stat-status">
                {status}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className={`h-6 w-6 ${status === "Active" ? "text-green-600" : "text-gray-600"}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
