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
1. **Consistent Illustration Style**: All images now use watercolor illustration theme with unified visual consistency
2. **Cover Image Generation**: Added AI-generated cover images that display with the story title
3. **Enhanced Image Prompts**: Improved prompts to ensure child-friendly, whimsical artwork
4. **LocalStorage Persistence**: Stories are now saved and restored after page reload
5. **Mobile Text Visibility**: Fixed mobile view to properly display story text alongside images
6. **Single Page Content**: Cover and ending pages now display properly as single-page content

### Technical Changes:
- **Image Consistency**: Added unified visual theme directive ensuring watercolor illustration consistency
- **LocalStorage Integration**: Stories persist across page reloads and browser sessions
- **Mobile Optimization**: Fixed CSS to ensure text visibility on mobile devices
- **Page Layout**: Enhanced page content handling for single-page (cover/end) content
- **Character Consistency**: Improved prompts to maintain same character appearance across all pages
- Added cover image generation workflow with proper frontend integration

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

## Key Features

### Image Style Consistency
All generated images follow a unified theme:
- **Style**: Watercolor illustration with soft pastel colors
- **Character Consistency**: Same appearance, clothes, and features across all pages
- **Artistic Approach**: Hand-painted feel with clean outlines and rounded proportions
- **Quality Control**: Avoids text, distortions, or photorealistic elements

### Data Persistence
- **Auto-Save**: Stories automatically save to localStorage
- **Resume Reading**: Reload the page to continue where you left off
- **Clear Data**: Use "New Story" button to clear saved data and start fresh

### Mobile Experience
- **Responsive Design**: Optimized layouts for all screen sizes
- **Text Visibility**: Story text clearly visible alongside illustrations on mobile
- **Touch Navigation**: Smooth page flipping on touch devices

This ensures a cohesive, professional storybook experience across all devices.
