export type Webring = {
	id: string;
	isActive: boolean;
	name: string;
	slug: string;

	apiBaseUrl: string;
	homepageUrl: string;
	faviconsUrl?: string;

	nextDataURL?: string;
	prevDataURL?: string;

	responseFormat: 'wrapped' | 'direct';
};

export type PublicSite = {
	slug: string;
	name: string;
	url: string;
	favicon?: string;
};

export type WebringData = {
	next?: PublicSite;
	previous?: PublicSite;
};

export async function fetchWebringSite(
	url: string,
	direction?: 'next' | 'previous'
): Promise<PublicSite> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	const data = await response.json();

	const rawSite =
		direction && data[direction]
			? data[direction]
			: data;

	if (
		typeof rawSite !== 'object' ||
		rawSite === null ||
		typeof rawSite.name !== 'string' ||
		typeof rawSite.url !== 'string'
	) {
		throw new Error(
			`Invalid webring response${direction ? ` for "${direction}"` : ''}`
		);
	}

	return {
		slug: rawSite.slug ?? '',
		name: rawSite.name,
		url: rawSite.url,
		favicon: rawSite.favicon ?? rawSite.faviconName
	};
}

export const webrings: Webring[] = [
  {
    id: "otoring",
    isActive: false,
    name: "Otori.ng",
    slug: "rame",
    apiBaseUrl: 'https://webring.otomir23.me',
    homepageUrl: 'https://webring.otomir23.me',
    faviconsUrl: 'https://webring.otomir23.me/media/',
    nextDataURL: 'https://webring.otomir23.me/rame/next/data/',
    prevDataURL: 'https://webring.otomir23.me/rame/prev/data/',
    responseFormat: 'wrapped'
  },
  {
    id: "foxring",
    isActive: true,
    name: "Foxring",
    slug: "https://rame.wtf/",
    apiBaseUrl: 'https://foxr.ing',
    homepageUrl: 'https://foxr.ing',
    faviconsUrl: 'https://foxr.ing/favicons/',
    nextDataURL: 'https://foxr.ing/next/json?from=https%3A%2F%2Frame.wtf%2F',
    prevDataURL: 'https://foxr.ing/prev/json?from=https%3A%2F%2Frame.wtf%2F',
    responseFormat: 'direct'
  },
];
