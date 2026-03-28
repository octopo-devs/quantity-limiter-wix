import { DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitterName } from 'src/shared/common/types/shared.enum';

@Injectable()
export class AwsApiService {
  private s3Client: S3Client;
  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.AWS_S3_ENDPOINT,
      forcePathStyle: true,
      region: process.env.AWS_S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadBase64FileToS3(shop: string, base64: string, filename: string): Promise<string> {
    const bucketName = process.env.AWS_S3_PUBLIC_BUCKET;
    const match = base64.match(/^data:image\/(png|jpg|jpeg|svg\+xml|svg\+xml\-compressed|gif);base64,(.+)/);
    if (!match) throw new BadRequestException('File invalid');
    // eslint-disable-next-line prefer-const
    let [, fileType, base64Data] = match;
    fileType = fileType.replace(/^svg(\+xml|\+xml\-compressed)?$/, 'svg');
    const buffer = Buffer.from(base64Data, 'base64');
    const [mimeType] = base64.match(/[^:]\w+\/[\w-+\d.]+(?=;|,)/);
    const key = `${process.env.NODE_ENV || 'develop'}/${shop}/${filename}.${fileType}`;
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
          ACL: 'public-read',
        }),
      );
      return `https://storage.synctrack.ioo/${bucketName}/${key}`;
      //return `https://${bucketName}.s3.amazonaws.com/${key}`;
    } catch (err) {
      console.log(err);
      throw new InternalServerErrorException(err.message);
    }
  }

  async deleteS3File(key: string) {
    const bucketName = process.env.AWS_S3_PUBLIC_BUCKET;

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
  }

  async deleteS3Files(keys: string[]) {
    const bucketName = process.env.AWS_S3_PUBLIC_BUCKET;
    const objectsToDelete = keys.map((key) => ({ Key: key }));
    await this.s3Client.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: objectsToDelete },
      }),
    );
  }

  @OnEvent(EventEmitterName.S3FileRemove)
  async removeS3File(payload: { shop: string; url: string }): Promise<void> {
    const bucketName = process.env.AWS_S3_PUBLIC_BUCKET;
    if (!payload.url.includes(bucketName)) return;
    const [, objectKey] = payload.url.split(bucketName + '/');
    try {
      await this.deleteS3File(objectKey);
    } catch (err) {
      console.log(err.message);
    }
  }

  @OnEvent(EventEmitterName.S3FilesRemove)
  async removeS3Files(payload: { shop: string; urls: string[] }): Promise<void> {
    const bucketName = process.env.AWS_S3_PUBLIC_BUCKET;
    const objectKeys: string[] = [];
    payload.urls.forEach((url) => {
      if (!url.includes(bucketName)) return;
      const [, objectKey] = url.split(bucketName + '/');
      objectKeys.push(objectKey);
    });
    try {
      await this.deleteS3Files(objectKeys);
    } catch (err) {
      console.log(err.message);
    }
  }
}
