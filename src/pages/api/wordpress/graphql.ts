import type { NextApiRequest, NextApiResponse } from "next";

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!WORDPRESS_API_URL) {
    return res.status(500).json({ error: "WORDPRESS_API_URL is not set" });
  }

  if (!WORDPRESS_API_KEY) {
    return res.status(500).json({ error: "WORDPRESS_API_KEY is not set" });
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Basic ${WORDPRESS_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "application/graphql-response+json",
    };

    if (req.headers.accept) {
      headers.Accept = String(req.headers.accept);
    }

    const response = await fetch(WORDPRESS_API_URL, {
      method: req.method,
      headers,
      body:
        req.method && ["GET", "HEAD"].includes(req.method)
          ? undefined
          : JSON.stringify(req.body),
    });

    const contentType = response.headers.get("content-type") || "";

    res.status(response.status);
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }

    if (contentType.includes("application/json")) {
      const json = await response.json();
      return res.json(json);
    }

    const text = await response.text();
    return res.send(text);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected proxy error",
    });
  }
}
