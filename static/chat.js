// ---------------- MARKDOWN FORMATTING ----------------

function escapeHTML(text) {
    return text.replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}


function renderMarkdown(text) {

    let lines = text.split("\n");
    let html = "";
    let inList = false;
    let inTable = false;
    let tableRows = [];

    function closeList() {
        if (inList) {
            html += "</ul>";
            inList = false;
        }
    }

    function closeTable() {
        if (inTable) {
            html += "<table class='chat-table'>";
            tableRows.forEach((row, index) => {
                let cells = row.split("|").filter((cell, i, arr) =>
                    !(i === 0 && cell.trim() === "") &&
                    !(i === arr.length - 1 && cell.trim() === "")
                );

                html += index === 0 ? "<thead><tr>" : "<tbody><tr>";

                cells.forEach(cell => {
                    html += index === 0
                        ? `<th>${formatInline(cell.trim())}</th>`
                        : `<td>${formatInline(cell.trim())}</td>`;
                });

                html += "</tr>";
                html += index === 0 ? "</thead>" : "</tbody>";
            });

            html += "</table>";
            tableRows = [];
            inTable = false;
        }
    }

    function formatInline(text) {
        return escapeHTML(text)
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/`(.*?)`/g, "<code>$1</code>");
    }

    for (let line of lines) {

        line = line.trim();

        if (!line) {
            closeList();
            closeTable();
            continue;
        }

        // Markdown table
        if (line.includes("|") && line.split("|").length >= 3) {

            closeList();

            if (/^\|?[\s:|-]+\|?$/.test(line)) {
                continue;
            }

            inTable = true;
            tableRows.push(line);
            continue;
        } else {
            closeTable();
        }

        // Headings
        if (line.startsWith("### ")) {
            closeList();
            html += `<h4>${formatInline(line.substring(4))}</h4>`;
        }
        else if (line.startsWith("## ")) {
            closeList();
            html += `<h3>${formatInline(line.substring(3))}</h3>`;
        }
        else if (line.startsWith("# ")) {
            closeList();
            html += `<h2>${formatInline(line.substring(2))}</h2>`;
        }

        // Bullet points
        else if (/^[-*+]\s/.test(line)) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }

            html += `<li>${formatInline(line.substring(2))}</li>`;
        }

        // Numbered lists
        else if (/^\d+[.)]\s/.test(line)) {
            closeList();
            html += `<p>${formatInline(line)}</p>`;
        }

        // Normal paragraph
        else {
            closeList();
            html += `<p>${formatInline(line)}</p>`;
        }
    }

    closeList();
    closeTable();

    return html;
}


// ---------------- CLEAN TEXT FOR VOICE ----------------

