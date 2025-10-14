import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Anime {
  id: string;
  title: string;
  description: string;
  image_url: string;
  rating: number;
  genre: string;
  episodes: number;
}

const Index = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      const { data, error } = await supabase
        .from("anime")
        .select("*")
        .order("rating", { ascending: false });

      if (error) throw error;
      setAnimes(data || []);
    } catch (error: any) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аниме",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredAnimes = animes.filter((anime) =>
    anime.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-lg bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            АнимеСтрим
          </Link>
          <Link to="/auth">
            <Button variant="outline" size="sm" className="gap-2">
              <LogIn className="h-4 w-4" />
              Вход для админа
            </Button>
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center mb-12 py-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-accent bg-clip-text text-transparent animate-fade-in">
            Смотри аниме онлайн
          </h1>
          <p className="text-xl text-muted-foreground mb-8 animate-fade-in">
            Огромная коллекция аниме в высоком качестве
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto relative animate-scale-in">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Поиск аниме..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-card/50 backdrop-blur border-primary/20 focus:border-primary shadow-glow"
            />
          </div>
        </section>

        {/* Anime Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-card/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnimes.map((anime, index) => (
              <Link
                key={anime.id}
                to={`/anime/${anime.id}`}
                className="group animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-gradient-card rounded-xl overflow-hidden shadow-card hover:shadow-glow transition-all duration-300 hover:-translate-y-2">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={anime.image_url}
                      alt={anime.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2 line-clamp-1">{anime.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {anime.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-primary font-medium">{anime.genre}</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        <span className="font-bold">{anime.rating}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredAnimes.length === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-2xl text-muted-foreground">Аниме не найдено</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
