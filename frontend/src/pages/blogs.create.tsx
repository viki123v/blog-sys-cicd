import TextArea from "@components/blogs/TextArea";
import { Input } from "@components/ui/input";
import { Label } from "@radix-ui/react-label";
import { API_HOST } from "@shared/api-types";
import { useState } from "react";
import Markdown from "react-markdown";

//TODO: add delete option for attachemnts
//TODO: add insert option for attachemnts
const CreateBlog = () => {
    // const username = useJwt(true)
	const [attachments, _setAttachments] = useState<string[]>([]);
	const [md, setMd] = useState<string>("");

	return (
		<main className="p-5 flex flex-col gap-5">
			<div className="h-[20vh]"></div>
			<div className="grid grid-cols-[1fr_.2em_1fr] gap-3 h-[60vh] aasdf">
				<TextArea setMd={setMd} />
				<div className="w-[.2em] h-full rounded-lg bg-white"></div>
                <div className="border-1 rounded-xl p-2 hover:border-white grey-bg">
                    <Markdown>{md}</Markdown>
                </div>
			</div>
			<div className="grid grid-cols-2 ">
				<div className=" rounded-xl h-[5em]">
                    <Label htmlFor="attachment">Upload an attachment</Label>
					<Input
                        className="max-w-[220px]"
						id="attachment"
						name="attachment"
						type="file"
					/>
				</div>
				<div className="row-start-2 w-min">
					{attachments.map((attachment) => (
						<a href={`${API_HOST}/assets/blogs-content/${attachment}`}>
							{attachment}({API_HOST}/assets/blogs-content/{attachment})
						</a>
					))}
				</div>
			</div>
		</main>
	);
};

export default CreateBlog;