function cleanTextForSpeech(text) {

    return text
        .replace(/```[\s\S]*?```/g, "")
        .replace(/\|/g, " ")
        .replace(/^#{1,6}\s*/gm, "")
        .replace(/\*\*/g, "")
        .replace(/[*_~`]/g, "")
        .replace(/^\s*[-+•]\s*/gm, "")
        .replace(/^\s*\d+[.)]\s*/gm, "")
        .replace(/[ \t]+/g, " ")
        .replace(/\n+/g, ". ")
        .trim();
}


// ---------------- VOICE OUTPUT ----------------


// ---------------- VOICE OUTPUT ----------------

let currentSpeechButton = null;
let speechChunks = [];
let currentChunkIndex = 0;
let isSpeechStopped = false;

function speakResponse(text, button) {

    if (!("speechSynthesis" in window)) {
        alert("Voice output is not supported in this browser.");
        return;
    }

    // Stop previous reading
    window.speechSynthesis.cancel();

    // Reset previous button
    if (currentSpeechButton) {
        currentSpeechButton.textContent = "🔊 Listen";
    }

    currentSpeechButton = button;
    isSpeechStopped = false;
    currentChunkIndex = 0;

    const cleanText = cleanTextForSpeech(text);

    // Split long responses into manageable chunks
    speechChunks = cleanText.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    if (speechChunks.length === 0) return;

    button.textContent = "⏹ Stop Reading";

    readNextChunk();
}

function readNextChunk() {

    if (isSpeechStopped ||
        currentChunkIndex >= speechChunks.length) {

        if (currentSpeechButton) {
            currentSpeechButton.textContent = "🔊 Listen";
        }

        return;
    }

    const speech = new SpeechSynthesisUtterance(
        speechChunks[currentChunkIndex].trim()
    );

    speech.lang = "en-IN";
    speech.rate = 0.9;
    speech.pitch = 1;

    speech.onend = function () {
        if (!isSpeechStopped) {
            currentChunkIndex++;
            readNextChunk();
        }
    };

    speech.onerror = function (event) {

        console.error("Speech error:", event.error);

        if (event.error !== "canceled" &&
            event.error !== "interrupted") {

            if (currentSpeechButton) {
                currentSpeechButton.textContent = "🔊 Listen";
            }
        }
    };

    window.speechSynthesis.speak(speech);
}

function stopSpeech() {

    isSpeechStopped = true;

    window.speechSynthesis.cancel();

    if (currentSpeechButton) {
        currentSpeechButton.textContent = "🔊 Listen";
    }

    currentSpeechButton = null;
}

// ---------------- VOICE INPUT ----------------

function startVoiceInput() {

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        alert("Voice input is not supported in this browser. Try Chrome.");
        return;
    }

    const input = document.getElementById("user-message");
    const micButton = document.getElementById("mic-button");

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;

    micButton.textContent = "🎙️ Listening...";
    micButton.disabled = true;

    recognition.onresult = function (event) {
        const spokenText = event.results[0][0].transcript;
        input.value = spokenText;
    };

    recognition.onerror = function (event) {
        console.error("Voice input error:", event.error);
        alert("Could not recognise your voice. Please try again.");
    };

    recognition.onend = function () {
        micButton.textContent = "🎤";
        micButton.disabled = false;
    };

    recognition.start();
}


// ---------------- SEND CHAT MESSAGE ----------------

async function sendMessage() {

    const input = document.getElementById("user-message");
    const messages = document.getElementById("chat-messages");
    const button = document.getElementById("send-button");

    const question = input.value.trim();

    if (!question) return;

    const userDiv = document.createElement("div");
    userDiv.className = "user-message";
    userDiv.textContent = question;

    messages.appendChild(userDiv);

    input.value = "";

    button.disabled = true;
    button.textContent = "Thinking...";

    const loadingDiv = document.createElement("div");
    loadingDiv.className = "bot-message";
    loadingDiv.textContent = "Generating response...";

    messages.appendChild(loadingDiv);

    messages.scrollTop = messages.scrollHeight;

    try {

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: question
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to get a response.");
        }

        const answer = data.answer || "No response received.";

        // Check for emergency response
        const isEmergency =
            answer.includes("POTENTIAL MEDICAL EMERGENCY");

        loadingDiv.className = isEmergency
            ? "bot-message emergency-message"
            : "bot-message";

        // Format AI response
        loadingDiv.innerHTML = renderMarkdown(answer);

        // Voice output button
        const speakButton = document.createElement("button");

        speakButton.textContent = "🔊 Listen";
        speakButton.className = "speak-button";

        speakButton.onclick = function () {

        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {

            stopSpeech();

        } else {

            speakResponse(answer, speakButton);

        }

        };

        loadingDiv.appendChild(speakButton);

    } catch (error) {

        loadingDiv.textContent =
            error.message || "Unable to connect to the server.";

        console.error(error);

    } finally {

        button.disabled = false;
        button.textContent = "Send";

        messages.scrollTop = messages.scrollHeight;
    }
}


// ---------------- ENTER KEY ----------------

document.getElementById("user-message").addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {
            sendMessage();
        }

    }
);