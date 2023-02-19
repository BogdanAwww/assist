import express from 'express';
import path from 'path';
import sharp from 'sharp';
import DOSpaces, {UPLOAD_HOST} from '@/server/modules/do-spaces';
import {UploadModel} from '@/server/schema/entities/UploadTC';
import {Document} from 'mongoose';
import {Readable} from 'stream';
import {ApiError} from './errors';

const router = express.Router();

const SIZES = ['original', 'sm', 'md', 'lg', 'xl'] as const;
type Size = typeof SIZES[number];

const DEFAULT_SIZES: Size[] = ['original', 'sm', 'md', 'lg'];
const SIZES_OPTIONS: Record<Size, {maxWidth: number}> = {
	original: {
		maxWidth: 2048
	},
	sm: {
		maxWidth: 256
	},
	md: {
		maxWidth: 480
	},
	lg: {
		maxWidth: 1024
	},
	xl: {
		maxWidth: 2048
	}
};

type Format = 'jpeg' | 'png';
const ALLOWED_FORMATS: Format[] = ['jpeg', 'png'];
const IMAGE_OPTIONS = {
	jpeg: {
		quality: 90,
		progressive: true
	},
	png: {
		progressive: true
	}
};

interface ProcessedImageOutput {
	format: Format;
	images: {
		size: Size;
		buffer: Buffer;
	}[];
}

async function streamToBuffer(stream: Readable): Promise<Buffer | undefined> {
	return new Promise((resolve) => {
		const data: any[] = [];
		stream.on('data', function (chunk) {
			data.push(chunk);
		});
		stream.on('end', function () {
			resolve(Buffer.concat(data));
		});
	});
}

async function processImageStream(
	stream: Readable,
	sizes: Size[] = DEFAULT_SIZES
): Promise<ProcessedImageOutput | undefined> {
	const imageBuffer = await streamToBuffer(stream).catch(() => undefined);
	if (!imageBuffer) {
		return;
	}
	const metadata = await sharp(imageBuffer)
		.metadata()
		.catch(() => undefined);
	const format = metadata?.format as Format | undefined;
	if (!metadata || !format || !ALLOWED_FORMATS.includes(format)) {
		throw ApiError('Unsupported file format', 'UNSUPPORTED');
	}
	const buffers = await Promise.all(
		sizes.map((size) => {
			return processSingleImageSize(imageBuffer, size, metadata)
				.then((buffer) => {
					if (!buffer) {
						throw ApiError('No buffer', 'INTERNAL_SERVER_ERROR');
					}
					return buffer;
				})
				.catch(() => {
					throw new Error('Internal error');
				});
		})
	);
	if (!buffers) {
		return;
	}
	return {
		format,
		images: sizes.map((size, index) => ({
			size,
			buffer: buffers[index]
		}))
	};
}

async function processSingleImageSize(
	imageBuffer: Buffer,
	size: Size,
	metadata: sharp.Metadata
): Promise<Buffer | undefined> {
	const sizeOptions = SIZES_OPTIONS[size];
	const originalWidth = metadata.width || 0;
	const format = metadata.format as Format;
	const resizeWidth = originalWidth < sizeOptions.maxWidth ? originalWidth : sizeOptions.maxWidth;
	return sharp(imageBuffer)
		.resize(resizeWidth, null, {
			withoutEnlargement: true,
			kernel: sharp.kernel.lanczos3
		})
		[format](IMAGE_OPTIONS[format])
		.toBuffer();
}

function getFilenameTemplate(filename: string, ext: string, withoutKey?: boolean): string {
	const keyPart = withoutKey ? '' : '_%s';
	return `${filename}${keyPart}.${ext}`;
}

function getFilePathTemplate(
	userId: string,
	type: string,
	filename: string,
	ext: string,
	withoutKey?: boolean
): string {
	return `${userId}/${type}/` + getFilenameTemplate(filename, ext, withoutKey);
}

function uploadFileToSpaces(filename: string, file: Buffer): Promise<string | undefined> {
	return DOSpaces.upload(filename, file)
		.then((data) => {
			return data.url;
		})
		.catch(() => undefined);
}

export async function processImageType(
	userId: string,
	stream: Readable,
	filename: string
): Promise<Document | undefined> {
	const processed = await processImageStream(stream);
	if (!processed) {
		return;
	}
	const {images, format} = processed;
	const filePathTemplate = getFilePathTemplate(userId, 'image', filename, format);
	const urlTemplate = `${UPLOAD_HOST}${filePathTemplate}`;
	return Promise.all(
		images.map(async (image) => {
			const filename = filePathTemplate.replace('%s', image.size);
			const url = await uploadFileToSpaces(filename, image.buffer);
			return {
				size: image.size,
				url
			};
		})
	).then(async () => {
		const uploaded = new UploadModel({
			author: userId,
			type: 'image',
			format,
			urlTemplate
		});
		await uploaded.save();
		return uploaded.toObject({virtuals: true});
	});
}

const IMAGE_EXTENSIONS = ['jpeg', 'png', 'jpg'];
const DOCUMENT_EXTENSIONS = ['doc', 'docx', 'xls', 'xlsx', 'txt', 'ppt', 'pptx', 'pdf'];
const ARCHIVE_EXTENSIONS = ['zip', 'rar'];
const ALLOWED_FILE_EXTENSTIONS = [...IMAGE_EXTENSIONS, ...DOCUMENT_EXTENSIONS, ...ARCHIVE_EXTENSIONS];

export async function processDocumentType(
	userId: string,
	stream: Readable,
	filename: string
): Promise<Document | undefined> {
	const extname = path.extname(filename);
	const basename = path.basename(filename, extname);
	const format = extname.slice(1);
	if (!ALLOWED_FILE_EXTENSTIONS.includes(format)) {
		throw ApiError('Unsupported file extension', 'UNSUPPORTED');
	}
	const spacesFilename = getFilePathTemplate(userId, 'document', `${Number(+new Date())}/${basename}`, format, true);
	const fileBuffer = await streamToBuffer(stream);
	if (!fileBuffer) {
		throw ApiError('No buffer', 'INTERNAL_SERVER_ERROR');
	}
	const url = await uploadFileToSpaces(spacesFilename, fileBuffer);
	if (!url) {
		throw ApiError('Cloud upload error', 'INTERNAL_SERVER_ERROR');
	}
	const uploaded = new UploadModel({
		author: userId,
		key: spacesFilename,
		type: 'document',
		format,
		url
	});
	await uploaded.save();
	return uploaded.toObject({virtuals: true});
}

export default router;
