export type Webring = {
	id: string;
	isActive: boolean;
	name: string;
	slug: string;
  apiBaseUrl: string;
  homepageUrl: string;
  faviconsUrl?: string;
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
	direction: 'next' | 'previous'
): Promise<PublicSite> {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}`);
	}

	const data: WebringData = await response.json();
	const site = data[direction];

	if (!site) {
		throw new Error(`Response does not contain "${direction}"`);
	}

	return site;
}

export const webrings: Webring[] = [
  {
    id: "otoring",
    isActive: true,
    name: "Otori.ng",
    slug: "damir",
    apiBaseUrl: 'https://webring.otomir23.me',
    homepageUrl: 'https://webring.otomir23.me',
    faviconsUrl: 'https://webring.otomir23.me/media/'
  },
];
