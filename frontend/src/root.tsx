import { ThemeProvider } from "@components/ui/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {  Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import "./index.css"

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<meta charSet="UTF-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1.0"
				/>
				<title>Blog</title>
				<Meta />
				<Links/>
			</head>
			<body>
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

const queryClient = new QueryClient();

export default function Root() {
	return (
		<ThemeProvider
			defaultTheme="dark"
			storageKey="vite-ui-theme"
		>
			<QueryClientProvider client={queryClient}>
				<Outlet />
			</QueryClientProvider>
		</ThemeProvider>
	);
}
