async function loadChatHistory() {

    const container = document.getElementById("chat-history-container");
    const messagesContainer = document.getElementById("chat-messages-container");

    container.textContent = "Loading conversations...";
    messagesContainer.innerHTML = "";

    try {

        const response = await fetch("/api/chat-history");
        const data = await response.json();

        if (!response.ok) {
            container.textContent = data.error || "Unable to load chat history.";
            return;
        }

        container.innerHTML = "";

        if (!data.conversations || data.conversations.length === 0) {
            container.textContent = "No previous conversations found.";
            return;
        }

        data.conversations.forEach(conversation => {

            const card = document.createElement("div");
            card.className = "history-card";

            const title = document.createElement("h3");
            title.textContent = conversation.title;

            const date = document.createElement("p");
            date.textContent = "Created: " + conversation.created_at;

            const button = document.createElement("button");
            button.textContent = "View Conversation";

            button.addEventListener("click", () => {
                loadConversation(conversation.conversation_id);
            });

            card.appendChild(title);
            card.appendChild(date);
            card.appendChild(button);

            container.appendChild(card);

        });

    } catch (error) {

        console.error("Chat History Error:", error);
        container.textContent = "Unable to load conversations.";

    }
}


async function loadConversation(conversationId) {

    const messagesContainer = document.getElementById("chat-messages-container");

    messagesContainer.textContent = "Loading messages...";

    try {

        const response = await fetch(`/api/chat-history/${conversationId}`);
        const data = await response.json();

        if (!response.ok) {
            messagesContainer.textContent = data.error || "Unable to load messages.";
            return;
        }

        messagesContainer.innerHTML = "";

        if (!data.messages || data.messages.length === 0) {
            messagesContainer.textContent = "No messages found.";
            return;
        }

        const heading = document.createElement("h3");
        heading.textContent = "Conversation Messages";
        messagesContainer.appendChild(heading);

        data.messages.forEach(message => {

            const messageCard = document.createElement("div");
            messageCard.className = "history-card";

            const sender = document.createElement("strong");
            sender.textContent = message.sender === "user" ? "You" : "MediVision AI";

            const content = document.createElement("p");
            content.textContent = message.message;

            messageCard.appendChild(sender);
            messageCard.appendChild(content);

            messagesContainer.appendChild(messageCard);

        });

    } catch (error) {

        console.error("Conversation Error:", error);
        messagesContainer.textContent = "Unable to load messages.";

    }
}