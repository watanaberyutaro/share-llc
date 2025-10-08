// Typing Animation for Hero Title
(function() {
    'use strict';

    // Configuration
    const config = {
        typingSpeed: 80,        // milliseconds per character
        lineBreakDelay: 400,    // delay before starting new line
        startDelay: 1500,       // delay before starting animation
        cursorBlinkAfter: 800   // how long cursor blinks after completion
    };

    function initTypingAnimation() {
        // Find the hero title
        const heroTitle = document.querySelector('.mv-text-center h2');
        if (!heroTitle) return;

        // Store original style
        const originalStyle = heroTitle.getAttribute('style') || '';

        // Get the original text content
        const fullText = heroTitle.innerHTML;

        // Split by <br> tags to handle line breaks
        const lines = fullText.split(/<br\s*\/?>/i).map(line => line.trim()).filter(line => line.length > 0);

        // Add typing class
        heroTitle.classList.add('hero-title-typing');

        // Preserve original styles
        if (originalStyle) {
            heroTitle.setAttribute('style', originalStyle);
        }

        // Clear content and prepare structure
        heroTitle.innerHTML = '';

        let currentLineIndex = 0;
        let currentCharIndex = 0;
        let isTyping = false;

        // Create line containers
        const lineElements = lines.map((line, index) => {
            const lineSpan = document.createElement('span');
            lineSpan.className = 'typing-line';
            heroTitle.appendChild(lineSpan);

            // Add br element after each line except the last
            if (index < lines.length - 1) {
                heroTitle.appendChild(document.createElement('br'));
            }

            return lineSpan;
        });

        // Create cursor
        const cursor = document.createElement('span');
        cursor.className = 'typing-cursor';

        // Start typing after delay
        setTimeout(() => {
            startTyping();
        }, config.startDelay);

        function startTyping() {
            if (currentLineIndex >= lines.length) {
                // Animation complete
                completeAnimation();
                return;
            }

            isTyping = true;
            const currentLine = lines[currentLineIndex];
            const currentElement = lineElements[currentLineIndex];

            // Add cursor to current line
            if (!currentElement.contains(cursor)) {
                currentElement.appendChild(cursor);
            }

            if (currentCharIndex < currentLine.length) {
                // Type next character
                const char = currentLine[currentCharIndex];
                const textNode = document.createTextNode(char);
                currentElement.insertBefore(textNode, cursor);
                currentCharIndex++;

                setTimeout(startTyping, config.typingSpeed);
            } else {
                // Current line complete, move to next
                currentLineIndex++;
                currentCharIndex = 0;

                if (currentLineIndex < lines.length) {
                    // Remove cursor from current line and add to next
                    cursor.remove();
                    setTimeout(startTyping, config.lineBreakDelay);
                } else {
                    // All lines complete
                    setTimeout(completeAnimation, config.cursorBlinkAfter);
                }
            }
        }

        function completeAnimation() {
            heroTitle.classList.add('typing-complete');
            isTyping = false;
        }
    }

    // Run after loading screen finishes
    window.addEventListener('load', () => {
        // Wait for loading screen to finish
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            // Check if loading screen is already hidden
            const checkLoadingComplete = setInterval(() => {
                if (loadingScreen.style.opacity === '0' ||
                    loadingScreen.style.display === 'none' ||
                    window.getComputedStyle(loadingScreen).opacity === '0') {
                    clearInterval(checkLoadingComplete);
                    setTimeout(initTypingAnimation, 500);
                }
            }, 100);

            // Fallback: start after 4 seconds regardless
            setTimeout(() => {
                clearInterval(checkLoadingComplete);
                initTypingAnimation();
            }, 4000);
        } else {
            // No loading screen, start immediately
            initTypingAnimation();
        }
    });
})();
