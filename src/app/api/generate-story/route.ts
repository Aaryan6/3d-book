import { google } from "@ai-sdk/google";
import { fal } from "@ai-sdk/fal";
import {
  generateObject,
  generateText,
  experimental_generateImage as generateImage,
} from "ai";
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

// Define the schema for a story page
const StoryPageSchema = z.object({
  pageNumber: z.number(),
  title: z.string(),
  content: z.string(),
  characters: z.array(z.string()),
  setting: z.string(),
  mood: z.string(),
});

// Define the schema for the complete story
const StorySchema = z.object({
  title: z.string(),
  pages: z.array(StoryPageSchema),
  genre: z.string(),
  targetAge: z.string(),
});

interface StoryWithImages extends z.infer<typeof StorySchema> {
  pages: Array<z.infer<typeof StoryPageSchema> & { imageUrl?: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Step 1: Generate the story structure using Gemini 2.5 Flash
    console.log("Generating story structure...");
    const storyResult = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: StorySchema,
      prompt: `Create a children's storybook based on this prompt: "${prompt}". 
      The story should have 6-8 pages, with each page having:
      - A clear title
      - 2-3 sentences of engaging content appropriate for children
      - Characters involved in that scene
      - Setting/location description
      - Mood/atmosphere
      
      Make it educational, fun, and age-appropriate for children aged 4-8 years.`,
    });

    const story = storyResult.object as StoryWithImages;

    console.log("Story generated:", story.title);
    console.log("Number of pages:", story.pages.length);

    // Step 2: Generate image prompts for each page
    const pagesWithImages = await Promise.all(
      story.pages.map(async (page, index) => {
        try {
          console.log(`Generating image for page ${index + 1}...`);

          // Generate a detailed image prompt based on the page content
          const imagePromptResult = await generateText({
            model: google("gemini-2.5-flash"),
            prompt: `Create a detailed, child-friendly image prompt for this storybook page:
            
            Title: ${page.title}
            Content: ${page.content}
            Characters: ${page.characters.join(", ")}
            Setting: ${page.setting}
            Mood: ${page.mood}
            
            Generate a prompt for a high-quality, colorful, child-friendly illustration that would perfectly capture this scene. 
            The style should be warm, inviting, and suitable for children's books. Include details about:
            - The characters and their expressions
            - The setting and environment
            - Colors and lighting that match the mood
            - Any important objects or elements from the story
            
            Keep it descriptive but concise (max 100 words).`,
          });

          const imagePrompt = imagePromptResult.text;
          console.log(
            `Image prompt for page ${index + 1}: ${imagePrompt.substring(
              0,
              100
            )}...`
          );

          // Step 3: Generate the actual image using Fal
          const imageResult = await generateImage({
            model: fal.image("fal-ai/qwen-image"),
            prompt: imagePrompt,
            size: "1024x1024",
          });

          // Convert to base64 for easier handling in the frontend
          const base64Image = `data:image/png;base64,${Buffer.from(
            imageResult.image.uint8Array
          ).toString("base64")}`;

          return {
            ...page,
            imageUrl: base64Image,
            imagePrompt, // Include for debugging/reference
          };
        } catch (error) {
          console.error(`Error generating image for page ${index + 1}:`, error);
          return {
            ...page,
            imageUrl: undefined,
            error: "Failed to generate image",
          };
        }
      })
    );

    const finalStory = {
      ...story,
      pages: pagesWithImages,
    };

    console.log("Story generation complete!");

    return NextResponse.json(finalStory);
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      { error: "Failed to generate story" },
      { status: 500 }
    );
  }
}
