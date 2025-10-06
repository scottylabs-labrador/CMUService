import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { mockServices } from "@/lib/mockData";
import { Search, PenSquare, Wallet } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  // We'll just show the first 3 services as "featured"
  const featuredServices = mockServices.slice(0, 3);

  return (
    <>
      {/* Hero Section */}
      <section className="text-center py-20 md:py-32 bg-gray-50">
        <div className="container mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            The Tartan Marketplace
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
            Find peer-to-peer services from the CMU community, or offer your own
            skills to make some extra cash.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/services">Find a Service</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
               <Link href="/requests">Post a Request</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => (
              <Link href={`/services/${service.id}`} key={service.id}>
                <ServiceCard 
                  title={service.title}
                  price={service.price}
                  sellerName={service.sellerName}
                  imageUrl={service.imageUrl}
                />
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="flex flex-col items-center">
                    <div className="bg-red-100 p-4 rounded-full">
                        <Search className="h-8 w-8 text-red-700"/>
                    </div>
                    <h3 className="text-xl font-semibold mt-4">1. Find or Post</h3>
                    <p className="text-muted-foreground mt-2">Browse services offered by students or post a request for a specific task you need done.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-red-100 p-4 rounded-full">
                        <PenSquare className="h-8 w-8 text-red-700"/>
                    </div>
                    <h3 className="text-xl font-semibold mt-4">2. Agree & Collaborate</h3>
                    <p className="text-muted-foreground mt-2">Communicate with your peer, agree on the scope and price, and get the job done.</p>
                </div>
                <div className="flex flex-col items-center">
                    <div className="bg-red-100 p-4 rounded-full">
                        <Wallet className="h-8 w-8 text-red-700"/>
                    </div>
                    <h3 className="text-xl font-semibold mt-4">3. Pay Securely</h3>
                    <p className="text-muted-foreground mt-2">Once the work is complete and you&apos;re satisfied, pay securely through the platform.</p>
                </div>
            </div>
        </div>
      </section>
      
      {/* Final CTA Section */}
      <section className="py-32">
        <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mt-4 text-lg max-w-xl mx-auto text-muted-foreground">Join the CMU community marketplace today.</p>
             <div className="mt-8">
                <Button size="lg">
                    Sign Up with Andrew ID
                </Button>
             </div>
        </div>
      </section>
    </>
  );
}

