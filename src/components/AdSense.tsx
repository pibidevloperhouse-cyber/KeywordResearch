"use client";

import { useEffect } from "react";

interface AdSenseProps {
    adSlot: string;
    adFormat?: string;
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
    className?: string;
}

/**
 * Google AdSense Component
 * 
 * Usage:
 * 1. Get your AdSense publisher ID from https://www.google.com/adsense/
 * 2. Create ad units and get their slot IDs
 * 3. Add your publisher ID to .env.local as NEXT_PUBLIC_ADSENSE_ID
 * 4. Use this component with the slot ID
 */
export default function AdSense({
    adSlot,
    adFormat = "auto",
    fullWidthResponsive = true,
    style = { display: "block" },
    className = "",
}: AdSenseProps) {
    const adSenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

    useEffect(() => {
        if (!adSenseId) {
            console.warn("AdSense ID not found. Add NEXT_PUBLIC_ADSENSE_ID to .env.local");
            return;
        }

        try {
            // Push ad to adsbygoogle array
            if (typeof window !== "undefined") {
                ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error("AdSense error:", error);
        }
    }, [adSenseId]);

    // Don't render if no AdSense ID
    if (!adSenseId) {
        return (
            <div className={`bg-slate-800/30 border border-slate-700/50 rounded-lg p-4 text-center ${className}`}>
                <p className="text-xs text-slate-500">
                    Ad Space - Add NEXT_PUBLIC_ADSENSE_ID to .env.local
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            <ins
                className="adsbygoogle"
                style={style}
                data-ad-client={adSenseId}
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            />
        </div>
    );
}
