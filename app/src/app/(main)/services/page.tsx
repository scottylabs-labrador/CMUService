// src/app/services/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ServiceCard } from "@/components/ServiceCard";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const CATEGORIES = [
  "ALL",
  "TUTORING",
  "DESIGN",
  "PHOTOGRAPHY",
  "CODING",
  "CLEANING",
  "MOVING HELP",
];

type Service = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  image_url: string | null;
  avg_rating: number;
  review_count: number;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

function BrowseServicesContent() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchServices = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let query;
      if (searchQuery) {
        query = supabase
          .from("services_with_ratings")
          .select("*, profiles (full_name, avatar_url)")
          .ilike("title", `%${searchQuery}%`);
      } else {
        query = supabase
          .from("services_with_ratings")
          .select("*, profiles (full_name, avatar_url)");
      }

      const { data, error } = await query;

      // --- THIS IS THE DEBUGGING LOG ---
      console.log("Fetched services data:", data);

      if (error) {
        console.error("Error fetching services:", error);
      } else if (data) {
        let filteredData = data;
        if (user) {
          filteredData = data.filter(
            (service: Service) => service.user_id !== user.id,
          );
        }
        setServices(filteredData as Service[]);
      }
      setLoading(false);
    };
    fetchServices();
  }, [searchQuery, supabase]);

  // Filter by category
  const filteredServices = services.filter((service) => {
    if (selectedCategory === "ALL") return true;
    return service.category?.toUpperCase() === selectedCategory;
  });

  // Sort services
  const sortedServices = [...filteredServices].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return (b.avg_rating || 0) - (a.avg_rating || 0);
    return 0; // default
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto px-6 pt-12 pb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
          BROWSE <span className="text-primary">SERVICES</span>
        </h1>
        <p className="text-base text-muted-foreground">
          Discover talented students offering their skills. Find the perfect
          service for your needs today.
        </p>
      </div>

      {/* Filters Section */}
      <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Category Pills */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === category
                      ? "bg-primary text-white shadow-md"
                      : "bg-muted hover:bg-muted/80 text-foreground border border-border hover:border-primary/30"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Results count and Sort */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Showing {sortedServices.length} of {services.length} results
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-sm font-medium underline underline-offset-4 cursor-pointer focus:outline-none"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form className="mt-4 flex gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                name="q"
                placeholder="Search services..."
                defaultValue={searchQuery}
                className="pl-10 rounded-full border-border/50 focus:border-primary"
              />
            </div>
            <Button
              type="submit"
              className="rounded-full px-6 bg-primary hover:bg-primary/90"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {sortedServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchQuery
                ? `No services match "${searchQuery}". Try a different search term.`
                : selectedCategory !== "ALL"
                  ? `No services in the ${selectedCategory} category yet.`
                  : "No services have been listed yet. Be the first to list one!"}
            </p>
            <Link href="/dashboard/my-services/create">
              <Button className="mt-6 rounded-full bg-primary hover:bg-primary/90">
                List a Service
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedServices.map((service) => (
              <Link
                href={`/services/${service.id}`}
                key={service.id}
                className="group"
              >
                <ServiceCard
                  title={service.title}
                  description={service.description}
                  category={service.category}
                  price={service.price}
                  sellerId={service.user_id}
                  sellerName={service.profiles?.full_name || "A CMU Student"}
                  sellerAvatarUrl={service.profiles?.avatar_url || null}
                  imageUrl={
                    service.image_url ||
                    "https://placehold.co/600x400/1a1a1a/ffffff?text=Service"
                  }
                  avgRating={service.avg_rating}
                  reviewCount={service.review_count}
                />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function BrowseServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <BrowseServicesContent />
    </Suspense>
  );
}
