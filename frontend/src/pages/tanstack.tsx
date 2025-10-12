import { useQuery } from "@tanstack/react-query";

type PingApiResponse = {
	timestamp: string;
};

const Tanstackdemo = () => {
	const { data } = useQuery<PingApiResponse>({
		queryKey: ["demo"],
		queryFn: async () => {
			const res = await fetch("https://api.siterelic.com/ping", {
				method: "POST",
			});
			if (!res.ok) throw new Error("Network response was not ok");
			return res.json();
		},
	});

	if (!data) return <div>Loading...</div>;

	return <div>{data.timestamp}</div>;
};

export default Tanstackdemo;
