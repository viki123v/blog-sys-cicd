import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
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
import { API_HOST, hasResponseError, type ApiResponse, type JwtBearerResponse } from "@shared/api-types";
import { processTextForm } from "@shared/formProcessing";
import createErrorBoundaryForUesrInfo from "@shared/user-info-exception-handler";
import { Form, redirect, type ActionFunctionArgs } from "react-router";

type LoginProps = { 
	errorMsg? : string 
}

export async function clientAction({request}: ActionFunctionArgs){
	const rawFormData = await request.formData()
	const processedData = processTextForm(rawFormData)
	const repsonse = await fetch(API_HOST + "/login", {
		headers:{
			"Content-Type": "application/json",
		},
		method:"POST", 
		body: JSON.stringify(processedData)
	})
	const dataRepsonse:ApiResponse<JwtBearerResponse> = await repsonse.json() 

	if(hasResponseError(repsonse, dataRepsonse)){
		throw new Error(dataRepsonse.message)
	}

	localStorage.setItem("jwt", dataRepsonse.bearer)
	return redirect("/")
}

const Login = ({errorMsg}:LoginProps) => {
	return (
		<main className="grid justify-items-center items-center w-screen h-screen">
			<div className="w-3/4 max-w-[453px]">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Welcome back</CardTitle>
						<CardDescription>Login with email & password</CardDescription>
						{errorMsg && (
							<Alert className="bg-red-500 text-whitem my-2">
								<AlertTitle className="text-start text-lg">Error</AlertTitle>
								<AlertDescription className="text-white">
									{errorMsg}
								</AlertDescription>
							</Alert>
						)}
					</CardHeader>
					<CardContent>
						<Form method="post">
							<div className="grid gap-6">
								<div className="grid gap-3">
									<Label htmlFor="email">Username</Label>
									<Input
										id="username"
										type="text"
										name="username"
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
										name="password"
										required
									/>
								</div>
								<Button
									type="submit"
									className="w-full cursor-pointer"
								>
									Login
								</Button>
							</div>
						</Form>
					</CardContent>
					<CardFooter className="text-center text-sm">
						Don&apos;t have an account?{" "}
						<a
							href="/register"
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

export const ErrorBoundary = createErrorBoundaryForUesrInfo(Login)
export default Login;
