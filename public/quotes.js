
        const quotes = [
            {
                quote: "Believe in yourself and all that you are.",
                author: "Christian D. Larson"
            },
            {
                quote: "The future depends on what you do today.",
                author: "Mahatma Gandhi"
            },
            {
                quote: "Dream big and dare to fail.",
                author: "Norman Vaughan"
            },
            {
                quote: "It always seems impossible until it's done.",
                author: "Nelson Mandela"
            },
            {
                quote: "Great things never come from comfort zones.",
                author: "Unknown"
            },
            {
                quote: "Success is the sum of small efforts repeated daily.",
                author: "Robert Collier"
            },
            {
                quote: "Every day is a fresh beginning.",
                author: "Unknown"
            }
        ];

        function newQuote() {
            const randomIndex = Math.floor(
                Math.random() * quotes.length
            );

            document.getElementById("quote").innerText =
                quotes[randomIndex].quote;

            document.getElementById("author").innerText =
                "— " + quotes[randomIndex].author;
        }
