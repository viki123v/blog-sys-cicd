import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@components/ui/card";
import type { Route } from "../+types/root";
import Header from "@components/shared/Header";
import { loadUserFromJWT } from "@shared/security-utils";
import { Form, redirect } from "react-router";
import { Label } from "@radix-ui/react-label";
import { Input } from "@components/ui/input";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";
import {
	API_HOST,
	hasResponseError,
	type ApiResponse,
	type Blog,
} from "@shared/api-types";

export async function clientLoader({ params }: Route.LoaderArgs) {
	if (!params.title) throw redirect("/");

	const request = await fetch(
		`${API_HOST}/blogs?title=${encodeURIComponent(params.title)}`,
	);
	const response = (await request.json()) as ApiResponse<Blog>;

	if (hasResponseError(request, response)) throw new Error(response.message);

	return response.blogs;
}

export async function clientAction({ params, request }: Route.ActionArgs) {
	const blogTitle = params.title;
	const formData = await request.formData();

	const description = formData.get("description");
	const content = formData.get("content");

	const apiRequest = await fetch(`${API_HOST}/blogs?title=${blogTitle}`, {
		method: "PUT",
		headers: {
			Authorization: "Bearer " + localStorage.getItem("jwt") || "",
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			description,
			content,
		}),
	});
	const data = await apiRequest.json();

	if (!apiRequest.ok) throw new Error(`Error: ${data!.message}`);

	return redirect(`/blogs/${blogTitle}`);
}

const BlogRewrite = ({ params }: Route.ComponentProps) => {
	const title = params.title;
	const user = loadUserFromJWT();

	return (
		<>
			<Header user={user} />
			<main className="grid justify-items-center items-center w-screen h-screen">
				<div className="w-3/4 max-w-[800px]">
					<Card>
						<CardHeader className="text-center">
							<CardTitle className="text-xl">Rewrite</CardTitle>
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
											value={title}
											required
											disabled
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

export default BlogRewrite;
