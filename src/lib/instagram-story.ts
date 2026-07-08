import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

const STORY_FONT_FAMILY = "Playfair Display";
const STORY_FONT_WEIGHT = 500;
// Bundled font, not a system one: sharp rasterizes SVG <text> via
// librsvg/fontconfig, and serverless runtimes (e.g. Vercel) ship no
// /etc/fonts/fonts.conf at all, which makes fontconfig fail outright
// instead of just falling back to a different font.
const BUNDLED_FONT_DIR = path.join(process.cwd(), "src/lib/fonts");
const FONTCONFIG_DIR = path.join(os.tmpdir(), "instagram-story-fontconfig");
const FONTCONFIG_CONF_PATH = path.join(FONTCONFIG_DIR, "fonts.conf");

let fontConfigReady: Promise<void> | null = null;

async function ensureFontConfigured(): Promise<void> {
  if (!fontConfigReady) {
    fontConfigReady = (async () => {
      const cacheDir = path.join(FONTCONFIG_DIR, "cache");
      await mkdir(cacheDir, { recursive: true });

      await writeFile(
        FONTCONFIG_CONF_PATH,
        `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${BUNDLED_FONT_DIR}</dir>
  <cachedir>${cacheDir}</cachedir>
</fontconfig>
`,
      );

      process.env.FONTCONFIG_PATH = FONTCONFIG_DIR;
    })();
  }

  return fontConfigReady;
}

export function isFeatureImageUrl(guid: unknown): guid is string {
  if (typeof guid !== "string") {
    return false;
  }
  try {
    return /\.(jpe?g|png|webp|gif)$/i.test(new URL(guid).pathname);
  } catch {
    return false;
  }
}

async function buildStoryImage(imageUrl: string): Promise<Buffer> {
  await ensureFontConfigured();

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to download image.");
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const backgroundBuffer = await sharp(imageBuffer)
    .resize(STORY_WIDTH, STORY_HEIGHT, {
      fit: "cover",
    })
    .blur(30)
    .jpeg({
      quality: 80,
    })
    .toBuffer();

  const foregroundBuffer = await sharp(imageBuffer)
    .resize(STORY_WIDTH, STORY_HEIGHT, {
      fit: "contain",
      background: {
        r: 0,
        g: 0,
        b: 0,
        alpha: 0,
      },
    })
    .png()
    .toBuffer();

  const textSvg = `
      <svg width="${STORY_WIDTH}" height="${STORY_HEIGHT}">
        <style>
          .link-text {
            font-family: '${STORY_FONT_FAMILY}', serif;
            font-size: 50px;
            font-weight: ${STORY_FONT_WEIGHT};
            fill: #ffffff;
          }
        </style>
        <defs>
          <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" flood-color="#000" flood-opacity="0.6" />
          </filter>
        </defs>

        <!-- background chip -->
        <rect
          x="50%"
          y="${STORY_HEIGHT - 350 - 85}"
          width="420"
          height="70"
          rx="18"
          ry="18"
          transform="translate(-210, 0)"
          fill="rgba(0,0,0,0.45)"
        />

        <text
          x="50%"
          y="${STORY_HEIGHT - 345 - 40}"
          text-anchor="middle"
          class="link-text"
          filter="url(#textShadow)"
        >
          Link na bio.
        </text>
      </svg>
    `;
  const textBuffer = Buffer.from(textSvg);

  return sharp(backgroundBuffer)
    .composite([
      {
        input: foregroundBuffer,
        gravity: "center",
      },
      {
        input: textBuffer,
        gravity: "center",
      },
    ])
    .jpeg({
      quality: 90,
    })
    .toBuffer();
}

async function uploadStoryImage(storyBuffer: Buffer): Promise<string> {
  const s3Client = new S3Client({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID as string,
      secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
    },
  });

  const s3Key = `stories/story-${Date.now()}.jpg`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: s3Key,
      Body: storyBuffer,
      ContentType: "image/jpeg",
    }),
  );

  return `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;
}

export interface PublishStoryToInstagramResult {
  id: string;
}

async function publishStoryToInstagram(
  imageUrl: string,
): Promise<PublishStoryToInstagramResult> {
  const MEDIA_TYPE = "STORIES";

  const postMediaResponse = await fetch(
    `https://graph.facebook.com/v25.0/${INSTAGRAM_ACCOUNT_ID}/media?image_url=${imageUrl}&media_type=${MEDIA_TYPE}&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
    {
      method: "POST",
    },
  );
  const postMediaData = await postMediaResponse.json();
  const creationId = postMediaData.id;

  const postMediaPublishResponse = await fetch(
    `https://graph.facebook.com/v25.0/${INSTAGRAM_ACCOUNT_ID}/media_publish?creation_id=${creationId}&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
    {
      method: "POST",
    },
  );

  return postMediaPublishResponse.json();
}

export interface PublishPostStoryResult {
  data: PublishStoryToInstagramResult;
  s3ImageUrl: string;
}

export async function publishPostStory(
  postImageUrl: string,
): Promise<PublishPostStoryResult> {
  const storyBuffer = await buildStoryImage(postImageUrl);
  const s3ImageUrl = await uploadStoryImage(storyBuffer);
  const data = await publishStoryToInstagram(s3ImageUrl);

  return { data, s3ImageUrl };
}
