/**
 * sanitize.js — XSS and content sanitization middleware
 * Strips dangerous HTML/script patterns from block content before DB write.
 */

const DANGEROUS_PATTERNS = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,  // onload=, onclick=, etc.
    /<object[\s\S]*?>/gi,
    /<embed[\s\S]*?>/gi,
    /data:text\/html/gi,
];

/**
 * Sanitize a single string value.
 */
function sanitizeString(str) {
    if (typeof str !== 'string') return str;
    let result = str;
    for (const pattern of DANGEROUS_PATTERNS) {
        result = result.replace(pattern, '');
    }
    return result;
}

/**
 * Express middleware: sanitize block body fields (content, label, url).
 */
function sanitizeBlock(req, res, next) {
    if (req.body) {
        if (req.body.content !== undefined) req.body.content = sanitizeString(req.body.content);
        if (req.body.label !== undefined) req.body.label = sanitizeString(req.body.label);
        if (req.body.url !== undefined) {
            // Only allow http/https URLs
            const url = req.body.url || '';
            req.body.url = /^https?:\/\//i.test(url) ? url : '';
        }
    }
    next();
}

module.exports = { sanitizeBlock };
