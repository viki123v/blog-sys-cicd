export type BlogUser = {
	username: string;
	logo: string | undefined;
};

export function loadUserFromJWT(): BlogUser | null {
	const token = localStorage.getItem("jwt");
	if (!token) return null;

	try {
		const jwtParts = token.split(".");
		return JSON.parse(atob(jwtParts[1])) as BlogUser;
	} catch (_) {
		return null;
	}
}
