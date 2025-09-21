# ChatGPT

A modern, AI-powered chat application built with Next.js 15, featuring advanced file uploads, chat persistence, and responsive design.

![ChatGPT](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=for-the-badge&logo=mongodb)
![Clerk](https://img.shields.io/badge/Clerk-Auth-purple?style=for-the-badge)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Environment Setup](#-environment-setup)
- [Installation](#-installation)
- [Project Structure](#-project-structure)
- [Authentication (Clerk)](#-authentication-clerk)
- [Database (MongoDB)](#-database-mongodb)
- [AI Integration](#-ai-integration)
- [File Upload System](#-file-upload-system)
- [API Routes](#-api-routes)
- [Components Architecture](#-components-architecture)
- [Development](#-development)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

## ✨ Features

### Core Features

- **Modern Interface** - Responsive chat UI with dynamic input layout
- **Real-time Chat** - Instant messaging with AI responses
- **Chat Persistence** - Save and restore conversations across sessions
- **User Authentication** - Secure login with Clerk
- **Chat Search** - Find conversations quickly with real-time filtering

### File Management

- **Dual Upload System** - Native file picker + Uploadcare integration
- **Multiple File Types** - Support for images, PDFs, documents, and more
- **Progress Tracking** - Real-time upload progress with circular indicators
- **Attachment Preview** - Image previews and file type icons
- **Cloud Storage** - Automatic upload to Cloudinary and Uploadcare CDN

### UI/UX Features

- **Responsive Design** - Mobile-first approach with sticky elements
- **Dark/Light Theme** - Consistent design system
- **Toast Notifications** - User feedback for actions
- **Loading States** - Smooth transitions and progress indicators
- **Keyboard Shortcuts** - Escape key support and Enter to send

### Advanced Features

- **Chat History** - Persistent conversation storage
- **Message Editing** - Edit and update messages
- **Chat Management** - Create, rename, delete, and share chats
- **Memory Integration** - AI memory system for context retention
- **Error Handling** - Comprehensive error management and recovery

## 🛠 Tech Stack

### Frontend

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library
- **React Icons** - Additional icon components

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **MongoDB** - NoSQL database with Mongoose ODM
- **Clerk** - Authentication and user management
- **Cloudinary** - Image and file cloud storage
- **Uploadcare** - Multi-source file upload service

### AI & Services

- **OpenAI API** - GPT integration for chat responses
- **Hugging Face** - Alternative AI model support
- **Mem0** - AI memory management system

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **MongoDB Atlas** account (or local MongoDB)
- **Clerk** account for authentication
- **Cloudinary** account for file storage
- **Uploadcare** account for file uploads
- **OpenAI API** key for AI responses

## 🔧 Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/chkrishna142/ChatGPT_Clone.git
cd ChatGPT_Clone
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Database
MONGODB_URI=your_mongodb_connection_string

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Cloudinary (for file storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Uploadcare (for file uploads)
UPLOADCARE_PUBLIC_KEY=your_uploadcare_public_key
UPLOADCARE_SECRET_KEY=your_uploadcare_secret_key

# Mem0 (for AI memory)
MEM0_API_KEY=your_mem0_api_key
```

### 4. Service Setup Guides

#### Clerk Authentication Setup

1. **Create Clerk Account**

   - Go to [clerk.com](https://clerk.com)
   - Sign up and create a new application
   - Choose "Next.js" as your framework

2. **Configure Authentication**

   - In Clerk Dashboard, go to "API Keys"
   - Copy `Publishable Key` and `Secret Key`
   - Set up sign-in/sign-up URLs in "Paths"

3. **Environment Variables**
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```

#### MongoDB Setup

1. **MongoDB Atlas**

   - Go to [mongodb.com/atlas](https://mongodb.com/atlas)
   - Create a free cluster
   - Create a database user
   - Whitelist your IP address

2. **Connection String**

   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatgpt?retryWrites=true&w=majority
   ```

3. **Database Schema**
   - The app automatically creates collections: `chats`, `messages`, `attachments`
   - Each document includes `userId` for user isolation

#### OpenAI Setup

1. **API Key**

   - Go to [platform.openai.com](https://platform.openai.com)
   - Create an API key
   - Add billing information for API usage

2. **Environment Variable**
   ```bash
   OPENAI_API_KEY=sk-...
   ```

#### Cloudinary Setup

1. **Account Creation**

   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for free account
   - Get credentials from Dashboard

2. **Environment Variables**
   ```bash
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

#### Uploadcare Setup

1. **Account Setup**

   - Go to [uploadcare.com](https://uploadcare.com)
   - Create account and get API keys

2. **Environment Variables**
   ```bash
   UPLOADCARE_PUBLIC_KEY=your_public_key
   UPLOADCARE_SECRET_KEY=your_secret_key
   ```

## Installation

### 1. Start Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

### 2. Open Application

Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Sign Up/In

- Click "Sign In" to authenticate with Clerk
- Create your first chat
- Start chatting with AI!

## 📁 Project Structure

```
chatgpt/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── chat/          # Chat API endpoints
│   │   │   ├── chats/         # Chat management
│   │   │   ├── delete/        # File deletion
│   │   │   ├── memory/        # AI memory
│   │   │   ├── share/         # Chat sharing
│   │   │   ├── upload/        # File upload
│   │   │   └── uploadcare-delete/
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   ├── share/[shareId]/   # Shared chat pages
│   │   ├── sign-in/           # Authentication pages
│   │   └── sign-up/
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── button.tsx
│   │   │   ├── modal.tsx
│   │   │   ├── search-modal.tsx
│   │   │   ├── toast.tsx
│   │   │   └── index.ts
│   │   ├── chat-interface.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-message.tsx
│   │   ├── sidebar.tsx
│   │   ├── uploadcare-uploader.tsx
│   │   └── native-file-uploader.tsx
│   ├── config/               # Configuration files
│   │   ├── cloudinary.ts
│   │   ├── database.ts
│   │   └── mem0.ts
│   ├── lib/                  # Utilities and hooks
│   │   ├── hooks/
│   │   │   └── use-chat.ts
│   │   ├── services/
│   │   │   └── memory-service.ts
│   │   ├── models.ts
│   │   └── utils.ts
│   ├── middleware.ts         # Clerk middleware
│   ├── scripts/             # Utility scripts
│   └── types/               # TypeScript definitions
│       └── index.ts
├── public/                   # Static assets
├── .env.local               # Environment variables
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## Authentication (Clerk)

### Setup

Clerk is configured in `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

### Protecting Routes

API routes are protected using Clerk's `getAuth`:

```typescript
// src/app/api/chat/route.ts
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  const { userId } = getAuth(req);

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Handle authenticated request
}
```

### Frontend User Management

```typescript
// src/app/page.tsx
import { useUser } from "@clerk/nextjs";

export default function Page() {
  const { isSignedIn, user } = useUser();

  if (!isSignedIn) {
    return <SignInPrompt />;
  }

  return <ChatInterface user={user} />;
}
```

### Best Practices

1. **Always verify userId in API routes**
2. **Use `getAuth` for server-side authentication**
3. **Use `useUser` for client-side user data**
4. **Protect sensitive API endpoints**

## Database (MongoDB)

### Schema Design

All documents include `userId` for user isolation:

```typescript
// src/lib/models.ts
const ChatSchema = new Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  userId: { type: String, required: true }, // Clerk user ID
  messages: [{ type: Schema.Types.ObjectId, ref: "Message" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const MessageSchema = new Schema({
  id: { type: String, required: true },
  userId: { type: String, required: true }, // Clerk user ID
  chatId: { type: String, required: true },
  role: { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
  attachments: [{ type: Schema.Types.ObjectId, ref: "Attachment" }],
  timestamp: { type: Date, default: Date.now },
});
```

### Queries

```typescript
// Fetch user's chats
const chats = await Chat.find({ userId });

// Fetch chat messages
const messages = await Message.find({
  chatId,
  userId,
}).sort({ timestamp: 1 });

// Save new message
const message = new Message({
  id: generateId(),
  userId,
  chatId,
  role: "user",
  content: userMessage,
  timestamp: new Date(),
});
await message.save();
```

### Indexing

Add indexes for performance:

```typescript
// In MongoDB Atlas or via Mongoose
ChatSchema.index({ userId: 1, createdAt: -1 });
MessageSchema.index({ chatId: 1, userId: 1, timestamp: 1 });
AttachmentSchema.index({ userId: 1 });
```

## AI Integration

### OpenAI Configuration

```typescript
// src/app/api/chat/route.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
    max_tokens: 1000,
    temperature: 0.7,
  });

  return Response.json({
    content: completion.choices[0].message.content,
  });
}
```

### Memory Integration

```typescript
// src/lib/services/memory-service.ts
import { Mem0 } from "mem0";

const mem0 = new Mem0({
  apiKey: process.env.MEM0_API_KEY,
});

export async function addToMemory(userId: string, message: string) {
  await mem0.addMemory({
    userId,
    content: message,
    metadata: { timestamp: new Date() },
  });
}

export async function getRelevantMemories(userId: string, query: string) {
  const memories = await mem0.searchMemories({
    userId,
    query,
    limit: 5,
  });
  return memories;
}
```

### Rate Limits

- **OpenAI Free Tier**: 3 requests/minute
- **Production**: Consider upgrading for higher limits
- **Error Handling**: Implement retry logic for rate limit errors

## File Upload System

### Dual Upload Architecture

The app supports two upload methods:

#### 1. Native File Picker (Cloudinary)

```typescript
// src/components/native-file-uploader.tsx
const handleFileUpload = async (files: File[]) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  // Handle upload result
};
```

#### 2. Uploadcare Integration

```typescript
// src/components/uploadcare-uploader.tsx
import { FileUploaderRegular } from "@uploadcare/react-uploader";

<FileUploaderRegular
  sourceList="local,url,camera,dropbox,gdrive"
  onFileUploadSuccess={handleFileUpload}
  publicKey={process.env.NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY}
/>;
```

### File Types Supported

```typescript
const allowedTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
];
```

### Progress Tracking

```typescript
// Real-time upload progress
const [uploadProgress, setUploadProgress] = useState(0);

const progressInterval = setInterval(() => {
  setUploadProgress((prev) => Math.min(prev + Math.random() * 20, 90));
}, 200);
```

## 🛠 API Routes

### Chat API (`/api/chat`)

```typescript
// POST - Send message and get AI response
{
  "message": "Hello, how are you?",
  "chatId": "chat_123",
  "attachments": [...]
}
```

### Chats API (`/api/chats`)

```typescript
// GET - Fetch user's chats
// PUT - Create/update chat
// DELETE - Delete chat

// Example response
{
  "chats": [
    {
      "id": "chat_123",
      "title": "My Chat",
      "userId": "user_456",
      "messages": [...],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Upload API (`/api/upload`)

```typescript
// POST - Upload file to Cloudinary
// FormData with 'file' field

// Response
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "chatgpt/123-filename",
  "size": 1024
}
```

### Delete API (`/api/delete`)

```typescript
// DELETE - Remove file from Cloudinary
{
  "publicId": "chatgpt/123-filename"
}
```

## Components Architecture

### Core Components

#### ChatInterface

- Main chat container
- Message rendering
- Input handling
- Attachment management

#### Sidebar

- Chat list
- Search functionality
- User management
- Navigation

#### ChatInput

- Message input field
- File upload integration
- Send button
- Plus menu

#### ChatMessage

- Message display
- Attachment rendering
- Edit/delete actions
- Timestamp formatting

### UI Components

#### Modal

- Base modal component
- Consistent styling
- Backdrop handling
- Keyboard navigation

#### SearchModal

- Chat search functionality
- Real-time filtering
- Selection handling

#### Toast

- Notification system
- Success/error states
- Auto-dismiss

### File Components

#### UploadcareUploader

- Multi-source uploads
- Progress tracking
- CDN integration

#### NativeFileUploader

- Browser file picker
- Cloudinary upload
- Validation

## Development

### Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type checking
npm run type-check
```

### Code Style

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Tailwind CSS** for styling

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

## Deployment

### Vercel (Recommended)

1. **Connect Repository**

   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Environment Variables**

   - Add all environment variables in Vercel dashboard
   - Ensure all services are configured

3. **Deploy**
   - Vercel automatically deploys on push to main
   - Custom domains available

### Manual Deployment

```bash
# Build application
npm run build

# Start production server
npm start
```

### Environment Checklist

- [ ] Clerk authentication configured
- [ ] MongoDB connection string set
- [ ] OpenAI API key added
- [ ] Cloudinary credentials configured
- [ ] Uploadcare keys set
- [ ] Mem0 API key added (optional)

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Errors

```bash
# Check Clerk configuration
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

#### 2. Database Connection

```bash
# Verify MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chatgpt
```

#### 3. File Upload Issues

```bash
# Check Cloudinary setup
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Check Uploadcare setup
UPLOADCARE_PUBLIC_KEY=your_public_key
UPLOADCARE_SECRET_KEY=your_secret_key
```

#### 4. AI Response Errors

```bash
# Verify OpenAI API key
OPENAI_API_KEY=sk-...

# Check rate limits
# Free tier: 3 requests/minute
```

### Debug Mode

Enable debug logging:

```typescript
// Add to .env.local
DEBUG = true;
NODE_ENV = development;
```

### Performance Issues

1. **Database Indexing**

   ```typescript
   // Add indexes for better performance
   ChatSchema.index({ userId: 1, createdAt: -1 });
   ```

2. **Image Optimization**

   ```typescript
   // Use Next.js Image component
   import Image from "next/image";
   ```

3. **Bundle Analysis**
   ```bash
   npm run build
   npm run analyze
   ```

## Contributing

### Development Setup

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

### Code Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Add JSDoc comments for functions
- Test all new features
- Update documentation

### Pull Request Process

1. **Description** - Clear description of changes
2. **Testing** - How to test the changes
3. **Screenshots** - UI changes (if applicable)
4. **Breaking Changes** - Document any breaking changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org) - React framework
- [Clerk](https://clerk.com) - Authentication
- [MongoDB](https://mongodb.com) - Database
- [OpenAI](https://openai.com) - AI integration
- [Cloudinary](https://cloudinary.com) - File storage
- [Uploadcare](https://uploadcare.com) - File uploads
- [Tailwind CSS](https://tailwindcss.com) - Styling

## Support

For support and questions:

- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Check this README and inline comments
- **Discord** - Join our community (if available)

---

**Made with ❤️ using Next.js, TypeScript, and modern web technologies.**
