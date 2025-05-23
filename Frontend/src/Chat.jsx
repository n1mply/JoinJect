import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "@phosphor-icons/react";
import "./Chat.css";

export default function Chat({ apiClient }) {
  const { routerUsername } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const ws = useRef(null); // WebSocket-соединение
  const messagesEndRef = useRef(null); // Для автоскролла

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await apiClient.get("/me");
        setCurrentUser(response.data.username);
      } catch (error) {
        console.error("Ошибка при получении пользователя:", error);
      }
    };
    fetchCurrentUser();
  }, [apiClient]);

  useEffect(() => {
    if (!currentUser || !routerUsername) return;

    const wsUrl = `ws://${window.location.hostname}:8000/ws`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
        console.log("WebSocket подключён");
        // Отправляем инициализационное сообщение с получателем
        ws.current.send(JSON.stringify({
            receiver: routerUsername
        }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "history") {
        setMessages(data.messages);
      } else if (data.type === "new_message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket отключён");
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [currentUser, routerUsername]);

  // Автоскролл при новых сообщениях
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Отправка сообщения
  const sendMessage = () => {
    if (!messageText.trim() || !ws.current || !currentUser) return;

    const message = {
      receiver: routerUsername,
      text: messageText,
    };

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      setMessageText("");
    }
  };

  // Отправка по нажатию Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!currentUser) return <div>Загрузка...</div>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={() => navigate(-1)}>
          <ArrowLeft size={24} />
        </button>
        <h2>Чат с {routerUsername}</h2>
      </div>

      <div className="messages-area">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.sender === currentUser ? "sent" : "received"
            }`}
          >
            <p>{msg.text}</p>
            <span className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Напишите сообщение..."
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
}