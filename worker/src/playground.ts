import 'dotenv/config';
import { azureOpenai } from './utils/openai';
import { Transformer } from '@napi-rs/image';
import { S3, PutObjectCommand } from '@aws-sdk/client-s3';
import { BlobServiceClient } from '@azure/storage-blob';
//import { AzureKeyCredential, OpenAIClient } from '@azure/openai';

// const s3Client = new S3({
//   endpoint: 'https://ams3.digitaloceanspaces.com',
//   region: 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.SPACES_KEY as string,
//     secretAccessKey: process.env.SPACES_SECRET as string,
//   },
// });

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING as string,
);

async function main() {
  const prompt =
    'A Swedish flag fluttering against a backdrop of a city skyline, symbolizing the Swedish labor market. In the foreground, a contract is laid out on a table, an ink pen resting on top of it. The contract represents the collective agreement signed by Klarna.';

  const image = await azureOpenai.audio.transcriptions.create({
    model: 'whisper-1',
    response_format: 'text',
    prompt: 'asd',
  });

  console.log(image.data[0]);

  const rawImage = Buffer.from(image.data[0]!.b64_json as string, 'base64');
  const imageBinary = await new Transformer(rawImage).webp(75);
  // Upload to Azure Blob Storage
  const containerClient = blobServiceClient.getContainerClient('nyheter');
  const blockBlobClient = containerClient.getBlockBlobClient('test.webp');
  await containerClient.setAccessPolicy('blob'); // This makes the blob publicly readable

  await blockBlobClient.upload(imageBinary, imageBinary.length, {
    blobHTTPHeaders: {
      blobContentType: 'image/webp',
    },
  });
}

main();
