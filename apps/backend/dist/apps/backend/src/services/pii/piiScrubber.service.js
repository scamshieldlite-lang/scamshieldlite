// apps/backend/src/services/pii/piiScrubber.service.ts
// Ordered by specificity — run more specific patterns first
const SCRUB_RULES = [
    // Email addresses
    {
        label: "[EMAIL]",
        pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/gi,
    },
    // URLs (before phone to avoid false positives on port numbers)
    {
        label: "[URL]",
        pattern: /https?:\/\/[^\s<>"{}|\\^`[\]]+|www\.[^\s<>"{}|\\^`[\]]+/gi,
    },
    // US Social Security Number (SSN) - 000-00-0000
    {
        label: "[SSN]",
        pattern: /\b(?!000|666|9\d{2})([0-8]\d{2}|7([0-6]\d))([- ]?)(?!00)\d{2}\3(?!0000)\d{4}\b/g,
    },
    // US & Global Phone Numbers (More robust for +1 and domestic US)
    {
        label: "[PHONE]",
        pattern: /(?:\+?1[-. ]?)?\(?([2-9][0-8][0-9])\)?[-. ]?([2-9][0-9]{2})[-. ]?([0-9]{4})/g,
    },
    // US ZIP Codes (5-digit and 5+4)
    {
        label: "[ZIP_CODE]",
        pattern: /\b\d{5}(?:-\d{4})?\b/g,
    },
    // Keep your Nigerian specific rules (NIN, USSD) below these
    // so the service handles both countries seamlessly.
    {
        label: "[NIN_BVN]",
        pattern: /\b\d{11}\b/g,
    },
    // Bank account numbers (8–10 digits)
    {
        label: "[ACCOUNT_NUMBER]",
        pattern: /\b\d{8,10}\b/g,
    },
    // Credit / debit card numbers (with optional spaces or dashes)
    {
        label: "[CARD_NUMBER]",
        pattern: /\b(?:\d[ \-]?){13,19}\b/g,
    },
    // Bitcoin / crypto wallet addresses
    {
        label: "[CRYPTO_ADDRESS]",
        pattern: /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|0x[a-fA-F0-9]{40}\b/g,
    },
    // Full names (Title + Capitalized words — conservative pattern)
    {
        label: "[NAME]",
        pattern: /\b(?:Mr|Mrs|Miss|Ms|Dr|Prof|Sir|Madam)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g,
    },
    // Nigerian bank USSD codes (*737#, *901# etc.)
    {
        label: "[USSD_CODE]",
        pattern: /\*\d{3,6}(?:#|\*\d+)*/g,
    },
];
export function scrubPii(rawText) {
    const originalLength = rawText.length;
    let scrubbed = rawText;
    let redactedCount = 0;
    for (const rule of SCRUB_RULES) {
        const before = scrubbed;
        scrubbed = scrubbed.replace(rule.pattern, (match) => {
            redactedCount++;
            return rule.label;
        });
    }
    return {
        scrubbed: scrubbed.trim(),
        originalLength,
        redactedCount,
    };
}
//# sourceMappingURL=piiScrubber.service.js.map