# TodoFlow - AI-Powered Task Management Application

A full-stack task management application with an intelligent AI chatbot assistant powered by Google Gemini. Built with FastAPI (backend) and Next.js (frontend).

## Features

- ✅ **Task Management**: Create, update, delete, and organize tasks
- 🤖 **AI Assistant**: Natural language task management via chatbot
- 🔐 **Authentication**: Secure user registration and login
- 💬 **Chat History**: Persistent conversation history
- 🎨 **Modern UI**: Beautiful, responsive interface with dark mode
- ☁️ **Cloud Database**: Powered by Neon PostgreSQL

## Tech Stack

### Backend
- **Framework**: FastAPI
- **Database**: PostgreSQL (Neon)
- **ORM**: SQLModel
- **AI**: OpenAI-compatible API (Gemini, OpenAI, etc.)
- **MCP**: Model Context Protocol for tool calling
- **Auth**: JWT-based authentication

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL Database** (we recommend [Neon](https://neon.tech))
- **Google AI Studio API Key** or OpenAI API Key

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Todo-AI-Chatbot.git
cd Todo-AI-Chatbot
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration (see below)

# Run the backend server
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration (see below)

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Environment Configuration

### Backend (.env)

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# LLM Configuration
OPENAI_API_KEY=your_gemini_or_openai_api_key
OPENAI_API_BASE=https://generativelanguage.googleapis.com/v1beta/openai/
LLM_MODEL=gemini-flash-latest

# JWT Configuration
JWT_SECRET=your_generated_secret_here  # Generate: openssl rand -hex 32
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# CORS Origins
CORS_ORIGINS=http://localhost:3000,https://your-frontend-url.vercel.app

# Environment (optional, defaults to development)
ENVIRONMENT=development
```

**Getting API Keys:**
- **Gemini**: https://aistudio.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys
- **Neon Database**: https://console.neon.tech

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Deployment

### Backend Deployment (Railway / Render)

1. **Create a new project** on Railway or Render
2. **Connect your repository**
3. **Set environment variables** (all from `.env`)
4. **Add**: `ENVIRONMENT=production`
5. **Deploy!**

**Important**: Make sure to update `CORS_ORIGINS` with your frontend URL.

### Frontend Deployment (Vercel)

1. **Import your repository** to Vercel
2. **Set environment variables**:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL
3. **Deploy!**

**Note**: Update your backend's `CORS_ORIGINS` to include your Vercel URL.

## Usage

### Task Management
- Click "Add Task" to create new tasks
- Click on tasks to mark them as complete
- Use the three-dot menu to edit or delete tasks

### AI Chatbot
1. Click the chat icon to open the AI assistant
2. Use natural language commands:
   - "Add a task to buy groceries"
   - "Mark 'buy groceries' as done"
   - "Delete my completed tasks"
   - "Show me all my pending tasks"

The AI will automatically execute the appropriate actions!

## Development

### Backend Structure
```
backend/
├── app/
│   ├── routers/        # API endpoints
│   ├── services/       # Business logic
│   ├── agent.py        # AI orchestration
│   ├── mcp_server.py   # Tool definitions
│   ├── models.py       # Database models
│   └── main.py         # App entry point
└── requirements.txt
```

### Frontend Structure
```
frontend/
├── app/               # Next.js pages
├── components/        # React components
├── lib/               # Utilities & API client
└── public/            # Static assets
```

## Troubleshooting

### Backend Issues

**"DATABASE_URL not set"**
- Ensure `.env` file exists and contains `DATABASE_URL`

**"Module 'openai' not found"**
- Activate virtual environment and run `pip install -r requirements.txt`

**AI not executing tools**
- Verify `OPENAI_API_KEY` is valid
- Check backend logs for tool execution

### Frontend Issues

**"Network Error"**
- Verify backend is running on the correct port
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Ensure CORS is configured correctly

**Build Failures**
- Run `npm install` to ensure all dependencies are installed
- Check for TypeScript errors

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for learning or personal use!

## Support

If you encounter any issues, please open an issue on GitHub or contact the maintainers.

---

**Built with ❤️ for productive task management**
