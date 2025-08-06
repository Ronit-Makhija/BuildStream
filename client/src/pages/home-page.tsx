import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Link } from "wouter";
import { StatsCards } from "@/components/stats-cards";
import { TaskEntryForm } from "@/components/task-entry-form";
import { TimesheetTable } from "@/components/timesheet-table";
import { AdminDashboard } from "@/components/admin-dashboard";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">TimeTracker Pro</h1>
                <p className="text-sm text-gray-500">Professional Timesheet Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span data-testid="text-username">{user?.username}</span>
                <span className="text-gray-400">|</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  user?.role === 'admin' 
                    ? 'bg-red-100 text-red-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {user?.role === 'admin' ? 'Admin' : 'Employee'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards />
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Task Entry Form */}
          <div className="lg:col-span-1">
            <TaskEntryForm />
            
            {/* Quick Actions */}
            <div className="mt-6 space-y-3">
              <Button 
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/" data-testid="button-view-today">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  View Today's Timesheet
                </Link>
              </Button>
              
              <Button 
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/past-timesheets" data-testid="button-view-past">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  View Past Timesheets
                </Link>
              </Button>
            </div>
          </div>
          
          {/* Today's Timesheet */}
          <div className="lg:col-span-2">
            <TimesheetTable />
          </div>
        </div>
        
        {/* Admin Dashboard */}
        {user?.role === 'admin' && (
          <div className="mt-8">
            <AdminDashboard />
          </div>
        )}
      </div>
    </div>
  );
}
