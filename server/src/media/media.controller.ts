import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadApiResponse } from 'cloudinary';

const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const IMAGE_TYPE_REGEX = /(jpg|jpeg|png|webp)$/;
const VIDEO_TYPE_REGEX = /(mp4|mov|avi)$/;

// Define a type for the service response to prevent "unsafe member access" errors
interface UploadResult extends UploadApiResponse {
  thumbnail?: UploadApiResponse;
}

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp(
            `(${IMAGE_TYPE_REGEX.source}|${VIDEO_TYPE_REGEX.source})`,
          ),
        })
        .addMaxSizeValidator({
          maxSize: MAX_VIDEO_SIZE,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    // We cast the result to our interface so TypeScript knows secure_url exists
    const result = (await this.mediaService.uploadFile(file)) as UploadResult;

    return {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      ...(result.thumbnail && {
        thumbnail_url: result.thumbnail.secure_url,
      }),
    };
  }

  @Post('uploads')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadMultiple(
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: new RegExp(
            `(${IMAGE_TYPE_REGEX.source}|${VIDEO_TYPE_REGEX.source})`,
          ),
        })
        .addMaxSizeValidator({
          maxSize: MAX_VIDEO_SIZE,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    files: Express.Multer.File[],
  ) {
    const results = (await this.mediaService.uploadFiles(files)) as UploadResult[];

    return results.map((result) => ({
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      resource_type: result.resource_type,
      ...(result.thumbnail && {
        thumbnail_url: result.thumbnail.secure_url,
      }),
    }));
  }
}
