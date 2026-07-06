import type { NextApiRequest, NextApiResponse } from "next";
import { isFeatureImageUrl, publishPostStory } from "@/lib/instagram-story";

const WORDPRESS_WEBHOOK_KEY = process.env.WORDPRESS_WEBHOOK_KEY;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST");
      return res.status(405).json({ error: "Method not allowed" });
    }
    if (!WORDPRESS_WEBHOOK_KEY) {
      return res
        .status(500)
        .json({ error: "WORDPRESS_WEBHOOK_KEY is not set" });
    }
    const webhookKey = req.headers["x-wordpress-webhook-key"];
    if (webhookKey !== WORDPRESS_WEBHOOK_KEY) {
      return res.status(401).json({
        error: "Invalid webhook key",
      });
    }
    const webhookName = req.headers["x-wp-webhook-url-name"];
    if (webhookName !== "created-post") {
      return res.status(401).json({
        error: "Invalid webhook name",
      });
    }
    if (!req.body?.post) {
      return res.status(400).json({
        error: "Missing post in request body",
      });
    }
    const post = req.body.post;
    if (post.post_status !== "publish") {
      return res.status(200).json({
        error: "Post not published. Ignoring...",
      });
    }

    if (!isFeatureImageUrl(post.guid)) {
      return res.status(200).json({
        error: "Post has no feature image. Ignoring...",
      });
    }

    const result = await publishPostStory(post.guid);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error });
  }
}
