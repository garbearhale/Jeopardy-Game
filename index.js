let categories = [{
        title: "Music",
        clues: [
            { question: "Which artist sings Faithfully?", answer: "Steve Perry", showing: null },
            { question: "What is David Archuleta's most popular song?", answer: "Crush", showing: null },
            { question: "An instrument you play with your hands and foot", answer: "drumbs" || "piano", showing: null },
            { question: "What instrument does Kenny G play", answer: "Saxophone", showing: null },
            { question: "When was the best decade for music?", answer: "80s", showing: null }
        ],
    },
    {
        title: "Scriptures",
        clues: [
            { question: "Which scripture says I will make weak things become strong", answer: "Ether 12:27", showing: null },
            { question: "This charactor says I will go and do", answer: "Nephi", showing: null },
            { question: "How many prophets are in the Book of Mormon?", answer: "19", showing: null },
            { question: "Did Nephi have any sisters?", answer: "Yes", showing: null },
            { question: "Did Coriantimur die at the end of Ether when the battle finished?", answer: "No", showing: null },
        ],
    },
    {
        title: "Movies",
        clues: [
            { question: "We're all in this together", answer: "High School Musical", showing: null },
            { question: "It's so fluffy I'm gonna die!!", answer: "Dispicable Me", showing: null },
            { question: "How many spider man movies are there?", answer: 9, showing: null },
            { question: "This is the way", answer: "Mandalorian", showing: null },
            { question: "Life is like a box of chocolates, you never know what you're going to get", answer: "Forrest Gump", showing: null }
        ],
    },
    {
        title: "Books",
        clues: [
            { question: "Who's the author of Fable Haven?", answer: "Brandon Mull", showing: null },
            { question: "Book Series about a world in a Wardrobe", answer: "Narnia", showing: null },
            { question: "I remain alone to write the sad tale of the destruction of my people", answer: "Book of Mormon", showing: null },
            { question: "How many Harry Potter books are there?", answer: "8", showing: null },
            { question: "Who is this quote by? 'The fool doth think he is wise, but the wise man knows himself to be a fool'", answer: "Shakespeare", showing: null },
        ],
    },
    {
        title: "Random",
        clues: [
            { question: "What is 23 * 41?", answer: "943", showing: null },
            { question: "What did Nephi and his brothers have to get when they went back to Jerusulem?", answer: "Brass Plates", showing: null },
            { question: "Keep the change, ya filthy animal", answer: "Home Alone", showing: null },
            { question: "What's the tallest Dinosaur?", answer: "Brachiosaurus", showing: null },
            { question: "'Tell everybody I'm on my way' what movie has this song?", answer: "Brother Bear", showing: null },
        ],
    },
    {
        title: "Science",
        clues: [
            { question: "A black hole is formed by a", answer: "Supernova explosion", showing: null },
            { question: "First person to land on moon", answer: "Neil Armstrong", showing: null },
            { question: "A thing you use to look at the stars", answer: "telescope", showing: null },
            { question: "An animal in the ocean that surfaces for air", answer: "dolphin", showing: null },
            { question: "If an object is moving away from you is it known as redshift or blueshift?", answer: "redshift", showing: null },
        ],
    },
];

class TriviaGameShow {
    constructor(element, options = {}) {
        this.categories = [];
        this.clues = {};

        this.currentClue = null;
        this.score = 0;

        this.boardElement = element.querySelector(".board");
        this.scoreCountElement = element.querySelector(".score-count");
        this.formElement = element.querySelector("form");
        this.inputElement = element.querySelector("input[name=user-answer]");
        this.modalElement = element.querySelector(".card-modal");
        this.clueTextElement = element.querySelector(".clue-text");
        this.resultElement = element.querySelector(".result");
        this.resultTextElement = element.querySelector(".result_correct-answer-text");
        this.successTextElement = element.querySelector(".result_success");
        this.failTextElement = element.querySelector(".result_fail");
    }

    initGame() {
        this.boardElement.addEventListener("click", event => {
            if (event.target.dataset.clueId) {
                this.handleClueClick(event);
            }
        });
        this.formElement.addEventListener("submit", event => {
            this.handleFormSubmit(event);
        });

        this.updateScore(0);

        this.fetchCategories();
    }
    fetchCategories() {
        Promise.all(categories).then(results => {

            results.forEach((result, categoryIndex) => {

                var category = {
                    title: result.title,
                    clues: []
                }

                var clues = shuffle(result.clues).splice(0, 5).forEach((clue, index) => {
                    console.log(clue)

                    var clueId = categoryIndex + "-" + index;
                    category.clues.push(clueId);

                    this.clues[clueId] = {
                        question: clue.question,
                        answer: clue.answer,
                        value: (index + 1) * 100
                    };
                })

                this.categories.push(category);
            });

            this.categories.forEach((c) => {
                this.renderCategory(c);
            });
        });
    }

    renderCategory(category) {
        let column = document.createElement("div");
        column.classList.add("column");
        column.innerHTML = (
            `<header>${category.title}</header>
      <ul>
      </ul>`
        ).trim();

        var ul = column.querySelector("ul");
        category.clues.forEach(clueId => {
            var clue = this.clues[clueId];
            ul.innerHTML += `<li><button data-clue-id=${clueId}>${clue.value}</button></li>`
        })

        this.boardElement.appendChild(column);
    }

    updateScore(change) {
        this.score += change;
        this.scoreCountElement.textContent = this.score;
    }

    handleClueClick(event) {
        var clue = this.clues[event.target.dataset.clueId];

        event.target.classList.add("used");

        this.inputElement.value = "";

        this.currentClue = clue;

        this.clueTextElement.textContent = this.currentClue.question;
        this.resultTextElement.textContent = this.currentClue.answer;

        this.modalElement.classList.remove("showing-result");

        this.modalElement.classList.add("visible");
        this.inputElement.focus();
    }

    handleFormSubmit(event) {
        event.preventDefault();

        var isCorrect = this.cleanseAnswer(this.inputElement.value) === this.cleanseAnswer(this.currentClue.answer);
        if (isCorrect) {
            this.updateScore(this.currentClue.value);
        }

        this.revealAnswer(isCorrect);
    }

    cleanseAnswer(input = "") {
        var friendlyAnswer = input.toLowerCase();
        friendlyAnswer = friendlyAnswer.replace("<i>", "");
        friendlyAnswer = friendlyAnswer.replace("</i>", "");
        friendlyAnswer = friendlyAnswer.replace(/ /g, "");
        friendlyAnswer = friendlyAnswer.replace(/"/g, "");
        friendlyAnswer = friendlyAnswer.replace(/^a /, "");
        friendlyAnswer = friendlyAnswer.replace(/^an /, "");
        return friendlyAnswer.trim();
    }


    revealAnswer(isCorrect) {
        this.successTextElement.style.display = isCorrect ? "block" : "none";
        this.failTextElement.style.display = !isCorrect ? "block" : "none";

        this.modalElement.classList.add("showing-result");

        setTimeout(() => {
            this.modalElement.classList.remove("visible");
        }, 3000);
    }

}

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

const game = new TriviaGameShow(document.querySelector(".app"), {});
game.initGame();