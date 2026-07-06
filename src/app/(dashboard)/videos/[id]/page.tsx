import { VideoProgressClient } from "@/components/video/video-progress";

interface VideoPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoPage({ params }: VideoPageProps) {
  const { id } = await params;
  return <VideoProgressClient videoId={id} />;
}
