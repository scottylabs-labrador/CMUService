// src/app/page.tsx

'use client'; // Required for hooks

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ServiceCard } from '@/components/ServiceCard';
import { mockServices } from '@/lib/mockData';

export default function HomePage() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  // This effect runs when the component loads.
  // If the user is logged in, it redirects them to the dashboard.
  useEffect(() => {
    if (isLoggedIn) {
      router.push('/dashboard');
    }
  }, [isLoggedIn, router]);

  // To prevent the homepage from flashing before the redirect,
  // we can return null if the user is logged in.
  if (isLoggedIn) {
    return null; 
  }

  // A logged-out user will see the normal homepage:
  return (
    <div>
      {/* Hero Section */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-bold">The Tartan Marketplace</h1>
        <p className="text-xl text-muted-foreground mt-4">Services by students, for students.</p>
        <div className="mt-8 flex justify-center gap-4">
          <Button asChild size="lg">
            <Link href="/services">Find a Service</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/requests">Post a Request</Link>
          </Button>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockServices.map((service) => (
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
      </section>
    </div>
  );
}