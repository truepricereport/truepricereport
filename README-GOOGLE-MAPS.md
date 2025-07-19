# Google Maps Address Autocomplete Setup

## Overview
The address input field now features Google Maps API integration that provides real-time address suggestions as users type. It shows up to 4 matching addresses in a dropdown menu.

## Features
- ✅ **Real-time autocomplete** - Suggestions appear as you type (after 3+ characters)
- ✅ **Smart dropdown** - Shows max 4 relevant address suggestions
- ✅ **Click to select** - Users can click any suggestion to auto-fill
- ✅ **US addresses only** - Filtered to US residential addresses
- ✅ **Form validation** - Requires address selection before submission
- ✅ **Fallback demo** - Works with mock data if no API key provided

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Places API**
4. Go to **APIs & Services > Credentials**
5. Create a new **API Key**
6. Restrict the key to **Places API** for security

### 2. Configure Environment Variables
1. Copy your API key
2. Open `.env.local` file in the project root
3. Replace `your_google_maps_api_key_here` with your actual API key:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### 3. Restart Development Server
```bash
bun run dev
```

## How It Works

### User Experience
1. User starts typing their address in the input field
2. After 3+ characters, Google Places API searches for matching addresses
3. Up to 4 suggestions appear in a dropdown below the input
4. User clicks on a suggestion to select it
5. The form can then be submitted with the validated address

### Technical Implementation
- **Component**: `AddressAutocomplete.tsx`
- **API**: Google Places Autocomplete Service
- **Fallback**: Mock address data for demo purposes
- **Validation**: Only accepts residential addresses in the US
- **Performance**: Debounced search to avoid excessive API calls

## Demo Mode
If no Google Maps API key is provided, the component automatically switches to demo mode with mock address suggestions. This allows testing the UI/UX without requiring API setup.

## API Usage & Billing
- **Free tier**: 1,000 requests per month
- **Cost**: ~$0.17 per 1,000 requests after free tier
- **Optimization**: Component only makes requests after 3+ characters typed

## Security Notes
- API key is restricted to Places API only
- Key should be restricted to your domain in production
- Environment variable is prefixed with `NEXT_PUBLIC_` to work in browser
- Consider implementing server-side proxy for additional security in production

## Testing
Try typing addresses like:
- "123 Main Street"
- "456 Oak Avenue"
- "789 Pine Boulevard"

The autocomplete will show relevant suggestions for real addresses in the US.
