if (import.meta.env.VITE_HOST === undefined) {
	throw new Error("HOST is not defined");
}

export const API_HOST = `http://${import.meta.env.VITE_HOST}`;
console.log("ENV", import.meta.env.VITE_HOST);
console.log("API_HOST:", API_HOST);

export type ApiResponseError = {
	message: string;
};

export type JwtBearerResponse = {
	bearer: string;
};

export type ApiResponse<T> = T | ApiResponseError;

export type Blog = {
	blogs: {
		title: string;
		content: string;
		description: string;
		published_at: string;
		username: string;
		user_icon_url: string | undefined;
	}[];
};

export const hasResponseError = <T>(
	response: Response,
	data: T | ApiResponseError,
): data is ApiResponseError => {
	return !response.ok;
};

export const debounceFactory = <T>(
	callback: (...args: T[]) => unknown,
	time: number,
) => {
	let timer: NodeJS.Timeout | undefined;
	return (...args: T[]) => {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => callback(...args), time);
	};
};
