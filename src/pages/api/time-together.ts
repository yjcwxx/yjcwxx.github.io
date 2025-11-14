import type { APIRoute } from 'astro';
import siteConfig from '../../../site.config.mts';

export const GET: APIRoute = async () => {
	const startDate = new Date(siteConfig.startDate);
	const now = new Date();
	
	const diff = now.getTime() - startDate.getTime();
	
	// 计算天、小时、分钟、秒
	const days = Math.floor(diff / (1000 * 60 * 60 * 24));
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = Math.floor((diff % (1000 * 60)) / 1000);
	
	return new Response(
		JSON.stringify({
			days,
			hours,
			minutes,
			seconds,
			startDate: siteConfig.startDate,
		}),
		{
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		}
	);
};

