"use client";

import { useState, useEffect, useRef } from "react";
import { config } from "@/lib/config";

interface Message {
  type:
    | "user_message"
    | "agent_message"
    | "sources"
    | "stream_start"
    | "stream_chunk"
    | "stream_complete"
    | "error";
  message?: string;
  query?: string;
  sources?: string[];
  context_preview?: string;
  chunk?: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStream, setCurrentStream] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const streamRef = useRef<string>(""); // Ref to accumulate stream properly

  const connectWebSocket = () => {
    try {
      ws.current = new WebSocket(config.backendUrl);

      ws.current.onopen = () => {
        console.log("Connected to WebSocket");
        setIsConnected(true);
      };

      ws.current.onmessage = (event) => {
        try {
          const data: Message = JSON.parse(event.data);

          if (data.type === "stream_chunk") {
            // Accumulate streaming chunks in both state and ref
            streamRef.current += data.chunk || "";
            setCurrentStream(streamRef.current);
          } else if (data.type === "stream_complete") {
            // Stream complete - use ref value which is always current
            const fullResponse = streamRef.current;
            setMessages((prev) => [
              ...prev,
              { type: "agent_message", message: fullResponse },
            ]);
            streamRef.current = "";
            setCurrentStream("");
            setIsLoading(false);
          } else if (data.type === "error") {
            setIsLoading(false);
            streamRef.current = "";
            setCurrentStream("");
            setMessages((prev) => [...prev, data]);
          } else {
            // Other message types (user_message, sources, stream_start)
            setMessages((prev) => [...prev, data]);
          }
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      };

      ws.current.onclose = () => {
        console.log("Disconnected from WebSocket");
        setIsConnected(false);
        setIsLoading(false);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
        setIsConnected(false);
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
    }
  };

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (inputMessage.trim() && ws.current && isConnected) {
      setIsLoading(true);
      const message = {
        message: inputMessage.trim(),
      };
      ws.current.send(JSON.stringify(message));
      setInputMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reconnect = () => {
    connectWebSocket();
  };

  return (
    <div className="flex flex-col h-screen dark bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 shadow-sm border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">
            AI RAG Chat Assistant
          </h1>
          <div className="flex items-center space-x-2">
            <div
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className="text-sm text-gray-300">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            {!isConnected && (
              <button
                onClick={reconnect}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={isConnected}
              >
                Reconnect
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 mt-8">
              <p className="text-white">
                Start a conversation with the AI assistant!
              </p>
              <p className="text-sm mt-2 text-gray-400">
                Ask anything and I&apos;ll help you find answers.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.type === "user_message" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-2xl px-4 py-2 rounded-lg ${
                  msg.type === "user_message"
                    ? "bg-blue-500 text-white"
                    : msg.type === "agent_message"
                      ? "bg-gray-700 text-white"
                      : msg.type === "sources"
                        ? "bg-emerald-900 text-emerald-100 border border-emerald-600"
                        : msg.type === "error"
                          ? "bg-red-900 text-red-100 border border-red-600"
                          : "bg-gray-800 text-gray-300"
                }`}
              >
                {msg.type === "user_message" && (
                  <div>
                    <div className="font-semibold text-sm mb-1 text-blue-200">
                      You:
                    </div>
                    <div>{msg.message}</div>
                  </div>
                )}

                {msg.type === "agent_message" && (
                  <div>
                    <div className="font-semibold text-sm mb-1 text-gray-300">
                      Assistant:
                    </div>
                    <div className="whitespace-pre-wrap">{msg.message}</div>
                  </div>
                )}

                {msg.type === "sources" && (
                  <div>
                    <div className="font-semibold text-sm mb-1 text-emerald-200">
                      📚 Fuente encontrada:
                    </div>
                    <div className="text-sm">
                      {msg.sources?.map((source, i) => (
                        <div key={i} className="ml-2 font-medium">
                          {source}
                        </div>
                      ))}
                    </div>
                    {msg.context_preview && (
                      <div className="mt-2 text-xs text-emerald-300 italic border-l-2 border-emerald-600 pl-2">
                        &ldquo;{msg.context_preview}&rdquo;
                      </div>
                    )}
                  </div>
                )}

                {msg.type === "error" && (
                  <div>
                    <div className="font-semibold text-sm mb-1 text-red-200">
                      ⚠️ Error:
                    </div>
                    <div>{msg.message}</div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Show current streaming response */}
          {isLoading && currentStream && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg max-w-2xl">
                <div className="font-semibold text-sm mb-1 text-gray-300">
                  Assistant:
                </div>
                <div className="whitespace-pre-wrap">{currentStream}</div>
              </div>
            </div>
          )}

          {isLoading && !currentStream && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-gray-800 border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={!isConnected || isLoading}
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400"
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || isLoading || !inputMessage.trim()}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>

          {!isConnected && (
            <div className="mt-2 text-sm text-red-400">
              ⚠️ Disconnected from server. Please check the connection and try
              reconnecting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
