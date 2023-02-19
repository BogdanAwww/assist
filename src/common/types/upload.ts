type UploadType = 'image' | 'document';

interface BaseUpload {
	_id: string;
	format: string;
}

interface ImageUpload extends BaseUpload {
	type: 'image';
	urlTemplate: string;
}

interface DocumentUpload extends BaseUpload {
	type: 'document';
	url: string;
	filename: string;
	isImage?: boolean;
}

interface Uploads {
	image: ImageUpload;
	document: DocumentUpload;
}

type Upload<T extends UploadType> = Uploads[T];

type AnyUpload = ImageUpload | DocumentUpload;

export {UploadType, Upload, AnyUpload, ImageUpload, DocumentUpload};
