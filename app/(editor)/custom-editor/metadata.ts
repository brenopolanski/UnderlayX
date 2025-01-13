import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'UnderlayX: Edit Images with Cloning, Text Behind, and Background Customization',
  description: 'Free online tool to clone images, customize backgrounds, add text behind images, and place shapes behind objects for stunning visual edits.',
  keywords: [
    'text behind image',
    'image editor',
    'photo editor',
    'shape behind image',
    'glow effect',
    'YouTube thumbnail maker',
    'social media graphics',
    'image overlay',
    'photo text editor',
    'online image editor'
  ].join(', '),
  openGraph: {
    title: 'UnderlayX: Edit Images with Cloning, Text Behind, and Background Customization',
    description: 'Free online tool to clone images, customize backgrounds, add text behind images, and place shapes behind objects for stunning visual edits.',
    url: 'https://underlayx.com/custom-editor',
    siteName: 'UnderlayX',
    images: [
      {
        url: 'https://underlayx.com/og-image.png', // Add your OG image path
        width: 1200,
        height: 630,
        alt: 'UnderlayX Editor Preview'
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UnderlayX: Edit Images with Cloning, Text Behind, and Background Customization',
    description: 'Free online tool to clone images, customize backgrounds, add text behind images, and place shapes behind objects for stunning visual edits.',
    images: ['https://underlayx.com/og-image.png'], // Add your Twitter card image path
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};
