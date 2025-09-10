import TextArea from "@components/blogs/TextArea";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { Label } from "@radix-ui/react-label";
import { API_HOST } from "@shared/api-types";
import {
	useRef,
	useState,
	type ChangeEvent,
	type Dispatch,
	type SetStateAction,
} from "react";
import Markdown from "react-markdown";
import { Copy } from "lucide-react";

const emptyOutFileInputEl = (inputEl: HTMLInputElement) => {
	inputEl.value = "";
	inputEl.files = null;
};

const wrapFileInFormData = (file: File) => {
	const formData = new FormData();
	formData.append("file", file);
	return formData;
};

const handleOnChangeOfInputFileEl = async (
	ev: ChangeEvent<HTMLInputElement>,
	existingAttachments: string[],
	setExistingAttachements: Dispatch<SetStateAction<string[]>>,
) => {
	if (!ev.target) return;

	const inputEl = ev.target;

	if (
		!inputEl.value ||
		!inputEl.files ||
		inputEl.files.length > 1 ||
		inputEl.value in existingAttachments
	)
		return;

	const file = inputEl.files[0];

	fetch(`${API_HOST}/attachments`, {
		method: "POST",
		body: wrapFileInFormData(file),
	});

	setExistingAttachements((a) => [...a, file.name]);
	emptyOutFileInputEl(inputEl);
};

//TODO: add delete option for attachemnts
//TODO: add insert option for attachemnts
//TODO: upload an attachment and have backend support
//TODO: add copy to clipboard to attachemnts
const CreateBlog = () => {
	// const username = useJwt(true)
	const [attachments, setAttachments] = useState<string[]>([]);
	const fileInputEl = useRef<HTMLInputElement | null>(null);
	const [md, setMd] = useState<string>("");

	return (
		<>
			<header className="pt-5 mb-5">
				<h1 className="text-center">Create a blog page</h1>
			</header>
			<main className="p-5 flex flex-col gap-5">
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
							accept=".jpg .png .jpeg"
							ref={fileInputEl}
							onChange={(ev) =>
								handleOnChangeOfInputFileEl(ev, attachments, setAttachments)
							}
						/>
					</div>
					<div className="row-start-2 w-min">
						{attachments.map((attachment) => (
							
						))}
					</div>
				</div>
				<div className="w-full flex justify-center">
					<Button>Submit</Button>
				</div>
			</main>
		</>
	);
};

export default CreateBlog;
