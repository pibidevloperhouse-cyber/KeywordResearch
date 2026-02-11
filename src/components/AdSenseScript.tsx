import Script from "next/script";

/**
 * AdSense Script Component
 * Add this to your root layout to load the AdSense script globally
 */
export default function AdSenseScript() {
    const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    if (!adSenseId) {
        return null;
    }

    return (
        <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
}
