export const processUserRegisterFormData = (
	rawData: FormData,
	file_keys: string[],
	pass_keys: string[],
): [Record<string, string>, File | undefined] => {
	let file: File | undefined;
	const data: Record<string, string> = {};

	for (const [key, value] of rawData.entries()) {
		if (pass_keys.includes(key)) continue;
		else if (file_keys.includes(key)) {
			if (file) throw new Error("Multiple files are not supported");
			file = value as File;
		} else if (typeof value === "string") {
			data[key] = value;
		}
	}

	return [data, file];
};

export const processTextForm = (formData: FormData) =>
	processUserRegisterFormData(formData, ["logo"], ["retype-password"])[0];
