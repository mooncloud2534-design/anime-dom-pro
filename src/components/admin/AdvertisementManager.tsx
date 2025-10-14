import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Edit2, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

interface Advertisement {
  id: string;
  title: string;
  video_url: string;
  link_url: string;
  is_active: boolean;
}

export const AdvertisementManager = () => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    video_url: "",
    link_url: "",
    is_active: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("advertisements")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить рекламу",
        variant: "destructive",
      });
      return;
    }

    setAds(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      const { error } = await supabase
        .from("advertisements")
        .update(formData)
        .eq("id", editingId);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось обновить рекламу",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Успешно!", description: "Реклама обновлена" });
    } else {
      const { error } = await supabase.from("advertisements").insert([formData]);

      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось добавить рекламу",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "Успешно!", description: "Реклама добавлена" });
    }

    resetForm();
    fetchAds();
  };

  const handleEdit = (ad: Advertisement) => {
    setFormData({
      title: ad.title,
      video_url: ad.video_url,
      link_url: ad.link_url,
      is_active: ad.is_active,
    });
    setEditingId(ad.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Вы уверены, что хотите удалить эту рекламу?")) return;

    const { error } = await supabase.from("advertisements").delete().eq("id", id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось удалить рекламу",
        variant: "destructive",
      });
      return;
    }

    toast({ title: "Успешно!", description: "Реклама удалена" });
    fetchAds();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("advertisements")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось изменить статус",
        variant: "destructive",
      });
      return;
    }

    fetchAds();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      video_url: "",
      link_url: "",
      is_active: true,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление рекламой</h2>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          className="gap-2 bg-gradient-primary"
        >
          {isAdding ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {isAdding ? "Отмена" : "Добавить рекламу"}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 bg-card/50 border-primary/20">
          <h3 className="text-xl font-semibold mb-4">
            {editingId ? "Редактировать рекламу" : "Новая реклама"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ad-title">Название рекламы *</Label>
              <Input
                id="ad-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-video">URL видео (YouTube embed) *</Label>
              <Input
                id="ad-video"
                type="url"
                placeholder="https://www.youtube.com/embed/..."
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                Пример: https://www.youtube.com/embed/dQw4w9WgXcQ
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ad-link">Ссылка для перехода *</Label>
              <Input
                id="ad-link"
                type="url"
                placeholder="https://example.com"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                required
              />
              <p className="text-xs text-muted-foreground">
                При клике на видео пользователь перейдет по этой ссылке
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ad-active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
              <Label htmlFor="ad-active">Показывать рекламу</Label>
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

      <div className="grid md:grid-cols-2 gap-4">
        {ads.map((ad) => (
          <Card key={ad.id} className="p-4 bg-card/50 border-primary/20">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-bold text-lg">{ad.title}</h3>
                <p className="text-sm text-muted-foreground break-all">{ad.link_url}</p>
              </div>
              <Switch
                checked={ad.is_active}
                onCheckedChange={() => toggleActive(ad.id, ad.is_active)}
              />
            </div>
            <div className="aspect-video rounded-lg overflow-hidden mb-3">
              <iframe
                src={ad.video_url}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(ad)}
                className="flex-1 gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Изменить
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleDelete(ad.id)}
                className="flex-1 gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Удалить
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {ads.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Рекламы пока нет</p>
        </div>
      )}
    </div>
  );
};
