"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// Função simples para converter markdown básico para HTML
function simpleMarkdown(text) {
  if (!text) return '';
  
  // Código inline (com ` `)
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Blocos de código (com ```)
  text = text.replace(/```(\w*)\n([\s\S]*?)\n```/g, '<pre><code class="language-$1">$2</code></pre>');
  
  // Cabeçalhos
  text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>');
  text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>');
  text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>');
  
  // Negrito e itálico
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Listas não ordenadas
  text = text.replace(/^\s*[-*+]\s+(.*$)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
  
  // Listas ordenadas
  text = text.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>');
  text = text.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
  
  // Blockquotes
  text = text.replace(/^\> (.*$)/gm, '<blockquote>$1</blockquote>');
  
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  
  // Parágrafos (linhas separadas por quebras de linha)
  text = text.split(/\n\n+/).map(para => {
    if (!para.trim()) return '';
    if (para.startsWith('<h') || para.startsWith('<ul') || para.startsWith('<ol') || 
        para.startsWith('<pre') || para.startsWith('<blockquote>')) {
      return para;
    }
    return `<p>${para}</p>`;
  }).join('');
  
  return text;
}

function Chat() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Função para rolar automaticamente para o final da conversa
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const userMessage = { message: newMessage, isUser: true };
    setMessages([...messages, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Corrigido a URL do backend
      const response = await axios.post(
        "http://sua-api.com.br/message",
        { message: newMessage },
        {
          headers: {
            "Content-type": "application/json", //; charset=UTF-8",
          },
        }
      );

      setMessages((prevMessages) => [
        ...prevMessages,
        { message: response.data.response, isUser: false },
      ]);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { 
          message: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
          isUser: false 
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[80vh]">
      {/* Cabeçalho do Chat */}
      <div className="bg-gray-800 text-white p-4 rounded-t-lg">
        <h1 className="text-xl font-bold text-center">Chat-IA</h1>
      </div>

      {/* Área de mensagens */}
      <div className="flex-grow overflow-y-auto bg-gray-50 p-4 rounded-b-lg shadow-inner">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400">
            <p>Envie uma mensagem para começar a conversa...</p>
          </div>
        ) : (
          <ul className="space-y-6">
            {messages.map((msg, index) => (
              <li key={index} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-3xl p-4 rounded-lg shadow ${
                    msg.isUser
                      ? "bg-indigo-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 rounded-bl-none"
                  }`}
                >
                  {msg.isUser ? (
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                  ) : (
                    <div 
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{ __html: simpleMarkdown(msg.message) }}
                    />
                  )}
                </div>
              </li>
            ))}
            {isLoading && (
              <li className="flex justify-start">
                <div className="bg-white p-4 rounded-lg shadow border border-gray-200 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                </div>
              </li>
            )}
            <div ref={messagesEndRef} />
          </ul>
        )}
      </div>

      {/* Formulário de input */}
      <form 
        className="mt-4 flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-300 shadow-sm" 
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Digite sua mensagem..."
          //className="flex-grow p-2 outline-none bg-transparent"
          className="flex-grow p-2 outline-none bg-transparent text-black"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !newMessage.trim()}
          className={`p-2 rounded-md ${
            isLoading || !newMessage.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          } transition-colors`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

export default Chat;