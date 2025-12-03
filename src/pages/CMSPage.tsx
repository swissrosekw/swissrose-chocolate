import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";

interface PageData {
  id: string;
  slug: string;
  title: string;
  content: string;
  meta_description: string | null;
}

const CMSPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPage = async () => {
      if (!slug) {
        navigate("/404");
        return;
      }

      const { data, error } = await supabase
        .from("cms_pages")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (error || !data) {
        navigate("/404");
        return;
      }

      setPage(data);
      setLoading(false);
    };

    fetchPage();
  }, [slug, navigate]);

  const formatContent = (content: string) => {
    return content
      .split("\n")
      .map((line, index) => {
        // Handle bold text **text**
        let formattedLine = line.replace(
          /\*\*(.*?)\*\*/g,
          '<strong class="text-primary font-semibold">$1</strong>'
        );

        // Handle bullet points
        if (line.trim().startsWith("•")) {
          return (
            <li
              key={index}
              className="ml-4 text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: formattedLine.replace("•", "").trim() }}
            />
          );
        }

        // Empty lines become spacing
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!page) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
        <Header />

        <main className="pt-24 pb-24 md:pb-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-primary mb-8">
              {page.title}
            </h1>

            <div className="prose prose-lg max-w-none space-y-2">
              {formatContent(page.content)}
            </div>
          </div>
        </main>

        <Footer />
        <BottomNav />
      </div>
  );
};

export default CMSPage;
