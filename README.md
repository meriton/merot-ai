# Merot.ai Website

Official website for merot.ai - AI Data Annotation platform.

## Tech Stack

- React 19
- Vite
- ESLint

## Development

### Prerequisites

- Node.js 20 or higher
- npm

### Getting Started

```bash
# Install dependencies
npm install

# Set up contact form (see CONTACT_FORM_SETUP.md)
# 1. Sign up at https://formspree.io
# 2. Create a form and get your endpoint URL
# 3. Update .env with your Formspree URL

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Contact Form Setup

The contact form requires a Formspree account (free). See [CONTACT_FORM_SETUP.md](./CONTACT_FORM_SETUP.md) for detailed setup instructions.

## AWS Deployment

This project is configured for deployment to AWS using multiple methods:

### Option 1: AWS Amplify (Recommended)

1. Connect your repository to AWS Amplify
2. Amplify will automatically detect the `amplify.yml` configuration
3. Deploy with automatic CI/CD

### Option 2: S3 + CloudFront

1. Build the project: `npm run build`
2. Upload the `dist` folder to an S3 bucket
3. Configure S3 for static website hosting
4. Set up CloudFront distribution for CDN

### Option 3: AWS CodeBuild + S3

1. Set up CodeBuild project
2. Use the included `buildspec.yml` configuration
3. Configure deployment to S3

## Project Structure

```
├── src/             # Source files
├── public/          # Static assets
├── dist/            # Production build output
├── amplify.yml      # AWS Amplify configuration
├── buildspec.yml    # AWS CodeBuild configuration
└── vite.config.js   # Vite configuration
```
