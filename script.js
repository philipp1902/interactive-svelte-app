const animalFacts = {};

async function getAnimalFacts() {
    const animals = ['lion', 'elephant', 'penguin', 'giraffe', 'zebra', 'monkey'];
    const prompt = `Give me exactly 3 interesting facts for each of these animals: ${animals.join(', ')}. 
                    Format: Return a JSON object where each animal is a key and its value is an array of exactly 3 facts.
                    Example format: {"lion": ["fact1", "fact2", "fact3"], "elephant": ["fact1", "fact2", "fact3"], ...}`;

    try {
        const response = await fetch('your-api-endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7
            })
        });

        const data = await response.json();
        const facts = JSON.parse(data.choices[0].message.content);
        return facts;
    } catch (error) {
        console.error('Error fetching animal facts:', error);
        return null;
    }
}

// Initialize tooltips with Tippy.js
function initializeTooltips(facts) {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const animal = card.getAttribute('data-animal');
        const animalFacts = facts[animal];
        
        if (animalFacts) {
            const content = `
                <ul style="list-style-type: disc; padding-left: 20px; margin: 0;">
                    ${animalFacts.map(fact => `<li>${fact}</li>`).join('')}
                </ul>
            `;

            tippy(card, {
                content: content,
                allowHTML: true,
                placement: 'top',
                arrow: true,
                theme: 'custom',
                interactive: true,
                maxWidth: 300,
            });
        }
    });
}

// Load facts when page loads
window.addEventListener('DOMContentLoaded', async () => {
    const facts = await getAnimalFacts();
    if (facts) {
        initializeTooltips(facts);
    }
});
