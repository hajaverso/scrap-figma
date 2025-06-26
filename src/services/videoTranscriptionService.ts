import axios from 'axios';

interface VideoData {
  id: string;
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  duration: number;
  viewCount?: number;
  likeCount?: number;
  publishDate: string;
  channelName: string;
  transcript?: string;
  platform: 'youtube' | 'instagram' | 'tiktok';
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  segments: {
    start: number;
    end: number;
    text: string;
  }[];
}

class VideoTranscriptionService {
  private readonly YOUTUBE_API_KEY = 'youtube_api_key_placeholder';
  private readonly TRANSCRIPTION_API_URL = 'https://api.transcription-service.com/v1';
  
  async searchYouTube(keyword: string, maxResults: number = 10): Promise<VideoData[]> {
    try {
      console.log(`🎥 Buscando vídeos no YouTube para: "${keyword}"`);
      
      // Simular busca no YouTube (em produção, usar YouTube Data API v3)
      const videos = await this.simulateYouTubeSearch(keyword, maxResults);
      
      // Transcrever vídeos em paralelo
      const videosWithTranscripts = await Promise.all(
        videos.map(async (video) => {
          try {
            const transcript = await this.transcribeVideo(video.url, video.platform);
            return { ...video, transcript: transcript.text };
          } catch (error) {
            console.warn(`Erro na transcrição do vídeo ${video.id}:`, error);
            return video;
          }
        })
      );
      
      return videosWithTranscripts;
    } catch (error) {
      console.error('Erro na busca do YouTube:', error);
      return this.getFallbackYouTubeVideos(keyword);
    }
  }

  async searchInstagram(keyword: string, maxResults: number = 8): Promise<VideoData[]> {
    try {
      console.log(`📸 Buscando conteúdo no Instagram para: "${keyword}"`);
      
      // Simular busca no Instagram (em produção, usar Instagram Basic Display API)
      const videos = await this.simulateInstagramSearch(keyword, maxResults);
      
      const videosWithTranscripts = await Promise.all(
        videos.map(async (video) => {
          try {
            const transcript = await this.transcribeVideo(video.url, video.platform);
            return { ...video, transcript: transcript.text };
          } catch (error) {
            return video;
          }
        })
      );
      
      return videosWithTranscripts;
    } catch (error) {
      console.error('Erro na busca do Instagram:', error);
      return this.getFallbackInstagramVideos(keyword);
    }
  }

  async searchTikTok(keyword: string, maxResults: number = 8): Promise<VideoData[]> {
    try {
      console.log(`🎵 Buscando vídeos no TikTok para: "${keyword}"`);
      
      // Simular busca no TikTok (em produção, usar TikTok API)
      const videos = await this.simulateTikTokSearch(keyword, maxResults);
      
      const videosWithTranscripts = await Promise.all(
        videos.map(async (video) => {
          try {
            const transcript = await this.transcribeVideo(video.url, video.platform);
            return { ...video, transcript: transcript.text };
          } catch (error) {
            return video;
          }
        })
      );
      
      return videosWithTranscripts;
    } catch (error) {
      console.error('Erro na busca do TikTok:', error);
      return this.getFallbackTikTokVideos(keyword);
    }
  }

  private async transcribeVideo(videoUrl: string, platform: string): Promise<TranscriptionResult> {
    try {
      // Simular transcrição de vídeo (em produção, usar serviços como AssemblyAI, Whisper API, etc.)
      console.log(`🎤 Transcrevendo vídeo: ${videoUrl}`);
      
      // Simular delay de processamento
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // Gerar transcrição simulada baseada na plataforma
      const transcript = this.generateSimulatedTranscript(platform);
      
      return {
        text: transcript,
        confidence: 0.85 + Math.random() * 0.1,
        segments: this.generateTranscriptSegments(transcript)
      };
    } catch (error) {
      throw new Error(`Erro na transcrição: ${error}`);
    }
  }

  private async simulateYouTubeSearch(keyword: string, maxResults: number): Promise<VideoData[]> {
    const videoTitles = [
      `${keyword}: Complete Tutorial and Guide`,
      `Everything You Need to Know About ${keyword}`,
      `${keyword} Explained in 10 Minutes`,
      `The Future of ${keyword} - Expert Analysis`,
      `${keyword} Tips and Tricks for Beginners`,
      `Advanced ${keyword} Techniques`,
      `${keyword} Case Study: Real World Examples`,
      `${keyword} vs Alternatives: Comparison`,
      `${keyword} Best Practices 2024`,
      `${keyword} Deep Dive Analysis`
    ];

    return Array.from({ length: Math.min(maxResults, videoTitles.length) }, (_, index) => ({
      id: `youtube-${keyword}-${index}`,
      title: videoTitles[index],
      description: `Comprehensive video about ${keyword} covering all the essential concepts, practical examples, and expert insights. This tutorial provides step-by-step guidance for both beginners and advanced users.`,
      url: `https://youtube.com/watch?v=${this.generateVideoId()}`,
      thumbnailUrl: `https://img.youtube.com/vi/${this.generateVideoId()}/maxresdefault.jpg`,
      duration: Math.floor(Math.random() * 1800) + 300, // 5-35 minutes
      viewCount: Math.floor(Math.random() * 1000000) + 10000,
      likeCount: Math.floor(Math.random() * 50000) + 1000,
      publishDate: this.getRandomDate(30).toISOString(),
      channelName: this.getRandomChannelName(),
      platform: 'youtube' as const
    }));
  }

