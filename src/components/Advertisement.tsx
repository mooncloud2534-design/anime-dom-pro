import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Ad {
  id: string;
  title: string;
  video_url: string;
  link_url: string;
  is_active: boolean;
}

export const Advertisement = () => {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    fetchActiveAd();
  }, []);

  const fetchActiveAd = async () => {
    try {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAd(data);
    } catch (error) {
      console.error("Ошибка загрузки рекламы:", error);
    }
  };

  if (!ad) return null;

  const handleAdClick = () => {
    window.open(ad.link_url, "_blank");
  };

  return (
    <div className="bg-gradient-card rounded-xl p-6 shadow-card border border-primary/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Реклама</h3>
      </div>
      <div 
        className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
        onClick={handleAdClick}
      >
        <div className="aspect-video">
          <iframe
            src={ad.video_url}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
      <p className="text-sm text-center mt-3 text-muted-foreground">
        {ad.title}
      </p>
    </div>
  );
};
