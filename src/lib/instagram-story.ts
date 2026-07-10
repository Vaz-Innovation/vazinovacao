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

// 1. Card dimensions
const CARD_WIDTH = 920;
const CARD_HEIGHT = 920;

// Offsets to center the card in the 9:16 story
const OFFSET_X = Math.floor((STORY_WIDTH - CARD_WIDTH) / 2);
const OFFSET_Y = Math.floor((STORY_HEIGHT - CARD_HEIGHT) / 2);

// 2. Image dimensions
const IMAGE_WIDTH = CARD_WIDTH;
const IMAGE_HEIGHT = Math.floor(CARD_HEIGHT * 0.7);

export async function buildStoryImage(
  imageUrl: string,
  postTitle: string,
): Promise<Buffer> {
  await ensureFontConfigured();

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error("Failed to download image.");
  }

  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  // Limita o título
  const maxChars = 140;
  const title =
    postTitle.length > maxChars
      ? `${postTitle.slice(0, maxChars - 3).trimEnd()}...`
      : postTitle;

  // 3. Create the full 9:16 Story canvas
  const baseCanvas = sharp({
    create: {
      width: STORY_WIDTH,
      height: STORY_HEIGHT,
      channels: 4,
      background: { r: 235, g: 235, b: 235, alpha: 1 },
    },
  });

  // 4. Create a mask to round ONLY the top corners of the image
  const imageMaskSvg = `
    <svg width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
      <rect
        x="0"
        y="0"
        width="${IMAGE_WIDTH}"
        height="${IMAGE_HEIGHT + 45}"
        rx="45"
        ry="45"
        fill="#ffffff"
      />
    </svg>
  `;

  // 5. Format the image
  const topImageBuffer = await sharp(imageBuffer)
    .resize(IMAGE_WIDTH, IMAGE_HEIGHT, {
      fit: "cover",
      position: "center",
    })
    .composite([
      {
        input: Buffer.from(imageMaskSvg),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  // 6. Handle title wrapping
  const maxCharsPerLine = 32;
  const words = title.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    if (
      (currentLine + word).length > maxCharsPerLine &&
      currentLine.trim().length > 0
    ) {
      lines.push(currentLine.trim());
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  });

  if (currentLine.trim().length > 0) {
    lines.push(currentLine.trim());
  }

  const lineHeight = 60;
  const titleTspans = lines
    .map(
      (line, index) =>
        `<tspan x="${OFFSET_X + 60}" dy="${index === 0 ? 0 : lineHeight}">${line}</tspan>`,
    )
    .join("");

  const textStartY = OFFSET_Y + IMAGE_HEIGHT + 100;

  // Posicionamento da descrição logo abaixo do título
  const descriptionY = textStartY + lines.length * lineHeight + 20;
  const ctaY = OFFSET_Y + CARD_HEIGHT + 85;

  // 7. Generate SVG
  const overlaySvg = `
  <svg width="${STORY_WIDTH}" height="${STORY_HEIGHT}">
    <style>
      .title {
        font-family: '${STORY_FONT_FAMILY}', serif;
        font-size: 50px;
        font-weight: 700;
        fill: #000000;
      }
      .description {
        font-family: '${STORY_FONT_FAMILY}', sans-serif;
        font-size: 32px;
        fill: #666666;
      }
      .cta {
        font-family: '${STORY_FONT_FAMILY}', sans-serif;
        font-size: 40px;
        font-weight: 700;
        fill: #000000;
      }
    </style>

    <defs>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow
          dx="0"
          dy="12"
          stdDeviation="20"
          flood-color="#000"
          flood-opacity="0.08"
        />
      </filter>
    </defs>

    <rect
      x="${OFFSET_X}"
      y="${OFFSET_Y}"
      width="${CARD_WIDTH}"
      height="${CARD_HEIGHT}"
      rx="45"
      ry="45"
      fill="#ffffff"
      filter="url(#cardShadow)"
    />

    <text y="${textStartY}" class="title">
      ${titleTspans}
    </text>

    <text
      x="${OFFSET_X + 60}"
      y="${descriptionY}"
      class="description"
    >
      Confira a matéria completa no blog da Vaz.
    </text>

    <text
      x="20%"
      y="${ctaY}"
      text-anchor="middle"
      dominant-baseline="middle"
      class="cta"
    >
      Link na Bio.
    </text>
  </svg>
  `;

  // 8. Composite everything
  const finalBuffer = await baseCanvas
    .composite([
      { input: Buffer.from(overlaySvg), top: 0, left: 0 },
      { input: topImageBuffer, top: OFFSET_Y, left: OFFSET_X },
    ])
    .jpeg({ quality: 85 })
    .toBuffer();

  return finalBuffer;
}

export async function uploadStoryImage(storyBuffer: Buffer): Promise<string> {
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

export async function publishStoryToInstagram(
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

  // sleep for 30 seconds because of instagram's api delay
  await new Promise((resolve) => setTimeout(resolve, 30_000));

  const postMediaPublishResponse = await fetch(
    `https://graph.facebook.com/v25.0/${INSTAGRAM_ACCOUNT_ID}/media_publish?creation_id=${creationId}&access_token=${INSTAGRAM_ACCESS_TOKEN}`,
    {
      method: "POST",
    },
  );

  return postMediaPublishResponse.json();
}
