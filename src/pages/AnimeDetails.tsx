import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star, Calendar, Film } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Advertisement } from "@/components/Advertisement";

interface Anime {
  id: string;
  title: string;
  description: string;
  image_url: string;
  video_url: string;
  rating: number;
  genre: string;
  release_year: number;
  episodes: number;
}

const AnimeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [anime, setAnime] = useState<Anime | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchAnime();
    }
  }, [id]);

  const fetchAnime = async () => {
    try {
      const { data, error } = await supabase
        .from("anime")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setAnime(data);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аниме",
        variant: "destructive",
      });
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (!anime) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Назад к каталогу
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="rounded-xl overflow-hidden shadow-glow">
                <img
                  src={anime.image_url}
                  alt={anime.title}
                  className="w-full h-auto"
                />
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-accent text-accent" />
                  <span className="text-2xl font-bold">{anime.rating}</span>
                  <span className="text-muted-foreground">/ 10</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span>{anime.release_year}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Film className="h-5 w-5" />
                  <span>{anime.episodes} эпизодов</span>
                </div>
                <div className="inline-block px-4 py-2 bg-primary/20 rounded-full text-primary font-medium">
                  {anime.genre}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
                {anime.title}
              </h1>
              <p className="text-lg text-foreground/90 leading-relaxed">
                {anime.description}
              </p>
            </div>

            {/* Video Player */}
            <div className="rounded-xl overflow-hidden shadow-card bg-card">
              <div className="aspect-video">
                <iframe
                  src={anime.video_url}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>

            {/* Advertisement */}
            <Advertisement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AnimeDetails;
