# AI Storybook Creator

A Next.js application that generates personalized children's storybooks with AI-generated content and illustrations.

## Features

- 🤖 **AI Story Generation**: Uses Google Gemini 2.5 Flash to create structured children's stories
- 🎨 **Consistent Illustration Style**: Generates cartoon-style illustrations using Fal AI (Flux Schnell model)
- 📖 **Cover Image Generation**: Creates custom cover art for each story
- 📚 **3D Page Flip**: Interactive book experience with realistic page turning
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Recent Updates

### Fixed Issues:
1. **Consistent Illustration Style**: All images now use cartoon illustration style instead of mixed realistic/illustration styles
2. **Cover Image Generation**: Added AI-generated cover images that display with the story title
3. **Enhanced Image Prompts**: Improved prompts to ensure child-friendly, whimsical artwork

### Technical Changes:
- Updated image generation to use Fal AI Flux Schnell model for better consistency
- Enhanced prompts with explicit style keywords (cartoon illustration, children's book art, digital painting)
- Added cover image generation workflow
- Improved frontend to display cover images properly

## Setup

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Environment Variables**
   Copy `.env.local.example` to `.env.local` and add your API keys:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Then edit `.env.local` with your keys:
   - `GOOGLE_GENERATIVE_AI_API_KEY`: Get from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `FAL_KEY`: Get from [Fal AI Dashboard](https://fal.ai/dashboard/api-keys)

3. **Run Development Server**
   ```bash
   bun run dev
   ```

4. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. **Story Generation**: User enters a prompt (e.g., "A brave mouse who wants to be a chef")
2. **AI Processing**: 
   - Gemini 2.5 Flash generates structured story with 6-8 pages
   - Creates detailed image prompts for each page and cover
   - Fal AI generates consistent cartoon-style illustrations
3. **Display**: Shows the complete storybook with interactive page flipping

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **AI Models**: 
  - Google Gemini 2.5 Flash (story & prompt generation)
  - Fal AI Flux Schnell (image generation)
- **UI Libraries**: page-flip for 3D book effect
- **Styling**: SCSS with custom animations

## Image Style Consistency

All generated images now follow these guidelines:
- **Style**: Cartoon illustration, children's book art
- **Not Realistic**: Explicitly excludes photographic/realistic styles
- **Color Palette**: Bright, colorful, child-friendly
- **Artistic Approach**: Hand-drawn look, whimsical, digital painting style

This ensures a cohesive visual experience throughout the storybook.
