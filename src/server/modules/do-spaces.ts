import AWS from 'aws-sdk';
import config from '@/server/config';

const doConfig = config.digitalOcean.spaces;
const BUCKET = doConfig.bucket || 'images';
const UPLOAD_HOST = `https://${doConfig.bucket}.${doConfig.endpoint}/`;

interface UploadResponse extends AWS.S3.PutObjectOutput {
	url: string;
}

class DOSpaces {
	private _s3?: AWS.S3;

	constructor() {
		if (doConfig.accessKeyId && doConfig.secretAccessKey) {
			const endpoint = new AWS.Endpoint(doConfig.endpoint || 'ams3.digitaloceanspaces.com');
			this._s3 = new AWS.S3({
				endpoint,
				accessKeyId: doConfig.accessKeyId,
				secretAccessKey: doConfig.secretAccessKey
			});
		}
	}

	public upload(key: string, body: any, ACL = 'public-read'): Promise<UploadResponse> {
		if (!this._s3) {
			throw new Error('Digital Ocean Spaces is not configured');
		}

		return new Promise((resolve, reject) => {
			this._s3?.putObject(
				{
					Key: key,
					Body: body,
					ACL,
					Bucket: BUCKET
				},
				(err, fileData) => {
					if (err) {
						reject(err);
					}
					resolve({
						...fileData,
						url: `${UPLOAD_HOST}${key}`
					});
				}
			);
		});
	}

	public async download(key: string): Promise<Buffer | undefined> {
		return new Promise((resolve, reject) => {
			this._s3?.getObject(
				{
					Key: key,
					Bucket: BUCKET
				},
				(err, data) => {
					if (!err) {
						resolve(data.Body as Buffer);
					} else {
						reject(err);
					}
				}
			);
		});
	}
}

const doSpaces = new DOSpaces();

export default doSpaces;
export {UPLOAD_HOST};
