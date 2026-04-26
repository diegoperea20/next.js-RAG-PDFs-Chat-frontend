// Configuration file for the application
export const config = {
  backendUrl: process.env.BACKEND_URL || "ws://localhost:8000/ws/chat",
  app: {
    name: "AI RAG Chat Assistant",
    version: "1.0.0",
  },
};

export type Config = typeof config;