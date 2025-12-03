import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import CustomBouquetForm from "@/components/CustomBouquetForm";

const CustomBouquet = () => {
  const [pageContent, setPageContent] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      const { data } = await supabase
        .from("cms_pages")
        .select("content")
        .eq("slug", "custom-bouquet")
        .eq("is_published", true)
        .single();

      if (data) {
        setPageContent(data.content);
      }
    };

    fetchContent();
  }, []);

  const formatContent = (content: string) => {
    return content.split("\n").map((line, index) => {
      let formattedLine = line.replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="text-primary font-semibold">$1</strong>'
      );

      if (line.trim().startsWith("•")) {
        return (
          <li
            key={index}
            className="ml-4 text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formattedLine.replace("•", "").trim() }}
          />
        );
      }

      if (line.trim() === "") {
        return <div key={index} className="h-4" />;
      }

      return (
        <p
          key={index}
          className="text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-24 pb-24 md:pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-8 text-center">
            Custom Bouquet
          </h1>

          {pageContent && (
            <div className="prose prose-lg max-w-none space-y-2 mb-12">
              {formatContent(pageContent)}
            </div>
          )}

          <CustomBouquetForm />
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default CustomBouquet;
