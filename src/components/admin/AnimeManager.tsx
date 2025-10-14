import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { Card } from "@/components/ui/card";

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

export const AnimeManager = () => {
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    video_url: "",
    rating: "0",
    genre: "",
    release_year: new Date().getFullYear().toString(),
    episodes: "0",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    const { data, error } = await supabase
      .from("anime")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить аниме",
        variant: "destructive",
      });
      return;
    }

    setAnimes(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const animeData = {
      title: formData.title,
      description: formData.description,
      image_url: formData.image_url,
      video_url: formData.video_url,
      rating: parseFloat(formData.rating),
      genre: formData.genre,
      release_year: parseInt(formData.release_year),
      episodes: parseInt(formData.episodes),
    };

    if (editingId) {
      const { error } = await supabase
        .from("anime")
        .update(animeData)
        .eq("id", editingId);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить аниме",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Успешно!", description: "Аниме обновлено" });
    } else {
      const { error } = await supabase.from("anime").insert([animeData]);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить аниме",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Успешно!", description: "Аниме добавлено" });
    }

    resetForm();
    fetchAnimes();
  };

  const handleEdit = (anime: Anime) => {
    setFormData({
      title: anime.title,
      description: anime.description || "",
      image_url: anime.image_url || "",
      video_url: anime.video_url || "",
      rating: anime.rating?.toString() || "0",
      genre: anime.genre || "",
      release_year: anime.release_year?.toString() || new Date().getFullYear().toString(),
      episodes: anime.episodes?.toString() || "0",
    });
    setEditingId(anime.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить это аниме?")) return;

    const { error } = await supabase.from("anime").delete().eq("id", id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить аниме",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Успешно!", description: "Аниме удалено" });
    fetchAnimes();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      image_url: "",
      video_url: "",
      rating: "0",
      genre: "",
      release_year: new Date().getFullYear().toString(),
      episodes: "0",
    });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Список аниме</h2>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="gap-2 bg-gradient-primary"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? "Отмена" : "Добавить аниме"}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 bg-card/50 border-primary/20">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Редактировать аниме" : "Новое аниме"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Название *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="genre">Жанр *</Label>
                <Input
                  id="genre"
                  value={formData.genre}
                  onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating">Рейтинг (0-10) *</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="episodes">Количество эпизодов *</Label>
                <Input
                  id="episodes"
                  type="number"
                  min="0"
                  value={formData.episodes}
                  onChange={(e) => setFormData({ ...formData, episodes: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="release_year">Год выпуска *</Label>
                <Input
                  id="release_year"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  value={formData.release_year}
                  onChange={(e) => setFormData({ ...formData, release_year: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image_url">URL изображения *</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="video_url">URL видео (YouTube embed) *</Label>
                <Input
                  id="video_url"
                  type="url"
                  placeholder="https://www.youtube.com/embed/..."
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="bg-gradient-primary">
                {editingId ? "Сохранить" : "Добавить"}
              </Button>
              <Button type="button" variant="outline" onClick={resetForm}>
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {animes.map((anime) => (
          <Card key={anime.id} className="p-4 bg-card/50 border-primary/20">
            <img
              src={anime.image_url}
              alt={anime.title}
              className="w-full h-48 object-cover rounded-lg mb-3"
            />
            <h3 className="font-bold text-lg mb-1">{anime.title}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {anime.description}
            </p>
            <div className="flex gap-2 mt-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(anime)}
                className="flex-1 gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Изменить
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(anime.id)}
                className="flex-1 gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Удалить
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
