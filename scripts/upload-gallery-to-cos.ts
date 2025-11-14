import 'dotenv/config';
import COS from 'cos-nodejs-sdk-v5';
import fg from 'fast-glob';
import path from 'node:path';
import fs from 'node:fs';

const {
	TENCENT_SECRET_ID,
	TENCENT_SECRET_KEY,
	TENCENT_COS_BUCKET,
	TENCENT_COS_REGION,
	TENCENT_COS_BASE_DIR = 'gallery',
} = process.env;

if (!TENCENT_SECRET_ID || !TENCENT_SECRET_KEY || !TENCENT_COS_BUCKET || !TENCENT_COS_REGION) {
	console.error(
		'缺少 COS 配置，请设置环境变量：TENCENT_SECRET_ID, TENCENT_SECRET_KEY, TENCENT_COS_BUCKET, TENCENT_COS_REGION',
	);
	process.exit(1);
}

const cos = new COS({
	SecretId: TENCENT_SECRET_ID,
	SecretKey: TENCENT_SECRET_KEY,
});

function objectExists(Key: string): Promise<boolean> {
	return new Promise((resolve) => {
		cos.headObject(
			{
				Bucket: TENCENT_COS_BUCKET!,
				Region: TENCENT_COS_REGION!,
				Key,
			},
			(err) => {
				if (err) {
					// 404 表示对象不存在，其它错误当作已存在避免频繁重试
					if (err.statusCode === 404) {
						resolve(false);
					} else {
						console.warn(`检查对象是否存在失败，按已存在处理: ${Key}`, err);
						resolve(true);
					}
				} else {
					resolve(true);
				}
			},
		);
	});
}

async function uploadSingleFile(localFile: string, baseDir: string): Promise<void> {
	const absPath = path.resolve(localFile);
	const relPath = path.relative(baseDir, absPath).replace(/\\/g, '/');
	const keyPrefix = TENCENT_COS_BASE_DIR.replace(/^\/+|\/+$/g, '');
	const Key = keyPrefix ? `${keyPrefix}/${relPath}` : relPath;

	// 如果对象已存在则跳过上传
	if (await objectExists(Key)) {
		console.log(`已存在，跳过上传: ${Key}`);
		return;
	}

	console.log(`上传文件: ${absPath} -> ${Key}`);

	return new Promise((resolve, reject) => {
		cos.uploadFile(
			{
				Bucket: TENCENT_COS_BUCKET!,
				Region: TENCENT_COS_REGION!,
				Key,
				FilePath: absPath,
			},
			(err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			},
		);
	});
}

async function main() {
	const baseDir = path.resolve('src/gallery');

	if (!fs.existsSync(baseDir)) {
		console.error(`找不到图片目录: ${baseDir}`);
		process.exit(1);
	}

	const files = await fg('src/gallery/**/*.{jpg,jpeg,png,gif,JPG,JPEG,PNG,GIF}', {
		dot: false,
	});

	if (files.length === 0) {
		console.log('src/gallery 下没有找到图片，无需上传。');
		return;
	}

	for (const file of files) {
		try {
			await uploadSingleFile(file, baseDir);
		} catch (error) {
			console.error(`上传失败: ${file}`, error);
		}
	}

	console.log('所有 gallery 图片已上传到 COS。');
}

main().catch((error) => {
	console.error('上传过程中出现未处理错误:', error);
	process.exit(1);
});


