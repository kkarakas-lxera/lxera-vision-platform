import { useEffect, useState } from "react";

interface TypingTextProps {
  words: string[];
  typingSpeed?: number; // ms per char
  erasingSpeed?: number; // ms per char
  delayBetweenWords?: number; // pause before erase
  className?: string;
}

const TypingText = ({
  words,
  typingSpeed = 100,
  erasingSpeed = 60,
  delayBetweenWords = 1500,
  className = "",
}: TypingTextProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentWord = words[currentWordIndex];

    if (!isDeleting && displayedText === currentWord) {
      // pause before erase
      const timeout = setTimeout(() => setIsDeleting(true), delayBetweenWords);
      return () => clearTimeout(timeout);
    }

    if (isDeleting && displayedText === "") {
      // move to next word
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const nextText = isDeleting
      ? currentWord.slice(0, displayedText.length - 1)
      : currentWord.slice(0, displayedText.length + 1);

    const timeout = setTimeout(
      () => setDisplayedText(nextText),
      isDeleting ? erasingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, words, currentWordIndex, typingSpeed, erasingSpeed, delayBetweenWords]);

  return (
    <span className={`whitespace-nowrap ${className}`}>{displayedText}<span className="border-r-2 border-business-black animate-pulse ml-0.5" />
    </span>
  );
};

export default TypingText;