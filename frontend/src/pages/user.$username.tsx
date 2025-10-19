import { User as UserIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { Label } from "@radix-ui/react-label";
import { Input } from "@components/ui/input";
import { cn } from "@lib/utils";
import { Form, redirect, useLoaderData } from "react-router";
import { Button } from "@components/ui/button";
import { useState } from "react";
import type { Route } from "./+types/user.$username";
import { loadUserFromJWT } from "@shared/security-utils";
import {
	API_HOST,
	hasResponseError,
	type ApiResponse,
	type JwtBearerResponse,
} from "@shared/api-types";
import Header from "@components/shared/Header";

type UserInfo = {
	username: string;
	logo: string | undefined;
	created_at: string;
	blog_count: number;
};

export async function clientLoader({
	params,
}: Route.ClientLoaderArgs): Promise<UserInfo> {
	const reqeust = await fetch(
		`${API_HOST}/users?username=${encodeURIComponent(params.username ?? "")}`,
		{
			headers: {
				Authorization: `Bearer ${localStorage.getItem("jwt") ?? ""}`,
			},
		},
	);
	const response = (await reqeust.json()) as ApiResponse<UserInfo>;

	if (hasResponseError(reqeust, response)) {
		throw redirect("/");
	}

	return response;
}

export async function clientAction({ request }: Route.ClientActionArgs) {
	const data = await request.formData();
	const currentUser = loadUserFromJWT();

	const username = data.get("username")?.toString();
	const password = data.get("password")?.toString();

	const apiRequest = await fetch(
		`${API_HOST}/users?username=${currentUser?.username}`,
		{
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${localStorage.getItem("jwt") ?? ""}`,
			},
			body: JSON.stringify({
				username,
				password,
			}),
		},
	);

	const response = (await apiRequest.json()) as ApiResponse<JwtBearerResponse>;

	if (hasResponseError(apiRequest, response)) throw new Error(response.message);

	localStorage.removeItem("jwt");
	return redirect("/login");
}

const checkIfTheViewerIsTheUser = (
	viewer: string | undefined | null,
	viewedUsername: string,
): boolean =>
	viewer != undefined && viewer != null && viewedUsername === viewer;

const UserProfile = () => {
	const viewer = loadUserFromJWT();
	const viewed = useLoaderData() as UserInfo;
	const isTheViewerTheUser = checkIfTheViewerIsTheUser(
		viewer?.username,
		viewed.username,
	);
	const user = loadUserFromJWT();

	const [username, setUsername] = useState<string>(viewed.username);

	return (
		<div className="w-screen flex flex-col gap-[5em]">
			<Header user={user} />
			<main className="grid justify-items-center items-center flex-grow-1">
				<div className="w-3/4 max-w-[453px]">
					<Card>
						<CardHeader className="text-center">
							<div className="mx-auto mb-4">
								{viewed.logo ? (
									<div
										className="relative"
										style={{ width: "8em", height: "5em" }}
									>
										<img
											src={viewed.logo}
											alt="Profile"
											className="w-full h-full absolute rounded-full object-cover"
										/>
									</div>
								) : (
									<div className="w-24 h-24 rounded-full bg-gray-300 flex items-center justify-center mx-auto">
										<UserIcon className="w-16 h-16 text-white" />
									</div>
								)}
							</div>
							<CardTitle className="text-xl">{viewed.username}</CardTitle>
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
											disabled={!isTheViewerTheUser}
											className="disabled:opacity-100 dislabled:text-white"
											value={username}
											onChange={(e) => setUsername(e.target.value)}
										/>
									</div>
									{isTheViewerTheUser && (
										<div className="grid gap-3">
											<div className="flex items-center">
												<Label htmlFor="password">Password</Label>
											</div>
											<Input
												id="password"
												type="password"
												name="password"
												disabled={!isTheViewerTheUser}
												placeholder="Type to change password"
												className="disabled:opacity-100"
											/>
										</div>
									)}
									<div className="grid gap-3">
										<div className="flex items-center">
											<Label>Member since</Label>
										</div>
										<p
											data-slot="input"
											className={cn(
												"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
												"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] items-center",
												"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
											)}
										>
											{new Date(viewed.created_at).toLocaleDateString()}
										</p>
									</div>
									<div className="grid gap-3">
										<div className="flex items-center">
											<Label>Total Blogs</Label>
										</div>
										<p
											data-slot="input"
											className={cn(
												"file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
												"focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] items-center",
												"aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
											)}
										>
											{viewed.blog_count}
										</p>
									</div>
									{isTheViewerTheUser && (
										<div>
											<Button
												type="submit"
												className="w-full"
											>
												Update
											</Button>
										</div>
									)}
								</div>
							</Form>
						</CardContent>
					</Card>
				</div>
			</main>
		</div>
	);
};

export default UserProfile;
