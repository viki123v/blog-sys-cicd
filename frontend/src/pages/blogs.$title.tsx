import {
	API_HOST,
	hasResponseError,
	type ApiResponse,
} from "@shared/api-types";
import type { Route } from "../+types/root";
import { type Blog } from "@shared/api-types";
import {
	useLoaderData,
	useNavigate,
	type NavigateFunction,
} from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@components/ui/card";
import { UserIcon } from "lucide-react";
import { Button } from "@components/ui/button";
import { loadUserFromJWT } from "@shared/security-utils";
import Header from "@components/shared/Header";

export async function clientLoader({ params }: Route.LoaderArgs) {
	const requestForBlog = await fetch(
		`${API_HOST}/blogs?title=${params.title}`,
		{
			headers: {
				Authorization: "Brear " + localStorage.getItem("jwt") || "",
			},
		},
	);
	const response = (await requestForBlog.json()) as ApiResponse<Blog>;

	if (hasResponseError(requestForBlog, response))
		throw new Error(`Error: ${response.message}`);
	if (response.blogs.length === 0) throw new Error("No blog for title");

	return response;
}

const handleDelete = async (title: string, navigate: NavigateFunction) => {
	const request = await fetch(`${API_HOST}/blogs?title=${title}`, {
		method: "DELETE",
		headers: {
			Authorization: "Bearer " + localStorage.getItem("jwt") || "",
		},
	});
	const response = await request.json();

	if (!request.ok) throw new Error(`Error: ${response}`);

	navigate("/");
};

const Blog = () => {
	const { blogs } = useLoaderData() as Blog;
	const user = loadUserFromJWT();
	const blog = blogs[0];
	const navigate = useNavigate();

	return (
		<>
			<Header user={user} />
			<main className="grid justify-items-center items-center w-screen h-screen">
				<Card
					className="mb-6  w-[80%] h-[80%] max-w-[700px] max-h-[700px] gap-0"
					key={blog.title}
				>
					<CardHeader className="pb-2">
						<div className="flex justify-between items-center">
							<div>
								<CardTitle className="text-lg font-bold">
									{blog.title}
								</CardTitle>
							</div>
							<div className="flex items-center gap-2">
								<a
									href={`/user/${blog.username}`}
									className="text-sm text-muted-foreground"
								>
									{blog.username}
								</a>
								{blog.user_icon_url ? (
									<img
										src={blog.user_icon_url}
										alt="user icon"
										className="w-8 h-8 rounded-full object-cover"
									/>
								) : (
									<div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
										<UserIcon className="w-6 h-6 text-white" />
									</div>
								)}
								{user && user.username == blog.username && (
									<>
										<Button
											type="submit"
											className="w-fit cursor-pointer"
											onClick={(_) => handleDelete(blog.title, navigate)}
										>
											Delete
										</Button>
										<Button
											type="submit"
											className="w-fit cursor-pointer"
										>
											<a href={`/blogs/rewrite/${blog.title}`}>Rewrite</a>
										</Button>
									</>
								)}
							</div>
						</div>
						<div className="flex flex-col text-muted-foreground">
							<h3 className="text-xs">Description</h3>
							<p className="text-xs">{blog.description}</p>
						</div>
						<hr className="border-t border-[rgb(74, 74, 74);] mt-2 mb-1" />
					</CardHeader>
					<CardContent className="pt-2">
						<div className="flex flex-col gap-2">
							<h3>Content</h3>
							<p className="text-base text-card-foreground overflow-scroll">
								{blog.content}
							</p>
						</div>
					</CardContent>
				</Card>
			</main>
		</>
	);
};

export default Blog;
