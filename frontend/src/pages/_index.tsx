import { API_HOST,  hasResponseError, type ApiResponse, type Blog } from "@shared/api-types";
import {  useNavigate } from "react-router";
import { Card, CardHeader, CardTitle, CardContent } from "@components/ui/card";
import { Button } from "@components/ui/button";
import { User as UserIcon, Search } from 'lucide-react';
import { Input } from "@components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {  useState } from "react";
import Header from "@components/shared/Header";
import { loadUserFromJWT } from "@shared/security-utils";

const handleSearch = async (query: string): Promise<Blog> => {
    const requestURL = query.trim() === "" ? `${API_HOST}/blogs` : `${API_HOST}/blogs?title=${encodeURIComponent(query)}`;

    const request = await fetch(requestURL);
    const response = await request.json() as ApiResponse<Blog>

    if (hasResponseError(request, response))
        throw new Error(response.message)

    return response;
}

const getEmptyBlog = (): Blog => ({ blogs: [] });

const BlogList = () => {
    const [query, setQuery] = useState("");
    const {data} = useQuery({
        queryKey: [query],
        queryFn: () => handleSearch(query),
    })

    const navigate = useNavigate();
    const blogWrappers: Blog = data ?? getEmptyBlog();
    const user = loadUserFromJWT()


    return (
        <>
            <Header user={user}/>
            <main className="grid justify-items-center items-center w-screen h-screen">
                <div className="w-3/4 max-w-[700px] flex flex-col h-full mt-5">
                    <h1 className="mb-6 text-5xl font-semibold text-center">Blogs</h1>
                    <div className="flex justify-end mb-4 pr-6">
                        <a href="/blogs/create">
                            <Button className="w-fit px-4 py-2 cursor-pointer" type="button">
                                <span className="text-xs">Create blog</span>
                            </Button>
                        </a>
                    </div>
                    <div className="w-full max-w-2xl mx-auto mb-8">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <Input
                                value={query}
                                type="text"
                                placeholder="Search blogs..."
                                className="w-full h-12 text-lg pl-12 pr-[5ch]"
                                style={{ fontSize: '1.1rem' }}
                                onChange={e => setQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex-grow-1">
                        {blogWrappers.blogs.map(blog => (
                            <Card className="mb-6 cursor-pointer gap-2 transition-transform duration-200 hover:scale-[1.02]"
                                key={blog.title}
                                onClick={() => navigate(`/blogs/${blog.title}`)}>
                                <CardHeader className="pb-2">
                                    <div>
                                        <span className="text-xs text-muted-foreground block mb-1">Title</span>
                                        <div className="flex justify-between items-center">
                                            <CardTitle className="text-lg font-bold">{blog.title}</CardTitle>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-muted-foreground">{blog.username}</span>
                                                {blog.user_icon_url ? (
                                                    <img src={blog.user_icon_url} alt="user icon" className="w-8 h-8 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                                                        <UserIcon className="w-6 h-6 text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <hr className="border-t border-[rgb(74, 74, 74);] mt-2" />
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <span className="text-xs text-muted-foreground block mb-1">Description</span>
                                    <p className="text-base text-card-foreground">{blog.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </main>
        </>
    );
}

export default BlogList;