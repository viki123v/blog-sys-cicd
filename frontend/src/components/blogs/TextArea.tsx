import { useState, type SetStateAction } from "react";
import { Textarea as TextareaComponent } from "@components/ui/textarea";
import { debounceFactory } from "@shared/api-types";

type TextAreaProps = {
	setMd: React.Dispatch<SetStateAction<string>>;
};

const TextArea = ({ setMd }: TextAreaProps) => {
	const [txt, setTxt] = useState<string>("");
	const setMdDebounced = debounceFactory((a: string) => setMd(a), 200);

	return (
		<TextareaComponent
			onChange={(ev) => {
				setTxt(ev.target.value);
				setMdDebounced(ev.target.value);
			}}
			value={txt}
		></TextareaComponent>
	);
};

export default TextArea;
