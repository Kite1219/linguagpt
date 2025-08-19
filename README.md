# Translation App

A beautiful, minimalist translation app built with React, TypeScript, and powered by OpenAI's GPT models. Features a clean dark theme inspired by Apple, Claude, and OpenAI design principles.

## Features

- ✨ Clean, modern UI with dark theme
- 🌍 Support for 35+ languages
- 🤖 Powered by OpenAI GPT-4o-mini for accurate translations
- 📖 **NEW!** Oxford Dictionary integration with "Show More" button
  - Word definitions, pronunciation (IPA), and clean examples
  - 🔊 **Text-to-speech pronunciation** with speaker button
  - Multiple senses and usage labels
  - Clean formatting without underscore artifacts
  - Direct links to Oxford Learner's Dictionary
  - Available for English words only
- 🎭 Smooth animations with Framer Motion
- 📱 Fully responsive design
- 🔄 Language swap functionality
- 📋 Copy to clipboard feature
- 🔍 Searchable language selection modal
- 🧪 Development test interface for dictionary features

## Tech Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **OpenAI API** for translations
- **Responsive Design** for mobile and desktop

## Getting Started

### Prerequisites

- Node.js 16 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd translator
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. Select your source language (or use auto-detect)
2. Select your target language
3. Enter the text you want to translate
4. Click "Translate" to get your translation
5. Use the copy button to copy the translated text
6. Use the swap button to quickly reverse translation direction
7. **NEW!** For English words (including Auto-detect), click "Show More" to see:
   - Detailed definitions from Oxford Dictionary
   - 🔊 Pronunciation guide (IPA) with speaker button
   - Multiple word senses and meanings
   - Clean usage examples and synonyms
   - Part of speech information

### Testing Dictionary Features

**Local Development**: Dictionary features require Netlify deployment to work properly.

**After Deployment**: The "Show More" button will fetch real Oxford Dictionary data for any English word.

## Design Principles

- **Minimalism**: Clean interface with generous whitespace
- **Dark Theme**: Easy on the eyes with high contrast
- **Smooth Animations**: Subtle transitions that enhance UX
- **Responsive**: Works perfectly on all device sizes
- **Accessibility**: Proper focus states and semantic HTML

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App

## Deployment

This app is designed for deployment on Netlify. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Netlify

1. Push your code to GitHub
2. Connect to Netlify
3. Set `OPENAI_API_KEY` environment variable
4. Deploy!

The Oxford Dictionary feature will only work after deployment to Netlify.

## License

MIT License - feel free to use this project for any purpose.

