import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Label } from "@radix-ui/react-label";
import {
	Form,
	redirect,
	type ActionFunctionArgs,
} from "react-router";
import {
	API_HOST,
	hasResponseError as isFailedResponse,
	type ApiResponse,
	type JwtBearerResponse,
} from "@shared/api-types";
import { processUserRegisterFormData } from "@shared/formProcessing";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import createErrorBoundaryForUesrInfo from "@shared/user-info-exception-handler";

type RegisterProps = {
	errorMsg?: string;
};

const checkIfPasswordsMatch = (data: FormData) => {
	const areMatch = data.get("password") === data.get("retype-password");
	if (!areMatch) throw new Error("Passwords do not match");
};

const getUserImage = (): File => {
	const fileInput = document.querySelector("#logo") as HTMLInputElement;
	return (fileInput!.files as FileList)[0];
};

const createRegistrationMultipartRequest = (
	userInfo: Record<string, string>,
): Request => {
	const multipartFormData = new FormData();
	const userInfoBlob = new Blob([JSON.stringify(userInfo)], {
		type: "application/json",
	});

	multipartFormData.append("icon", getUserImage());
	multipartFormData.append("user", userInfoBlob);

	return new Request(`${API_HOST}/register/file`, {
		method: "POST",
		body: multipartFormData,
	});
};


export async function clientAction({ request }: ActionFunctionArgs) {
	const rawUserData = await request.formData();

	checkIfPasswordsMatch(rawUserData);
	
	const [userInfo, userFile] = processUserRegisterFormData(rawUserData,['logo'],['retype-password']);

	let apiRegisterUserRequest: undefined | Request = undefined;

	if (userFile) {
		apiRegisterUserRequest = createRegistrationMultipartRequest(userInfo);
	} else {
		apiRegisterUserRequest = new Request(`${API_HOST}/register`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(userInfo),
		});
	}

	const response = await fetch(apiRegisterUserRequest);
	const responseData: ApiResponse<JwtBearerResponse> = await response.json();

	if (isFailedResponse(response, responseData)) {
		throw new Error(responseData.message);
	}

	localStorage.setItem("jwt", responseData.bearer);

	return redirect("/");
}

const Register = ({ errorMsg }: RegisterProps) => {
	return (
		<main className="grid justify-items-center items-center w-screen h-screen">
			<div className="w-3/4 max-w-[453px]">
				<Card>
					<CardHeader className="text-center">
						<CardTitle className="text-xl">Welcome newcomer</CardTitle>
						<CardDescription>Plase provide all the information</CardDescription>
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
							<div className="grid gap-6 grid-cols-2 ">
								<div className="grid gap-3 col-span-2">
									<Label htmlFor="email">Username</Label>
									<Input
										id="username"
										name="username"
										type="text"
										placeholder="user123"
										required
									/>
								</div>
								<div className="grid gap-3">
									<Label htmlFor="password">Password</Label>
									<Input
										id="password"
										name="password"
										type="password"
										required
									/>
								</div>
								<div className="grid gap-3">
									<Label htmlFor="retype-password">Retype password</Label>
									<Input
										id="retype-password"
										name="retype-password"
										type="password"
										required
									/>
								</div>
								<div className="col-span-2">
									<Label htmlFor="logo">Logo</Label>
									<Input
										id="logo"
										name="logo"
										type="file"
										accept="image/*"
									/>
								</div>
								<Button
									type="submit"
									className="w-full col-span-2 cursor-pointer"
								>
									Register
								</Button>
							</div>
						</Form>
					</CardContent>
				</Card>
			</div>
		</main>
	);
};

export const ErrorBoundary = createErrorBoundaryForUesrInfo(Register)
export default Register;
