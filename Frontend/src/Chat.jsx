import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PaperPlaneTilt } from "@phosphor-icons/react";
import "./Chat.css";

export default function Chat({ apiClient, currentChat }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const ws = useRef(null); // WebSocket-соединение

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
      const loadHistory = async () => {
        try{
            const res = await apiClient.get(`/messages/${currentChat}`);
            console.log(res)
            setMessages(res.data.history);
        } catch (error) {
          console.error("Can't get chat history:", error);
        }

    };
    loadHistory();
  }, [currentChat]);

  useEffect(() => {
    if (!currentUser || !currentChat) return;

    const wsUrl = `ws://${window.location.hostname}:8000/ws`;
    ws.current = new WebSocket(wsUrl);

    ws.current.onopen = () => {
        console.log("WebSocket подключён");
        ws.current.send(JSON.stringify({
            receiver: currentChat
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
  }, [currentUser, currentChat]);

  const sendMessage = () => {
    if (!messageText.trim() || !ws.current || !currentUser) return;

    const message = {
      receiver: currentChat,
      text: messageText,
    };

    if (ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      setMessageText("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  if (!currentUser) return <div>Loading...</div>;

  if (!currentChat){
      return (
      <div className="chat-start">
              <p style={{display: 'flex', textAlign: 'center', justifyContent: 'center', alignItems: 'center'}}>Choose chat, to start</p>
      </div>) 
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>{currentChat}</h2>
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
        <div/>
      </div>

      <div className="message-input">
        <input
          type="text"
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Text message..."
        />
        <PaperPlaneTilt className="send-button" size={40} color="#6582ff" onClick={sendMessage}/>
      </div>
    </div>
  );
}