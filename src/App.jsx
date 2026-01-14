import { useState } from "react";
import { generateRecipe } from "./openaiService";

function App() {
	const [ingredients, setIngredients] = useState("");
	const [recipe, setRecipe] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async () => {
		// if no ingredients are entered
		if (!ingredients.trim()) {
			setError("Please enter some ingredients");
		}
		// loading needs to be true once user clicks on submit
		setLoading(true);
		//old recipe value need to be removed
		setRecipe("");
		// error messages need to be removed
		setError("");

		//add try catch to handle any errors if the api fails
		try {
			await generateRecipe(ingredients, (partialRecipe) => {
				setRecipe(partialRecipe);
			});
		} catch (error) {
			setError("Failed to load the recipes");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="app">
			<header className="header">
				<img src="/icon-192.png" alt="Logo" className="header-logo" />
				<h1>AI Recipe Generator</h1>
			</header>
			<main className="container">
				<div className="input-section">
					<textarea
						value={ingredients}
						onChange={(e) => setIngredients(e.target.value)}
						placeholder="Enter ingredients"
						className="ingredient-input"
						rows="4"></textarea>
					<button
						onClick={handleSubmit}
						className="generate-button"
						disabled={loading}>
						{loading ? "🔄 Generating..." : "✨ Generate Recipe"}
					</button>
					<p className="hint">Tip: Ctrl+Enter to generate</p>
				</div>

				{error && <div className="error">{error}</div>}
				{recipe && (
					<div className={`recipe-output ${loading ? "generating" : ""}`}>
						<h2>Your recipe:</h2>
						<div className="recipe-content">{recipe}</div>
					</div>
				)}
			</main>
		</div>
	);
}

export default App;
