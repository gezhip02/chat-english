# English Conversation Practice Platform

An interactive web platform for practicing English conversation with AI-powered digital humans. Practice real-world scenarios and improve your speaking skills through natural conversations.

## Features

- Interactive video-based conversations with digital humans
- Multiple conversation scenarios (Coffee Shop, Job Interview, etc.)
- Real-time speech recognition
- Difficulty levels for different learning stages
- Natural and engaging responses from AI avatars

## Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- D-ID API key (for digital human generation)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-english-nextjs
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your D-ID API key:
```
NEXT_PUBLIC_D_ID_API_KEY=your_d_id_api_key_here
NEXT_PUBLIC_AVATAR_SOURCE_URL=your_avatar_source_url
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Technology Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- D-ID API for digital human generation
- Web Speech API for speech recognition
- Framer Motion for animations

## Project Structure

```
chat-english-nextjs/
├── app/
│   ├── components/
│   │   ├── VideoChat/
│   │   │   └── VideoInterface.tsx
│   │   └── ScenarioSelection/
│   │       └── ScenarioCard.tsx
│   ├── services/
│   │   └── videoService.ts
│   └── page.tsx
├── public/
│   └── scenarios/
├── .env.local
└── package.json
```

## Usage

1. Select a conversation scenario from the available options
2. Click the "Start Speaking" button to begin the conversation
3. Speak naturally in English - the system will process your speech
4. Watch and listen to the digital human's response
5. Continue the conversation naturally

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
