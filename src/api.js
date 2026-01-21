export const generateRecipe = async (ingredients, onChunk) => {
	try {
		const response = await fetch("http://localhost:3001/api/generate-recipe", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ ingredients }),
		});

		if (!response.ok) {
			throw new Error(`HTTP error! status:${response.status}`);
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let fullText = "";

		while (true) {
			const { done, value } = await reader.read();

			if (done) break;
			const chunk = decoder.decode(value);
			const lines = chunk.split("\n");

			for (const line of lines) {
				if (line.startsWith("data: ")) {
					console.log(line);
					const data = line.slice(6);

					if (data === "[DONE]") {
						break;
					}

					try {
						const parsed = JSON.parse(data);
						fullText += parsed.content;
						if (onChunk) {
							onChunk(fullText);
						}
					} catch (e) {}
				}
			}
		}
		return fullText;
	} catch (error) {
		console.error("Error generating recipe:", error);
		throw error;
	}
};
