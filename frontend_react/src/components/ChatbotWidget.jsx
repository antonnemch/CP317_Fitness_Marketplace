import { useState } from "react";
import "../styles/chatbot.css";

export default function ChatbotWidget({ chatOpen, setChatOpen }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hey! How can I help?" },
  ]);

  const predefined = [
    { q: "What is this website?", a: "This is the Fitness Marketplace — browse gear, trainers, and classes!" },
    { q: "What products do you have?", a: "We offer yoga mats, resistance bands, protein powder, and more." },
    { q: "How do I log in?", a: "Click the Login button at the top and enter your email + password." }
  ];

  const ask = (q, a) => {
    setMessages((m) => [...m, { sender: "user", text: q }]);
    setTimeout(() => {
      setMessages((m) => [...m, { sender: "bot", text: a }]);
    }, 500);
  };

  return (
    <>
      {/* Floating open button */}
      {!chatOpen && (
        <button className="chatbot-button" onClick={() => setChatOpen(true)}>
          💬
        </button>
      )}

      {/* Chat window */}
      {chatOpen && (
        <div className="chatbot-box">
          <div className="chat-header">
            <span>Chatbot</span>
            <button className="close-btn" onClick={() => setChatOpen(false)}>×</button>
          </div>

          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender}`}>
                {m.text}
              </div>
            ))}

            <div className="quick-questions">
              {predefined.map((p, i) => (
                <button key={i} onClick={() => ask(p.q, p.a)}>
                  {p.q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
