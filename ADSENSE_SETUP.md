# Google AdSense Integration Guide

## 🎯 Overview
This guide will help you integrate Google AdSense into your Keyword Research App to monetize your traffic.

## 📋 Prerequisites
- A Google AdSense account (apply at https://www.google.com/adsense/)
- Your website must be approved by Google AdSense
- You need your AdSense Publisher ID

## 🚀 Setup Steps

### Step 1: Get Your AdSense Publisher ID

1. Go to [Google AdSense](https://www.google.com/adsense/)
2. Sign in with your Google account
3. If you haven't already, apply for AdSense and wait for approval
4. Once approved, go to **Account** → **Account Information**
5. Copy your **Publisher ID** (format: `ca-pub-XXXXXXXXXXXXXXXX`)

### Step 2: Configure Your Environment Variables

1. Open `.env.local` in your project root
2. Replace the placeholder AdSense ID with your actual Publisher ID:

```bash
NEXT_PUBLIC_ADSENSE_ID=ca-pub-YOUR_ACTUAL_ID_HERE
```

### Step 3: Create Ad Units (Optional but Recommended)

For better control and tracking, create specific ad units:

1. In AdSense dashboard, go to **Ads** → **By ad unit**
2. Click **+ New ad unit**
3. Choose **Display ads**
4. Configure your ad unit:
   - **Name**: "Top Banner" (or any descriptive name)
   - **Ad size**: Responsive
5. Click **Create**
6. Copy the **Ad slot ID** (format: `1234567890`)
7. Repeat for multiple ad placements

### Step 4: Update Ad Slots in Your Code

Open `src/app/page.tsx` and replace the placeholder ad slots with your actual ad slot IDs:

```tsx
// Top Banner Ad (around line 82)
<AdSense
  adSlot="YOUR_TOP_BANNER_SLOT_ID"  // Replace this
  adFormat="horizontal"
  className="min-h-[90px] flex items-center justify-center"
/>

// In-Content Ad (around line 232)
<AdSense
  adSlot="YOUR_CONTENT_SLOT_ID"  // Replace this
  adFormat="horizontal"
  className="min-h-[100px] flex items-center justify-center rounded-2xl overflow-hidden"
/>

// Bottom Ad (around line 307)
<AdSense
  adSlot="YOUR_BOTTOM_SLOT_ID"  // Replace this
  adFormat="horizontal"
  className="min-h-[90px] flex items-center justify-center"
/>
```

### Step 5: Restart Your Development Server

After updating the environment variables, restart your dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 📍 Ad Placements

Your app now has ads in 3 strategic locations:

1. **Top Banner** - Below the hero section, above the search input
2. **In-Content Ad** - Between the "People Also Ask" and "Paid Ad Results" sections
3. **Bottom Ad** - At the bottom of the results (only shows when results are displayed)

## 🎨 Customization

### Change Ad Format

You can customize ad formats in the `AdSense` component:

```tsx
<AdSense
  adSlot="your-slot-id"
  adFormat="auto"  // Options: auto, horizontal, vertical, rectangle
  fullWidthResponsive={true}
  className="your-custom-classes"
/>
```

### Add More Ad Units

To add more ads, simply import and use the `AdSense` component:

```tsx
import AdSense from "@/components/AdSense";

// In your JSX:
<AdSense adSlot="your-new-slot-id" />
```

## ⚠️ Important Notes

### Testing
- **Ads won't show in development** unless your domain is verified with AdSense
- **Never click your own ads** - this violates AdSense policies
- Use AdSense's test mode or wait until deployment to see real ads

### Deployment
- Deploy your app to a production domain (Vercel, Netlify, etc.)
- Add your production domain to AdSense:
  1. Go to **Sites** in AdSense dashboard
  2. Add your production URL
  3. Wait for verification (can take 24-48 hours)

### AdSense Policies
- Ensure your content complies with [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- Don't place ads on pages with prohibited content
- Maintain a good user experience (don't overload with ads)

## 🔍 Troubleshooting

### Ads Not Showing?

1. **Check your Publisher ID**: Make sure it's correct in `.env.local`
2. **Restart dev server**: Environment variables require a restart
3. **Check browser console**: Look for AdSense-related errors
4. **Domain verification**: Your domain must be verified in AdSense
5. **Ad blockers**: Disable ad blockers during testing

### Placeholder Showing Instead of Ads?

This is normal when:
- AdSense ID is not configured
- You're in development mode
- Your domain isn't verified yet
- AdSense hasn't approved your site yet

### Revenue Not Tracking?

- Wait 24-48 hours after setup for data to appear
- Check AdSense dashboard under **Reports**
- Ensure you're getting real traffic (not just your own visits)

## 📊 Monitoring Performance

1. Go to [AdSense Dashboard](https://www.google.com/adsense/)
2. Check **Reports** for earnings and performance
3. Use **Performance reports** to see which ad units perform best
4. Optimize ad placements based on data

## 🎯 Best Practices

1. **Don't overload with ads** - 3-4 ad units per page is optimal
2. **Place ads strategically** - Near valuable content, but not intrusive
3. **Use responsive ads** - They adapt to different screen sizes
4. **Monitor performance** - Regularly check which placements work best
5. **Comply with policies** - Always follow AdSense guidelines

## 📚 Additional Resources

- [AdSense Help Center](https://support.google.com/adsense/)
- [AdSense Policies](https://support.google.com/adsense/answer/48182)
- [Optimization Tips](https://support.google.com/adsense/answer/17957)
- [Next.js + AdSense Guide](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)

## 🆘 Need Help?

If you encounter issues:
1. Check the browser console for errors
2. Review AdSense policy compliance
3. Verify your domain is approved in AdSense
4. Contact AdSense support if needed

---

**Note**: This integration is already set up in your code. You just need to:
1. Add your AdSense Publisher ID to `.env.local`
2. (Optional) Replace ad slot IDs with your custom ad units
3. Deploy to production and verify your domain
