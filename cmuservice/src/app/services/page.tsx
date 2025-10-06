import { ServiceCard } from "@/components/ServiceCard";
import { mockServices } from "@/lib/mockData";
import Link from "next/link";

export default function BrowseServicesPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold">Browse Services</h1>
      <p className="mt-2 text-muted-foreground mb-8">
        Here you&apos;ll see a list of all the amazing services offered by CMU students.
      </p>

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

    </div>
  );
}

