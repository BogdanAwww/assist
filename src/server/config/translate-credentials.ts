import config from '.';

export default {
	type: 'service_account',
	project_id: 'assist-video',
	private_key_id: config.google.translate.keyId,
	private_key: config.google.translate.key,
	client_email: 'assist-video@assist-video.iam.gserviceaccount.com',
	client_id: '108551216284814519205',
	auth_uri: 'https://accounts.google.com/o/oauth2/auth',
	token_uri: 'https://oauth2.googleapis.com/token',
	auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
	client_x509_cert_url:
		'https://www.googleapis.com/robot/v1/metadata/x509/assist-video%40assist-video.iam.gserviceaccount.com'
};
