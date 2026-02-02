import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Auth() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleAuth = async (event: React.FormEvent<HTMLFormElement>, type: "login" | "signup") => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            if (type === "signup") {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                toast({
                    title: "Account created!",
                    description: "Please check your email to verify your account.",
                });
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                navigate("/");
                toast({
                    title: "Welcome back!",
                    description: "You have successfully signed in.",
                });
            }
        } catch (error: any) {
            toast({
                title: "Authentication Error",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 flex items-center justify-center px-4">
            <Card className="w-full max-w-md glass border-border/50 animate-fade-in-up">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Welcome to TalentSia</CardTitle>
                    <CardDescription>Sign in to account or create a new one</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="signup">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={(e) => handleAuth(e, "login")} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" name="password" type="password" required />
                                </div>
                                <Button className="w-full gradient-primary" type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Login"}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form onSubmit={(e) => handleAuth(e, "signup")} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="signup-email">Email</Label>
                                    <Input id="signup-email" name="email" type="email" placeholder="m@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="signup-password">Password</Label>
                                    <Input id="signup-password" name="password" type="password" required />
                                </div>
                                <Button className="w-full gradient-primary" type="submit" disabled={loading}>
                                    {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Create Account"}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
