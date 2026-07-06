import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET;
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const INSTAGRAM_ACCOUNT_ID = process.env.INSTAGRAM_ACCOUNT_ID;
const INSTAGRAM_ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;

const STORY_WIDTH = 1080;
const STORY_HEIGHT = 1920;

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
            font-family: 'Georgia', 'Playfair Display', serif;
            font-size: 50px;
            font-weight: 500;
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
