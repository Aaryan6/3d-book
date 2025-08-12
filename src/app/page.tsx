"use client";

import { useEffect, useRef, useState } from "react";
import { PageFlip } from "page-flip";
import type { SizeType } from "page-flip";
import "./story.scss";

interface StoryPage {
  pageNumber: number;
  title: string;
  content: string;
  characters: string[];
  setting: string;
  mood: string;
  imageUrl?: string;
}

interface Story {
  title: string;
  pages: StoryPage[];
  genre: string;
  targetAge: string;
  coverImageUrl?: string;
}

export default function Page() {
  const flipBookRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<PageFlip | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageState, setPageState] = useState("read");
  const [orientation, setOrientation] = useState("landscape");
  const [story, setStory] = useState<Story | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState(
    "A boy and a dog meet at street and became best friends"
  );
  const [showGenerator, setShowGenerator] = useState(true);

  // Load story from localStorage on mount
  useEffect(() => {
    const savedStory = localStorage.getItem("ai-storybook");
    if (savedStory) {
      try {
        const parsedStory = JSON.parse(savedStory);
        setStory(parsedStory);
        setShowGenerator(false);
      } catch (error) {
        console.error("Error parsing saved story:", error);
        localStorage.removeItem("ai-storybook");
      }
    }
  }, []);

  useEffect(() => {
    if (
      flipBookRef.current &&
      !pageFlipRef.current &&
      story &&
      !showGenerator
    ) {
      const pageFlip = new PageFlip(flipBookRef.current, {
        width: 400,
        height: 300,
        size: "stretch" as SizeType,
        minWidth: 300,
        maxWidth: 600,
        minHeight: 200,
        maxHeight: 200,
        maxShadowOpacity: 0.5,
        showCover: true,
        mobileScrollSupport: false,
      });

      pageFlip.loadFromHTML(document.querySelectorAll(".page"));

      setTotalPages(pageFlip.getPageCount());
      setOrientation(String(pageFlip.getOrientation()));

      pageFlip.on("flip", (e) => {
        const pageIndex = typeof e.data === "number" ? e.data : 0;
        setCurrentPage(pageIndex + 1);
      });

      pageFlip.on("changeState", (e) => {
        setPageState(String(e.data));
      });

      pageFlip.on("changeOrientation", (e) => {
        setOrientation(String(e.data));
      });

      pageFlipRef.current = pageFlip;
    }
  }, [story, showGenerator]);

  const handlePrevPage = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipPrev();
    }
  };

  const handleNextPage = () => {
    if (pageFlipRef.current) {
      pageFlipRef.current.flipNext();
    }
  };

  const generateStory = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate story");
      }

      const generatedStory = await response.json();

      // Save to localStorage
      localStorage.setItem("ai-storybook", JSON.stringify(generatedStory));

      setStory(generatedStory);
      setShowGenerator(false);
    } catch (error) {
      console.error("Error generating story:", error);
      alert("Failed to generate story. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetToGenerator = () => {
    setShowGenerator(true);
    setStory(null);
    setPrompt("");
    pageFlipRef.current = null;
    // Clear localStorage
    localStorage.removeItem("ai-storybook");
  };

  if (showGenerator) {
    return (
      <div className="story-container">
        <div className="generator-container">
          <h1>AI Storybook Creator</h1>
          <p>
            Enter a prompt to generate a personalized children&#39;s storybook
            with AI-generated illustrations!
          </p>

          <div className="prompt-input-container">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your story idea... (e.g., 'A brave little mouse who dreams of becoming a chef' or 'An adventure in a magical forest with talking animals')"
              className="prompt-input"
              rows={4}
              disabled={isGenerating}
            />
            <button
              onClick={generateStory}
              disabled={!prompt.trim() || isGenerating}
              className="generate-btn"
            >
              {isGenerating ? "Generating Story..." : "Generate Story"}
            </button>
          </div>

          {isGenerating && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>
                Creating your magical storybook... This may take a few minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="story-container">
      <div className="book-controls">
        <button
          type="button"
          className="nav-btn reset-btn"
          onClick={resetToGenerator}
          aria-label="Create new story"
        >
          ✏️ New Story
        </button>
        <button
          type="button"
          className="nav-btn prev-btn"
          onClick={handlePrevPage}
          aria-label="Previous page"
        >
          ←
        </button>
        <span className="page-counter">
          {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          className="nav-btn next-btn"
          onClick={handleNextPage}
          aria-label="Next page"
        >
          →
        </button>
      </div>
      <div className="book-container">
        <div className="flip-book" ref={flipBookRef}>
          {/* Cover Page */}
          <div className="page page-cover page-cover-top" data-density="hard">
            <div className="page-content">
              {story?.coverImageUrl ? (
                <div className="cover-with-image">
                  <img
                    src={story.coverImageUrl}
                    alt={`Cover for ${story.title}`}
                    className="cover-image"
                  />
                  <div className="cover-text">
                    <h1>{story.title}</h1>
                    <p className="subtitle">
                      {story.genre} • Ages {story.targetAge}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <h1>{story?.title || "Generated Story"}</h1>
                  <p className="subtitle">
                    {story?.genre} • Ages {story?.targetAge}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Story Pages */}
          {story?.pages.map((page) => (
            <div key={page.pageNumber} className="page page-spread">
              <div className="page-content page-content-mobile">
                <div className="page-left">
                  <div className="story-illustration">
                    {page.imageUrl ? (
                      <img
                        src={page.imageUrl}
                        alt={`Illustration for ${page.title}`}
                        className="generated-image"
                      />
                    ) : (
                      <div className="illustration-placeholder">
                        🎨 Generating...
                      </div>
                    )}
                  </div>
                </div>
                <div className="page-right">
                  <h3 className="page-title">{page.title}</h3>
                  <div className="story-text">
                    <p>{page.content}</p>
                  </div>
                  <div className="page-number">{page.pageNumber}</div>
                </div>
              </div>
            </div>
          ))}

          {/* End Page */}
          <div
            className="page page-cover page-cover-bottom"
            data-density="hard"
          >
            <div className="page-content">
              <h2>THE END</h2>
              <p className="subtitle">Thank you for reading!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
