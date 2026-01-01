import { Injectable, BadRequestException } from '@nestjs/common';

import {
  v2 as cloudinary,
  UploadApiResponse,
  UploadApiErrorResponse,
} from 'cloudinary';
import { Readable } from 'stream';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { tmpdir } from 'os';

@Injectable()
export class MediaService {
  // Private helper to upload a Buffer to Cloudinary using Streams
  private async uploadToCloudinary(
    buffer: Buffer,
    options: {
      folder?: string;
      resource_type?: 'image' | 'video' | 'auto';
    } = {},
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { ...options, resource_type: options.resource_type || 'auto' },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) return reject(new Error(error.message || 'Upload failed'));
          if (!result)
            return reject(new Error('Cloudinary returned no result'));
          resolve(result);
        },
      );
      Readable.from(buffer).pipe(uploadStream);
    });
  }

  // Main entry point to upload a single file (image or video)
  async uploadFile(file: Express.Multer.File): Promise<any> {
    if (file.mimetype.startsWith('image/')) {
      return this.uploadToCloudinary(file.buffer, { folder: 'images' });
    } else if (file.mimetype.startsWith('video/')) {
      const processed = await this.processVideo(file);

      const videoUpload = await this.uploadToCloudinary(processed.videoBuffer, {
        folder: 'videos',
        resource_type: 'video',
      });

      const thumbnailUpload = await this.uploadToCloudinary(
        processed.thumbnailBuffer,
        {
          folder: 'thumbnails',
          resource_type: 'image',
        },
      );

      return {
        ...videoUpload,
        thumbnail: thumbnailUpload,
      };
    } else {
      throw new BadRequestException('Unsupported file type');
    }
  }

  // Handles multiple file uploads at once
  async uploadFiles(files: Express.Multer.File[]): Promise<any[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No files provided');
    }
    const uploadPromises = files.map((file) => this.uploadFile(file));
    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw new BadRequestException(
        `Upload failed: ${(error as Error).message}`,
      );
    }
  }

  // Processes video: Compresses the file and generates a thumbnail
  private async processVideo(
    file: Express.Multer.File,
  ): Promise<{ videoBuffer: Buffer; thumbnailBuffer: Buffer }> {
    const fileExt = path.extname(file.originalname) || '.mp4';
    const tempInputPath = path.join(tmpdir(), `${uuidv4()}${fileExt}`);
    const tempCompressedPath = path.join(tmpdir(), `${uuidv4()}.mp4`);
    const tempThumbnailPath = path.join(tmpdir(), `${uuidv4()}.jpg`);

    try {
      // Save buffer to temporary file for FFmpeg
      await fs.writeFile(tempInputPath, file.buffer);

      // 1. Compress Video
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempInputPath)
          .outputOptions([
            '-vcodec libx264',
            '-crf 28',
            '-preset fast',
            '-movflags +faststart',
          ])
          .on('end', () => resolve())
          .on('error', (err) => reject(new Error(err.message)))
          .save(tempCompressedPath);
      });

      // 2. Generate Thumbnail (1 second mark)
      await new Promise<void>((resolve, reject) => {
        ffmpeg(tempCompressedPath)
          .screenshots({
            timestamps: [1],
            filename: path.basename(tempThumbnailPath),
            folder: path.dirname(tempThumbnailPath),
            size: '320x240',
          })
          .on('end', () => resolve())
          .on('error', (err) => reject(new Error(err.message)));
      });

      // Read processed data back into memory
      const [videoBuffer, thumbnailBuffer] = await Promise.all([
        fs.readFile(tempCompressedPath),
        fs.readFile(tempThumbnailPath),
      ]);

      return { videoBuffer, thumbnailBuffer };
    } finally {
      // Clean up all temporary files immediately
      await Promise.allSettled([
        fs.unlink(tempInputPath).catch(() => {}),
        fs.unlink(tempCompressedPath).catch(() => {}),
        fs.unlink(tempThumbnailPath).catch(() => {}),
      ]);
    }
  }
}
