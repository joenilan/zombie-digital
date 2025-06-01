import PageTransitionLayout from "@/components/PageTransitionLayout";

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
            <div className="standard-page">
                <div className="standard-content">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">
                        Our <span className="gradient-brand">Locations</span>
                    </h1>

                    <p className="text-lg text-foreground/80 mb-12 font-body">
                        Zombie.Digital operates globally with strategic locations to ensure
                        optimal performance and support for streamers worldwide.
                    </p>

                    <div className="grid-responsive-3 mb-12">
                        {locations.map((location, index) => (
                            <div
                                key={location.name}
                                className="glass-panel card-spacing-tight"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-heading font-semibold">{location.name}</h3>
                                    <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 font-ui">
                                        {location.status}
                                    </span>
                                </div>
                                <p className="text-cyber-cyan font-ui font-medium mb-2">{location.city}</p>
                                <p className="text-foreground/70 text-sm font-body">{location.description}</p>
                            </div>
                        ))}
                    </div>

                    <div className="glass-panel card-spacing">
                        <h2 className="text-2xl font-heading font-semibold mb-4">Global Infrastructure</h2>
                        <div className="section-spacing-tight text-foreground/80">
                            <p className="font-body">
                                Our distributed infrastructure ensures low-latency connections and
                                reliable service delivery regardless of your location.
                            </p>
                            <ul className="space-y-2 list-disc list-inside font-body">
                                <li>99.9% uptime guarantee across all regions</li>
                                <li>Sub-100ms response times for real-time features</li>
                                <li>24/7 monitoring and support coverage</li>
                                <li>Automatic failover and redundancy systems</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransitionLayout>
    );
} 