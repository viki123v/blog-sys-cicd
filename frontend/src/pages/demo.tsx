import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { Terminal } from "lucide-react";

export default function Demo() {
	return (
		<Alert variant="destructive">
			<Terminal />
			<AlertTitle>Heads up!</AlertTitle>
			<AlertDescription>
				You can add components and dependencies to your app using the cli.
			</AlertDescription>
		</Alert>
	);
}
