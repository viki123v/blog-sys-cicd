import Header from "@components/shared/Header";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Button } from "@components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Label } from "@radix-ui/react-label";
import { API_HOST } from "@shared/api-types";
import { loadUserFromJWT } from "@shared/security-utils";
import { Form, redirect, type ActionFunctionArgs } from "react-router";

type CreateBlogProps = {
	errorMsg?: string;
};

export async function clientAction({ request }: ActionFunctionArgs) {
	const formData = await request.formData();

	const title = formData.get("title") as string;
	const content = formData.get("content") as string;
	const description = formData.get("description") as string;

	const apiRequest = await fetch(`${API_HOST}/blogs`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${localStorage.getItem("jwt") ?? ""}`,
		},
		body: JSON.stringify({ title, content, description }),
	});

	if (!apiRequest.ok) {
		throw new Error("Failed to create blog");
	}

	return redirect("/");
}

const CreateBlog = ({ errorMsg }: CreateBlogProps) => {
	const user = loadUserFromJWT();

	return (
		<>
			<Header user={user} />
			<main className="grid justify-items-center items-center w-screen h-screen">
				<div className="w-3/4 max-w-[800px]">
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="text-xl">Create a blog</CardTitle>
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
										<Label htmlFor="title">Title</Label>
										<Input
											id="title"
											type="text"
											name="title"
											placeholder="My first blog"
											required
										/>
									</div>
									<div className="grid gap-3">
										<Label htmlFor="description">Description</Label>
										<Input
											id="description"
											type="text"
											name="description"
											placeholder="My first description"
											required
										/>
									</div>
									<div className="grid gap-3">
										<div className="flex items-center">
											<Label htmlFor="content">Content</Label>
										</div>
										<Textarea
											id="content"
											name="content"
											className="h-[40ch]"
											placeholder="Hello world!"
											required
										></Textarea>
									</div>
									<div className="flex justify-center w-full">
										<Button
											type="submit"
											className="w-fit px-[4ch] cursor-pointer"
										>
											Submit
										</Button>
									</div>
								</div>
							</Form>
						</CardContent>
						<CardFooter className="text-center text-sm"></CardFooter>
					</Card>
				</div>
			</main>
		</>
	);
};

export default CreateBlog;
