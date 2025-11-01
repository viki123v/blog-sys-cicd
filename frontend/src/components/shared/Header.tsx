import { Button } from "@components/ui/button";
import { type BlogUser } from "@shared/security-utils";
import { UserIcon } from "lucide-react";
import { useNavigate, type NavigateFunction } from "react-router";

type Header = {
	user: BlogUser | null;
};

const handleLogout = (navigate: NavigateFunction) => {
	localStorage.removeItem("jwt");
	navigate("/");
};

const Header = ({ user }: Header) => {
	const navigate = useNavigate();

	return (
		<>
			<div className="flex justify-between items-center  p-5 pb-0">
				<div className="flex items-center text-xl font-bold gap-2">
					<span className="bg-white text-black px-2 py-1 rounded">BLOG</span>
					<span className="text-white">WALK</span>
				</div>
				{user ? (
					<div className="flex items-center gap-2 mx-2">
						<a
							href={`/user/${user.username}`}
							className="font-semibold text-lg"
						>
							{user.username}
						</a>
						{user.logo ? (
							<img
								src={user.logo}
								alt="user icon"
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
								<UserIcon className="w-8 h-8 text-white" />
							</div>
						)}
						<Button
							className="w-fit cursor-pointer mx-1"
							type="button"
							onClick={(_) => handleLogout(navigate)}
						>
							Logout
						</Button>
					</div>
				) : (
					<div className="flex gap-2 mx-2">
						<Button
							className="w-fit px-[4ch] mx-1"
							type="button"
						>
							<a
								href="/login"
								className="w-full h-full block text-xs"
							>
								Login
							</a>
						</Button>
						<Button
							className="w-fit px-[4ch] mx-1"
							type="button"
						>
							<a
								href="/register"
								className="w-full h-full block text-xs"
							>
								Register
							</a>
						</Button>
					</div>
				)}
			</div>
		</>
	);
};

export default Header;
