import { login } from "@/lib/actions/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ message?: string }>;
}) {
    const params = await searchParams;
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <CardContent>
                    {params?.message && (
                        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-800 text-sm">
                            {params.message}
                        </div>
                    )}



                    {/* Email/Password Form */}
                    <form action={login} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full">Sign In</Button>
                    </form>
                </CardContent>
                <CardFooter className="justify-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account? <Link href="/auth/register" className="text-blue-600 hover:underline">Register</Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
