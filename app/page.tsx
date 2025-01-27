import { HeroHighlightDemo } from '@/components/hero';
import Navbar from '@/components/navbar';
import { HeroHighlight } from '@/components/ui/hero-highlight';
import { HoverBorderGradient } from '@/components/ui/hover-border-gradient';
import Link from 'next/link';

// Utility function to format duration
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export default async function Home({ searchParams }:{
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const params = await searchParams;
  const urlParam = params?.url;

  if (!urlParam) {
    return (
      <div className="flex flex-col h-screen w-screen">
        <Navbar />
        <div className="flex-1 flex justify-center items-center overflow-hidden"> 
          <div className="flex flex-col justify-center items-center w-full h-full">
            <HeroHighlightDemo />
          </div>
        </div>
      </div>
    );
  }

  const url = Array.isArray(urlParam) ? urlParam[0] : urlParam;

  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('https://')) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Navbar />
        <div className="text-red-500 mt-8">
          <p>Error: Please provide a valid HTTPS URL</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Check if URL is supported
  const isTikTok = cleanUrl.includes('tiktok.com');
  const isInstagram = cleanUrl.includes('instagram.com');
  const isYouTube = cleanUrl.includes('youtu.be') || cleanUrl.includes('youtube.com');

  if (!isTikTok && !isInstagram && !isYouTube) {
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Navbar />
        <div className="text-red-500 mt-8">
          <p>Error: Only TikTok, Instagram, and YouTube URLs are supported</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const options = {
    method: 'POST',
    headers: {
      'X-RapidAPI-Key': process.env.NEXT_PUBLIC_RAPIDAPI_KEY || '',
      'X-RapidAPI-Host': 'snap-video3.p.rapidapi.com',
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      url: cleanUrl
    }).toString()
  };

  let post = null;

  try {
    console.log('Making API request with URL:', cleanUrl); // Debug log
    const response = await fetch('https://snap-video3.p.rapidapi.com/download', options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('API Error Response:', errorData); // Debug log
      throw new Error(
        errorData?.message || 
        `API Error: ${response.status} ${response.statusText}`
      );
    }
  
    post = await response.json();
    console.log('API Response:', post); // Debug log

    if (!post || typeof post !== 'object') {
      throw new Error('Invalid response format from API');
    }
  } catch (error) {
    console.error('Error fetching video details:', error); 
    return (
      <div className="flex flex-col justify-center items-center h-screen">
        <Navbar />
        <div className="text-red-500 mt-8">
          <p>Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <Link href="/" className="text-blue-500 hover:underline mt-4 block">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <HeroHighlight className="flex flex-col justify-center items-center min-h-screen overflow-hidden text-white">
      <Navbar />
      <div className="flex justify-center items-center p-8 pt-16 w-screen">
        {post ? (
          <div className="flex flex-col items-center p-6 sm:p-10 justify-center max-w-4xl w-full bg-slate-950/50 rounded-lg shadow-md backdrop-blur-sm">
            {/* Video Preview */}
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black/50 mb-6">
              {post.thumbnail && (
                <img
                  src={post.thumbnail}
                  alt="Video Thumbnail"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Video Information */}
            <div className="w-full flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-4">
                  {post.title || 'Untitled'}
                </h2>
                <div className="space-y-2">
                  {post.duration && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-semibold">Duration:</span>
                      <span>{post.duration}</span>
                    </div>
                  )}
                  {post.source && (
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-semibold">Source:</span>
                      <span className="capitalize">{post.source}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-semibold">Original:</span>
                    <a
                      href={cleanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline"
                    >
                      Watch Now
                    </a>
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="flex-shrink-0 w-full md:w-auto">
                <h3 className="text-lg font-semibold mb-4 text-blue-400">Download Options</h3>
                <div className="flex flex-col gap-3">
                  {post.medias && post.medias.map((media: any, index: number) => (
                    <a
                      key={index}
                      href={media?.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group"
                    >
                      <HoverBorderGradient
                        containerClassName="rounded-full"
                        className="bg-black shadow-sky-900 shadow-sm text-white flex items-center space-x-2 px-4 py-2 hover:bg-slate-900 transition-colors"
                      >
                        <DownloadLogo />
                        <span className="font-bold">
                          {media?.quality || "Download"}
                          {media?.formattedSize && ` (${media.formattedSize})`}
                        </span>
                      </HoverBorderGradient>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-500">No video data available</div>
        )}
      </div>
    </HeroHighlight>
  );
}

const DownloadLogo = () => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white"
    >
      <path
        d="M12 16L7 11L8.4 9.55L11 12.15V4H13V12.15L15.6 9.55L17 11L12 16ZM6 20C5.45 20 4.97933 19.8043 4.588 19.413C4.196 19.021 4 18.55 4 18V15H6V18H18V15H20V18C20 18.55 19.8043 19.021 19.413 19.413C19.021 19.8043 18.55 20 18 20H6Z"
        fill="currentColor"
      />
    </svg>
  );
};