  private async simulateInstagramSearch(keyword: string, maxResults: number): Promise<VideoData[]> {
    const contentTypes = ['Reel', 'Story', 'IGTV', 'Post'];
    
    return Array.from({ length: maxResults }, (_, index) => ({
      id: `instagram-${keyword}-${index}`,
      title: `${keyword} ${contentTypes[index % contentTypes.length]}`,
      description: `Instagram content about ${keyword} featuring visual storytelling, behind-the-scenes content, and community engagement.`,
      url: `https://instagram.com/p/${this.generateInstagramId()}`,
      thumbnailUrl: `https://scontent.cdninstagram.com/v/t51.2885-15/${this.generateInstagramId()}.jpg`,
      duration: Math.floor(Math.random() * 90) + 15, // 15-105 seconds
      viewCount: Math.floor(Math.random() * 100000) + 1000,
      likeCount: Math.floor(Math.random() * 10000) + 100,
      publishDate: this.getRandomDate(7).toISOString(),
      channelName: this.getRandomInstagramAccount(),
      platform: 'instagram' as const
    }));
  }

  private async simulateTikTokSearch(keyword: string, maxResults: number): Promise<VideoData[]> {
    const trendingFormats = ['Tutorial', 'Challenge', 'Trend', 'Tips', 'Hack'];
    
    return Array.from({ length: maxResults }, (_, index) => ({
      id: `tiktok-${keyword}-${index}`,
      title: `${keyword} ${trendingFormats[index % trendingFormats.length]}`,
      description: `Viral TikTok content about ${keyword} with creative storytelling, trending audio, and engaging visual effects.`,
      url: `https://tiktok.com/@user/video/${this.generateTikTokId()}`,
      thumbnailUrl: `https://p16-sign-va.tiktokcdn.com/obj/tos-maliva-p-0068/${this.generateTikTokId()}.jpeg`,
      duration: Math.floor(Math.random() * 180) + 15, // 15-195 seconds
      viewCount: Math.floor(Math.random() * 5000000) + 10000,
      likeCount: Math.floor(Math.random() * 500000) + 1000,
      publishDate: this.getRandomDate(14).toISOString(),
      channelName: this.getRandomTikTokAccount(),
      platform: 'tiktok' as const
    }));
  }

  private generateSimulatedTranscript(platform: string): string {
    const transcripts = {
      youtube: [
        "Welcome back to my channel! Today we're diving deep into this amazing topic. Let me start by explaining the fundamentals and then we'll move on to more advanced concepts. This is something that has been trending lately and I think it's really important for everyone to understand.",
        "Hey everyone! In this tutorial, I'll be showing you step by step how to get started. First, let's talk about the basics. This technology has been gaining a lot of traction recently and for good reason. It's revolutionizing the way we approach traditional problems.",
        "What's up guys! Today's video is all about exploring this fascinating subject. I've been researching this for months and I'm excited to share my findings with you. Let's break down the key components and see how they work together."
      ],
      instagram: [
        "Hey Instagram! Quick tip about this topic - it's been a game changer for me. Swipe to see the before and after results. Don't forget to save this post for later!",
        "This trend is everywhere right now and I had to try it! Here's my honest review and what I learned. Tag someone who needs to see this!",
        "Behind the scenes of my latest project involving this concept. The process was challenging but so worth it. What do you think?"
      ],
      tiktok: [
        "POV: You just discovered this life-changing hack. Wait for it... Mind blown! Try this at home and let me know how it goes. Part 2 coming soon!",
        "This trend is taking over TikTok and here's why. The results speak for themselves. Who else is obsessed with this?",
        "Explaining this concept in 60 seconds because attention spans are short. Did I miss anything important? Comment below!"
      ]
    };

    const platformTranscripts = transcripts[platform as keyof typeof transcripts] || transcripts.youtube;
    return platformTranscripts[Math.floor(Math.random() * platformTranscripts.length)];
  }

  private generateTranscriptSegments(text: string) {
    const words = text.split(' ');
    const segments = [];
    let currentTime = 0;
    
    for (let i = 0; i < words.length; i += 5) {
      const segmentWords = words.slice(i, i + 5);
      const segmentText = segmentWords.join(' ');
      const duration = segmentWords.length * 0.5; // ~0.5 seconds per word
      
      segments.push({
        start: currentTime,
        end: currentTime + duration,
        text: segmentText
      });
      
      currentTime += duration;
    }
    
    return segments;
  }

