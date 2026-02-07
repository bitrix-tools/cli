
type RenderTemplateOptions = {
	template: string;
	replacements: Record<string, string | boolean>;
};

export function renderTemplate(options: RenderTemplateOptions): string
{
	const { template, replacements } = options;

	return template.replace(/\{\{(\w+)}}/g, (match: string, placeholderKey: string) => {
		if (Object.hasOwn(replacements, placeholderKey))
		{
			return String(replacements[placeholderKey]);
		}

		return match;
	});
}
