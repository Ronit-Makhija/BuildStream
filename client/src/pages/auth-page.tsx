import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Loader2, Clock, CheckCircle, Users, BarChart3 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = insertUserSchema.pick({ username: true, password: true });
type LoginForm = z.infer<typeof loginSchema>;

const registerSchema = insertUserSchema.extend({
  role: z.enum(["employee", "admin"]).optional().default("employee"),
});
type RegisterForm = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("login");

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", role: "employee" },
  });

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => navigate("/"),
    });
  };

  const onRegister = (data: RegisterForm) => {
    registerMutation.mutate(data, {
      onSuccess: () => navigate("/"),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex min-h-screen">
        {/* Left side - Forms */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">TimeTracker Pro</h1>
              <p className="text-gray-600 mt-2">Professional Timesheet Management</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome back</CardTitle>
                    <CardDescription>
                      Sign in to your account to continue
                    </CardDescription>
                  </CardHeader>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLogin)}>
                      <CardContent className="space-y-4">
                        <FormField
                          control={loginForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your username" 
                                  data-testid="input-username"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={loginForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Enter your password"
                                  data-testid="input-password"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loginMutation.isPending}
                          data-testid="button-login"
                        >
                          {loginMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            "Sign In"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create account</CardTitle>
                    <CardDescription>
                      Create a new account to get started
                    </CardDescription>
                  </CardHeader>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)}>
                      <CardContent className="space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="username"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Username</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Choose a username"
                                  data-testid="input-register-username"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="Choose a password"
                                  data-testid="input-register-password"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={registerForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger data-testid="select-role">
                                    <SelectValue placeholder="Select your role" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="employee">Employee</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                      <CardFooter>
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={registerMutation.isPending}
                          data-testid="button-register"
                        >
                          {registerMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </CardFooter>
                    </form>
                  </Form>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right side - Hero */}
        <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12 relative overflow-hidden">
          <div className="text-center text-white max-w-md">
            <h2 className="text-4xl font-bold mb-6">Track Time. Boost Productivity.</h2>
            <p className="text-xl mb-8 text-blue-100">
              The professional timesheet solution for modern teams
            </p>
            
            <div className="grid grid-cols-1 gap-6 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-300" />
                <span className="text-blue-100">Real-time task tracking</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-green-300" />
                <span className="text-blue-100">Team collaboration</span>
              </div>
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-green-300" />
                <span className="text-blue-100">Detailed analytics</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="h-6 w-6 text-green-300" />
                <span className="text-blue-100">Easy timesheet management</span>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
        </div>
      </div>
    </div>
  );
}
