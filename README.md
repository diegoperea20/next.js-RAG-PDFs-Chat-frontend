# Next.js RAG PDFs Chat frontend

This is a Next.js application for a RAG (Retrieval-Augmented Generation) chat interface that connects to a FastAPI backend.


<p align="center">
  <img src="README-images/chat1.png" alt="Step1">
</p>

<p align="center">
  <img src="README-images/chat2.png" alt="Step1">
</p>



# Backend

The backend is a FastAPI application that provides the RAG functionality. It is located in the `backend` directory.

[BACKEND URL](https://github.com/diegoperea20/FastAPI-LangChain-RAG-PDFs-Qdrant)

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Backend server running ( FastAPI application)

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   ```

2. **Install dependencies**:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Environment Configuration**:

   Create a `.env` file in the root directory:

   ```env
BACKEND_URL=http://localhost:8000
   ```

   The backend URL defaults to `http://localhost:8000` if not specified.

### Development

1. **Start the development server**:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

2. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

3. **Ensure backend is running**:
   Make sure the AgentchatVisual backend is running on port 8000 before starting the frontend.

### Production Build

1. **Build the application**:

   ```bash
   npm run build
   ```

2. **Start production server**:
   ```bash
   npm start
   ```



### 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author / Autor

**Diego Ivan Perea Montealegre**

- GitHub: [@diegoperea20](https://github.com/diegoperea20)

---

Created by [Diego Ivan Perea Montealegre](https://github.com/diegoperea20)