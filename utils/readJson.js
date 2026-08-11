// Workaround for a Next.js 16.2.6 production-build bug where `req.json()`
// strips double-quote characters from the request body and breaks JSON parsing.
// Read the raw text and parse manually instead.
export const readJson = async (req) => JSON.parse(await req.text())
