import PageTransitionLayout from "@/components/PageTransitionLayout";
import { Footer } from "@/components/Footer";

export default function LocationsPage() {
    const locations = [
        {
            name: "North America",
            city: "San Francisco, CA",
            description: "Primary development hub and headquarters",
            status: "Active"
        },
        {
            name: "Europe",
            city: "Amsterdam, Netherlands",
            description: "European operations and data center",
            status: "Active"
        },
        {
            name: "Asia Pacific",
            city: "Singapore",
            description: "APAC regional hub and support center",
            status: "Active"
        }
    ];

    return (
        <PageTransitionLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-6 py-24">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-8">
                            Our <span className="gradient-brand">Locations</span>
                        </h1>

                        <p className="text-lg text-foreground/80 mb-12">
                            Zombie.Digital operates globally with strategic locations to ensure
                            optimal performance and support for streamers worldwide.
                        </p>

                        <div className="grid md:grid-cols-3 gap-8 mb-12">
                            {locations.map((location, index) => (
                                <div
                                    key={location.name}
                                    className="p-6 rounded-xl bg-glass/50 backdrop-blur-xl border border-white/5"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-semibold">{location.name}</h3>
                                        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400">
                                            {location.status}
                                        </span>
                                    </div>
                                    <p className="text-cyber-cyan font-medium mb-2">{location.city}</p>
                                    <p className="text-foreground/70 text-sm">{location.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/5">
                            <h2 className="text-2xl font-semibold mb-4">Global Infrastructure</h2>
                            <div className="space-y-4 text-foreground/80">
                                <p>
                                    Our distributed infrastructure ensures low-latency connections and
                                    reliable service delivery regardless of your location.
                                </p>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>99.9% uptime guarantee across all regions</li>
                                    <li>Sub-100ms response times for real-time features</li>
                                    <li>24/7 monitoring and support coverage</li>
                                    <li>Automatic failover and redundancy systems</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </PageTransitionLayout>
    );
} 