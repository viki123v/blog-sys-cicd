import type { ComponentType } from "react";
import { useRouteError } from "react-router";

export default function createErrorBoundaryForUesrInfo<T>(
	Component: ComponentType<T & { errorMsg: string }>,
) {
	return function ErrorBoundary(props: T) {
		const error = useRouteError();
		if (!(error instanceof Error)) throw error;

		return (
			<Component
				{...props}
				errorMsg={error.message}
			/>
		);
	};
}
