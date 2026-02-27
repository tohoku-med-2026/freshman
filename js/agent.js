// AI Agent Logic
// Simple Client-Side Retrieval-Based Chatbot

class AIAgent {
    constructor(data) {
        this.knowledgeBase = data;
    }

    // Tokenize input string into keywords
    tokenize(text) {
        // Simple tokenization: remove punctuation, split by space
        // For Japanese, this is rudimentary but sufficient for keyword matching
        // In a real app, a morphological analyzer (like Kuromoji.js) would be better
        return text.replace(/[!?,.！?、。]/g, ' ').split(/\s+/).filter(t => t.length > 0);
    }

    // Calculate relevance score
    calculateScore(query, item) {
        let score = 0;
        const queryTerms = this.tokenize(query.toLowerCase());

        // Check for matches in keywords
        item.keywords.forEach(keyword => {
            queryTerms.forEach(term => {
                if (query.includes(keyword) || keyword.includes(term)) {
                    score += 1;
                }
            });
        });

        return score;
    }

    // Generate response
    generateResponse(userQuery) {
        let bestMatch = null;
        let maxScore = 0;

        // Iterate through knowledge base to find the best match
        this.knowledgeBase.forEach(item => {
            const score = this.calculateScore(userQuery, item);
            if (score > maxScore) {
                maxScore = score;
                bestMatch = item;
            }
        });

        // Threshold for a "good" match
        if (maxScore > 0 && bestMatch) {
            return bestMatch.answer;
        } else {
            return "すみません、よくわかりませんでした。「入学式はいつ？」「パソコンのスペックは？」のように聞いてみてください。";
        }
    }
}

// Global instance
const agent = new AIAgent(qaData);
