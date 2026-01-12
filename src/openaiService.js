import OpenAI from "openai";

const openai = new OpenAI({
	apiKey: import.meta.env.VITE_OPENAI_API_KEY,
	dangerouslyAllowBrowser: true, //only for learning
});

export const generateRecipe = async (ingredients, onChunk) => {
	try {
		const stream = await openai.chat.completions.create({
			model: "gpt-4o-mini",
			messages: [
				{
					role: "system",
					content:
						"You are a helpful cooking assistant. Generate detailed recipes with ingredients and step-by-step instructions. Format your response clearly with sections for ingredients and instructions.",
				},
				{
					role: "user",
					content: `Create a delicious recipe using these ingredients: ${ingredients}. Include a recipe name, full ingredient list with measurements, and step-by-step cooking instructions.`,
				},
			],
			temperature: 0.7,
			max_tokens: 1000,
			stream: true,
		});

		let fullText = "";

		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || "";
			fullText += content;
			if (onChunk) {
				onChunk(fullText);
			}
		}
		return fullText;
	} catch (error) {
		console.error("Error generating recipe:", error);
		throw error;
	}
};
