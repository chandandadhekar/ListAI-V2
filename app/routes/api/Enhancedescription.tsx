import OpenAI from "openai"; // Use default import

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Your API key
});

async function generateProductDescription(productDescription: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that enhances product descriptions for SEO and appeal.",
        },
        {
          role: "user",
          content: `Enhance the following product description: ${productDescription}`,
        },
      ],
    });

    const enhancedDescription = response.choices[0].message?.content;
    return enhancedDescription;
  } catch (error) {
    console.error("Error with OpenAI API:", error);
  }
}

const Enhancedescription = () => {
    return generateProductDescription("This is a simple product description")
        .then((enhancedDescription) => console.log(enhancedDescription));
}
 
export default Enhancedescription
// Example call:

