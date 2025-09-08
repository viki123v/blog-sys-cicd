import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@radix-ui/react-label";

const Login = () => {
	return (
		<main className="grid justify-items-center items-center w-screen h-screen">
			<div className="w-3/4 max-w-[453px]">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Welcome back</CardTitle>
						<CardDescription>Login with email & password</CardDescription>
					</CardHeader>
					<CardContent>
						<form>
							<div className="grid gap-6">
								<div className="grid gap-3">
									<Label htmlFor="email">Username</Label>
									<Input
										id="username"
										type="text"
										placeholder="user123"
										required
									/>
								</div>
								<div className="grid gap-3">
									<div className="flex items-center">
										<Label htmlFor="password">Password</Label>
									</div>
									<Input
										id="password"
										type="password"
										required
									/>
								</div>
								<Button
									type="submit"
									className="w-full"
								>
									Login
								</Button>
							</div>
						</form>
					</CardContent>
					<CardFooter className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<a
							href="#"
							className="underline underline-offset-4 ml-2"
						>
							Sign up
						</a>
					</CardFooter>
				</Card>
			</div>
		</main>
	);
};

export default Login;
