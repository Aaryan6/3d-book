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
  coverImageUrl?: string;
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

    // Unified visual theme to keep all images consistent and avoid buggy outputs
    const IMAGE_STYLE_DIRECTIVE = `
      Consistent children's book watercolor illustration theme with soft pastel colors and gentle lighting; 
      hand-painted feel with clean outlines; cute rounded proportions; consistent character designs across all pages 
      (same clothes, colors, hair, and species); single cohesive art style throughout. Avoid text, letters, 
      watermarks, signatures, frames, borders, photorealism, 3D rendering, pixelation, glitches, artifacts, 
      distorted faces, extra fingers, extra limbs, or deformed anatomy.
    `
      .replace(/\s+/g, " ")
      .trim();

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

    // Step 2: Generate cover image
    console.log("Generating cover image...");
    let coverImageUrl;
    try {
      const coverPromptResult = await generateText({
        model: google("gemini-2.5-flash"),
        prompt: `Create a detailed cover image prompt for this children's storybook. Use a single, consistent visual theme for the entire book as specified below.
        
        Title: ${story.title}
        Genre: ${story.genre}
        Main Characters: ${story.pages
          .map((p) => p.characters)
          .flat()
          .filter((char, index, arr) => arr.indexOf(char) === index)
          .join(", ")}
        
         Generate a prompt for a beautiful, colorful children's book cover illustration.
         Enforce this exact visual theme (do not deviate across pages): ${IMAGE_STYLE_DIRECTIVE}
        Include:
        - Main characters in a welcoming scene
        - Title placement area (but don't include text)
        - Warm, inviting colors
         - Child-friendly artistic style with consistent character appearance
         - Storybook cover composition matching the theme
        
        Keep it concise (max 80 words).`,
      });

      const coverImageResult = await generateImage({
        model: fal.image("fal-ai/flux/schnell"),
        prompt: `${coverPromptResult.text}. Visual theme: ${IMAGE_STYLE_DIRECTIVE}`,
        size: "1024x1024",
      });

      coverImageUrl = `data:image/png;base64,${Buffer.from(
        coverImageResult.image.uint8Array
      ).toString("base64")}`;

      console.log("Cover image generated successfully");
    } catch (error) {
      console.error("Error generating cover image:", error);
    }

    // Step 3: Generate image prompts for each page
    const pagesWithImages = await Promise.all(
      story.pages.map(async (page, index) => {
        try {
          console.log(`Generating image for page ${index + 1}...`);

          // Generate a detailed image prompt based on the page content
          const imagePromptResult = await generateText({
            model: google("gemini-2.5-flash"),
            prompt: `Create a detailed, child-friendly illustration prompt for this storybook page. Use a single, consistent visual theme for the entire book as specified below.
            
            Title: ${page.title}
            Content: ${page.content}
            Characters: ${page.characters.join(", ")}
            Setting: ${page.setting}
            Mood: ${page.mood}
            
             Generate a prompt for a colorful children's book illustration that captures this scene.
             Enforce this exact visual theme (do not deviate across pages): ${IMAGE_STYLE_DIRECTIVE}
             Ensure character consistency (same clothing, colors, and features) and coherent proportions.
            Include details about:
            - The characters and their expressions
            - The setting and environment
            - Colors and lighting that match the mood
            - Important objects or elements from the story
            
            Keep it descriptive but concise (max 80 words).`,
          });

          const basePrompt = imagePromptResult.text;
          const enhancedPrompt = `${basePrompt}. Visual theme: ${IMAGE_STYLE_DIRECTIVE}`;

          console.log(
            `Image prompt for page ${index + 1}: ${enhancedPrompt.substring(
              0,
              100
            )}...`
          );

          // Step 4: Generate the actual image using Fal
          const imageResult = await generateImage({
            model: fal.image("fal-ai/flux/schnell"),
            prompt: enhancedPrompt,
            size: "1024x1024",
          });

          // Convert to base64 for easier handling in the frontend
          const base64Image = `data:image/png;base64,${Buffer.from(
            imageResult.image.uint8Array
          ).toString("base64")}`;

          return {
            ...page,
            imageUrl: base64Image,
            imagePrompt: enhancedPrompt, // Include for debugging/reference
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
      coverImageUrl,
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
