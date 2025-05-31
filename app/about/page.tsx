import PageTransitionLayout from "@/components/PageTransitionLayout";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
    return (
        <PageTransitionLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-6 py-24">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-8">
                            About <span className="gradient-brand">Zombie.Digital</span>
                        </h1>

                        <div className="space-y-6 text-lg text-foreground/80">
                            <p>
                                Zombie.Digital is a cutting-edge platform designed specifically for Twitch streamers
                                who want to take their content creation to the next level. We understand the challenges
                                that modern streamers face and have built comprehensive tools to address them.
                            </p>

                            <p>
                                Our mission is to empower content creators with professional-grade tools that were
                                previously only available to large organizations. From advanced analytics to automated
                                moderation, we provide everything you need to build and maintain a thriving streaming community.
                            </p>

                            <p>
                                Founded by streamers for streamers, we know what it takes to succeed in the competitive
                                world of content creation. Our team combines years of streaming experience with cutting-edge
                                technology to deliver solutions that actually work.
                            </p>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </PageTransitionLayout>
    );
} 