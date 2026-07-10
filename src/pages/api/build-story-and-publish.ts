import type { NextApiRequest, NextApiResponse } from "next";
import {
  buildStoryImage,
  publishStoryToInstagram,
  uploadStoryImage,
} from "@/lib/instagram-story";

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
    const webhookKey = req.headers["x-webhook-key"];
    console.log("webhookKey: ", webhookKey);

    if (webhookKey !== WORDPRESS_WEBHOOK_KEY) {
      return res.status(401).json({
        error: "Invalid webhook key",
      });
    }

    const postTitle = req.body.postTitle;
    const mediaUrl = req.body.mediaUrl;

    if (!postTitle || !mediaUrl) {
      return res.status(400).json({
        error: "Missing 'postTitle' or 'mediaUrl' in request body",
      });
    }

    const storyBuffer = await buildStoryImage(mediaUrl, postTitle);
    const s3ImageUrl = await uploadStoryImage(storyBuffer);
    const data = await publishStoryToInstagram(s3ImageUrl);

    console.log("Generated image on S3: ", s3ImageUrl);
    return res.status(200).json({ image_url: s3ImageUrl, data });
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error });
  }
}
