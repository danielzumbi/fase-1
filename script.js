document.addEventListener("DOMContentLoaded", () => {
    // Elementos da UI
    const loadingScreen = document.getElementById("loading-screen");
    const homeScreen = document.getElementById("home-screen");
    const gameScreen = document.getElementById("game-screen");
    const feedbackScreen = document.getElementById("feedback-screen");
    const statsScreen = document.getElementById("stats-screen");

    const startBtn = document.getElementById("start-btn");
    const questionText = document.getElementById("question-text");
    const bananasContainer = document.getElementById("bananas-container");
    const optionsContainer = document.getElementById("options-container");
    const questionCounter = document.getElementById("question-counter");
    const scoreDisplay = document.getElementById("score");

    const feedbackIcon = document.getElementById("feedback-icon");
    const feedbackTitle = document.getElementById("feedback-title");
    const feedbackMessage = document.getElementById("feedback-message");
    const correctAnswerDisplay = document.getElementById("correct-answer-display");
    const correctNumber = document.getElementById("correct-number");
    const continueBtn = document.getElementById("continue-btn");

    const hintBtn = document.getElementById("hint-btn");
    const hintModal = document.getElementById("hint-modal");
    const closeHintBtn = document.getElementById("close-hint-btn");

    const totalQuestionsDisplay = document.getElementById("total-questions");
    const correctAnswersDisplay = document.getElementById("correct-answers");
    const accuracyDisplay = document.getElementById("accuracy");
    const totalScoreDisplay = document.getElementById("total-score");
    const playAgainBtn = document.getElementById("play-again-btn");

    // Estado do Jogo
    let currentQuestion = null;
    let score = 0;
    let questionNumber = 0;
    let totalQuestions = 0;
    let correctAnswers = 0;

    // API Base URL
    const API_BASE_URL = "http://localhost:3000";

    // --- Funções de Controle de Tela ---
    function showScreen(screen ) {
        [loadingScreen, homeScreen, gameScreen, feedbackScreen, statsScreen].forEach(s => s.classList.add("hidden"));
        screen.classList.remove("hidden");
    }

    // --- Lógica do Jogo ---
    async function fetchQuestion() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/gerar-questao`);
            if (!response.ok) {
                throw new Error("Erro ao buscar questão do servidor.");
            }
            const data = await response.json();
            if (data.sucesso) {
                currentQuestion = data.questao;
                displayQuestion(currentQuestion);
            } else {
                throw new Error(data.erro || "Erro desconhecido ao gerar questão.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert(error.message);
        }
    }

    function displayQuestion(question) {
        questionNumber++;
        totalQuestions++;

        questionText.textContent = question.pergunta;
        questionCounter.textContent = `Questão ${questionNumber}`;
        scoreDisplay.textContent = score;

        // Limpar containers
        bananasContainer.innerHTML = "";
        optionsContainer.innerHTML = "";

        // Exibir bananas
        for (let i = 0; i < question.quantidadeCorreta; i++) {
            const banana = document.createElement("div");
            banana.className = "banana-item";
            banana.style.animationDelay = `${Math.random() * 1}s`;
            bananasContainer.appendChild(banana);
        }

        // Exibir opções
        question.opcoes.forEach(option => {
            const button = document.createElement("button");
            button.className = "option-btn";
            button.textContent = option;
            button.dataset.answer = option;
            button.addEventListener("click", handleAnswerSelection);
            optionsContainer.appendChild(button);
        });
    }

    async function handleAnswerSelection(event) {
        const selectedAnswer = parseInt(event.target.dataset.answer);

        // Desabilitar botões para evitar múltiplos cliques
        document.querySelectorAll(".option-btn").forEach(btn => btn.disabled = true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/verificar-resposta`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    questaoId: currentQuestion.id,
                    respostaSelecionada: selectedAnswer,
                    respostaCorreta: currentQuestion.quantidadeCorreta,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao verificar resposta.");
            }

            const result = await response.json();
            if (result.sucesso) {
                showFeedback(result.correto, result.mensagem, result.respostaCorreta);
                if (result.correto) {
                    score += 10;
                    correctAnswers++;
                }
            } else {
                throw new Error(result.erro || "Erro desconhecido ao verificar resposta.");
            }
        } catch (error) {
            console.error("Erro:", error);
            alert(error.message);
            document.querySelectorAll(".option-btn").forEach(btn => btn.disabled = false);
        }
    }

    function showFeedback(isCorrect, message, correctAnswer) {
        feedbackTitle.textContent = isCorrect ? "🎉 Resposta Correta! 🎉" : "🤔 Resposta Incorreta 🤔";
        feedbackMessage.textContent = message;
        feedbackIcon.textContent = isCorrect ? "✅" : "❌";
        feedbackIcon.className = isCorrect ? "feedback-icon correct" : "feedback-icon incorrect";

        if (!isCorrect) {
            correctNumber.textContent = correctAnswer;
            correctAnswerDisplay.classList.remove("hidden");
        } else {
            correctAnswerDisplay.classList.add("hidden");
        }

        showScreen(feedbackScreen);
    }

    function updateStats() {
        totalQuestionsDisplay.textContent = totalQuestions;
        correctAnswersDisplay.textContent = correctAnswers;
        const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
        accuracyDisplay.textContent = `${accuracy}%`;
        totalScoreDisplay.textContent = score;
    }

    // --- Event Listeners ---
    startBtn.addEventListener("click", () => {
        showScreen(gameScreen);
        fetchQuestion();
    });

    continueBtn.addEventListener("click", () => {
        if (questionNumber % 5 === 0) {
            updateStats();
            showScreen(statsScreen);
        } else {
            showScreen(gameScreen);
            fetchQuestion();
        }
    });

    hintBtn.addEventListener("click", () => {
        hintModal.classList.remove("hidden");
    });

    closeHintBtn.addEventListener("click", () => {
        hintModal.classList.add("hidden");
    });

    playAgainBtn.addEventListener("click", () => {
        showScreen(gameScreen);
        fetchQuestion();
    });

    // --- Inicialização ---
    function initialize() {
        setTimeout(() => {
            showScreen(homeScreen);
        }, 1500);
    }

    initialize();
});
