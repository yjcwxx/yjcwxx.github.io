import type { AstroInstance } from 'astro';
import { Github, Instagram } from 'lucide-astro';

export interface SocialLink {
	name: string;
	url: string;
	icon: AstroInstance;
}

export default {
	title: 'Y&W',
	favicon: 'favicon.ico',
	owner: 'YJC & WXX',
	profileImage: 'tmp.jpeg',
	// 在一起的开始时间 (YYYY-MM-DD HH:mm:ss)
	startDate: '2025-11-15 12:00:00',
	socialLinks: [
		{
			name: 'GitHub',
			url: 'https://github.com/hzyangjc',
			icon: Github,
		} as SocialLink,
	],
};
