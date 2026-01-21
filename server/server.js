import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

//Load environment variables
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3001;

//Initialize OpenAI
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

app.use(
	cors({
		origin:
			process.env.NODE_ENV === "production"
				? "https://recipe-ai-app-steel.vercel.app"
				: "http://localhost:5173",
		credentials: true,
	})
); //Allow request from react app
app.use(express.json()); //parse JSON bodies

app.get("/api/health", (req, res) => {
	res.json({
		status: "OK",
		message: "Server is running",
	});
});

app.post("/api/generate-recipe", async (req, res) => {
	try {
		const { ingredients } = req.body;

		if (!ingredients || ingredients.trim() === "") {
			return res.status(400).json({ error: "Ingredients are required." });
		}

		console.log("Recipe generated for:", ingredients);

		//Streaming code

		//set headers for streaming
		res.setHeader("Content-Type", "text/event-stream");
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("Connection", "keep-alive");

		//calling openAI with streaming
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

		//stream the response to client
		for await (const chunk of stream) {
			const content = chunk.choices[0]?.delta?.content || "";
			if (content) {
				res.write(`data: ${JSON.stringify({ content })}\n\n`);
			}
		}
		res.write("data: [DONE]\n\n");
		res.end();
	} catch (error) {
		console.error("Error generating recipe", error);

		if (!res.headersSent) {
			res.status(500).json({
				error: "Failed to generate recipe",
				message: error.message,
			});
		}
	}
});

if (process.env.NODE_ENV !== "production") {
	app.listen(PORT, () => {
		console.log(`🚀 Server running on http://localhost:${PORT}`);
		console.log(
			`✅ OpenAI API key configured: ${
				process.env.OPENAI_API_KEY ? "Yes" : "No"
			}`
		);
	});
}

export default app;
