# Contact Form Setup with Formspree

The contact form uses [Formspree](https://formspree.io), a free service for handling form submissions without needing a backend.

## Setup Steps (5 minutes)

### 1. Create a Formspree Account

1. Go to https://formspree.io
2. Sign up for a free account (allows 50 submissions/month)
3. Verify your email

### 2. Create a New Form

1. Click "New Form" in your Formspree dashboard
2. Enter a form name: `Merot.ai Contact Form`
3. Click "Create Form"

### 3. Configure Email Settings

1. In your form settings, go to the "Email" tab
2. Add recipient emails:
   - `genci@phase3interiors.com`
   - `meriton@merot.ai`
3. (Optional) Customize the email template

### 4. Get Your Form Endpoint

1. You'll see your form endpoint URL in the format:
   ```
   https://formspree.io/f/xyzabc123
   ```
2. Copy this URL

### 5. Update Your .env File

1. Open `/Users/meriton/code/merotai/.env`
2. Replace the placeholder with your actual Formspree URL:
   ```env
   VITE_FORMSPREE_URL=https://formspree.io/f/xyzabc123
   ```

### 6. Restart Dev Server

```bash
# Stop current dev server (Ctrl+C in terminal)
npm run dev
```

### 7. Test the Form

1. Go to http://localhost:5173/
2. Scroll to the contact section
3. Fill out and submit the form
4. Check your email at genci@phase3interiors.com and meriton@merot.ai

## Features

- ✅ No backend required
- ✅ No CORS issues
- ✅ Free for up to 50 submissions/month
- ✅ Spam protection included
- ✅ Email notifications to multiple recipients
- ✅ Works with AWS Amplify deployment

## Production Deployment

For AWS Amplify:

1. Go to your Amplify Console
2. Select your app → Environment variables
3. Add:
   - Key: `VITE_FORMSPREE_URL`
   - Value: Your Formspree endpoint URL
4. Redeploy

## Upgrading (Optional)

Formspree paid plans offer:
- Unlimited submissions ($10/month)
- Custom AJAX responses
- File uploads
- Advanced spam filtering
- Priority support

## Troubleshooting

### Form not submitting
- Check browser console for errors
- Verify Formspree URL in `.env` is correct
- Ensure dev server was restarted after updating `.env`

### Emails not arriving
- Check spam folder
- Verify email addresses in Formspree dashboard
- Check Formspree submission logs

### Formspree asking for confirmation
On first submission, Formspree may ask you to confirm your form. This is normal - click the confirmation link in the email.
