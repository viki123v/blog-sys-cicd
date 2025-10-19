import { API_HOST } from "@shared/api-types";
import { Copy } from "lucide-react";
import { type MouseEvent } from "react";

type CopyAnchorProps = { 
   attachment: string 
}

const handleOnClickCopyElement = (ev:MouseEvent<SVGElement>, attachemntName:string) => { 

    
}

const CopyAnchor = ({attachment}:CopyAnchorProps) => {
	return (
		<div>
			<a href={`${API_HOST}/assets/blogs-content/${attachment}`}>
				{attachment}
			</a>
			<Copy onClick={ev => handleOnClickCopyElement(ev, attachment)} />
		</div>
	);
};

export default CopyAnchor;
