const title = 'MultiplayerGPT by Moot';
const description =
  'MultiplayerGPT is a multiplayer version of ChatGPT by openAI. Built by Moot - the all-in-one collaborative workspace.';

const SEO = {
  title,
  description,
  canonical: 'https://www.multiplayergpt.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.multiplayergpt.com',
    title,
    description,
    images: [
      {
        url: 'https://www.multiplayergpt.com/images/muliplayer-gpt.png',
        alt: title,
        width: 1280,
        height: 720,
      },
    ],
  },
  twitter: {
    handle: '@moot_hq',
    site: '@moot_hq',
    cardType: 'summary_large_image',
  },
};

export default SEO;