  private getFallbackYouTubeVideos(keyword: string): VideoData[] {
    return [{
      id: `fallback-youtube-${keyword}`,
      title: `${keyword} - Complete Guide`,
      description: `Comprehensive tutorial about ${keyword} with practical examples and expert insights.`,
      url: `https://youtube.com/watch?v=dQw4w9WgXcQ`,
      thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      duration: 600,
      viewCount: 50000,
      likeCount: 2500,
      publishDate: new Date().toISOString(),
      channelName: 'Tech Tutorials',
      platform: 'youtube',
      transcript: `This is a comprehensive guide about ${keyword}. We'll cover all the essential concepts, practical applications, and real-world examples. Whether you're a beginner or looking to advance your skills, this tutorial has something for everyone.`
    }];
  }

  private getFallbackInstagramVideos(keyword: string): VideoData[] {
    return [{
      id: `fallback-instagram-${keyword}`,
      title: `${keyword} Reel`,
      description: `Creative Instagram content about ${keyword} with visual storytelling.`,
      url: 'https://instagram.com/p/example',
      thumbnailUrl: 'https://via.placeholder.com/400x400',
      duration: 30,
      viewCount: 5000,
      likeCount: 250,
      publishDate: new Date().toISOString(),
      channelName: '@creator',
      platform: 'instagram',
      transcript: `Quick tips about ${keyword} that will change your perspective. Save this for later and share with friends who need to see this!`
    }];
  }

  private getFallbackTikTokVideos(keyword: string): VideoData[] {
    return [{
      id: `fallback-tiktok-${keyword}`,
      title: `${keyword} Hack`,
      description: `Viral TikTok content about ${keyword} with trending audio and effects.`,
      url: 'https://tiktok.com/@user/video/example',
      thumbnailUrl: 'https://via.placeholder.com/400x600',
      duration: 60,
      viewCount: 100000,
      likeCount: 5000,
      publishDate: new Date().toISOString(),
      channelName: '@tiktoker',
      platform: 'tiktok',
      transcript: `Mind-blowing ${keyword} hack that everyone needs to know. Try this and tag me in your results. Part 2 coming tomorrow!`
    }];
  }

  private generateVideoId(): string {
    return Math.random().toString(36).substring(2, 13);
  }

  private generateInstagramId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private generateTikTokId(): string {
    return Math.floor(Math.random() * 9000000000000000000) + 1000000000000000000;
  }

  private getRandomDate(daysAgo: number): Date {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * daysAgo);
    return new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  }

  private getRandomChannelName(): string {
    const channels = [
      'Tech Explained', 'Digital Trends', 'Innovation Hub', 'Future Tech',
      'Code Academy', 'Design Masters', 'Startup Stories', 'AI Insights'
    ];
    return channels[Math.floor(Math.random() * channels.length)];
  }

  private getRandomInstagramAccount(): string {
    const accounts = [
      '@techcreator', '@designguru', '@innovator', '@digitalartist',
      '@entrepreneur', '@techreview', '@creativestudio', '@futurist'
    ];
    return accounts[Math.floor(Math.random() * accounts.length)];
  }

  private getRandomTikTokAccount(): string {
    const accounts = [
      '@techtips', '@designhacks', '@codinglife', '@startupvibes',
      '@techtrends', '@digitalcreator', '@innovationstation', '@futuretech'
    ];
    return accounts[Math.floor(Math.random() * accounts.length)];
  }

  // Método para converter vídeos em artigos para o carrossel
  convertVideosToArticles(videos: VideoData[], keyword: string) {
    return videos.map(video => ({
      id: video.id,
      title: video.title,
      description: video.transcript || video.description,
      fullContent: video.transcript ? 
        `${video.description}\n\nTranscrição do vídeo:\n${video.transcript}\n\nEstatísticas:\n- Visualizações: ${video.viewCount?.toLocaleString() || 'N/A'}\n- Curtidas: ${video.likeCount?.toLocaleString() || 'N/A'}\n- Duração: ${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}\n- Canal: ${video.channelName}\n- Plataforma: ${video.platform.toUpperCase()}` :
        video.description,
      url: video.url,
      imageUrl: video.thumbnailUrl,
      publishDate: video.publishDate,
      source: `${video.platform.charAt(0).toUpperCase() + video.platform.slice(1)} - ${video.channelName}`,
      keywords: [keyword, video.platform, 'video', 'transcript'],
      engagement: (video.viewCount || 0) + (video.likeCount || 0),
      sentiment: 0.6 + Math.random() * 0.3 // Vídeos tendem a ter sentimento mais positivo
    }));
  }
}

export const videoTranscriptionService = new VideoTranscriptionService();