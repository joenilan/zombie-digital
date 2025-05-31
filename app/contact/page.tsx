import PageTransitionLayout from "@/components/PageTransitionLayout";
import { Footer } from "@/components/Footer";

export default function ContactPage() {
    return (
        <PageTransitionLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-6 py-24">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-8">
                            Contact <span className="gradient-brand">Us</span>
                        </h1>

                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
                                <p className="text-foreground/80">
                                    Have questions about our platform? Need technical support?
                                    We're here to help you succeed.
                                </p>

                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-glass/30 backdrop-blur-xl border border-white/5">
                                        <h3 className="font-semibold mb-2">Support</h3>
                                        <p className="text-foreground/70">support@zombie.digital</p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-glass/30 backdrop-blur-xl border border-white/5">
                                        <h3 className="font-semibold mb-2">Business Inquiries</h3>
                                        <p className="text-foreground/70">business@zombie.digital</p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-glass/30 backdrop-blur-xl border border-white/5">
                                        <h3 className="font-semibold mb-2">Response Time</h3>
                                        <p className="text-foreground/70">Within 24 hours</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-xl bg-glass/50 backdrop-blur-xl border border-white/5">
                                <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
                                <form className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Name</label>
                                        <input
                                            type="text"
                                            className="w-full p-3 rounded-lg bg-background/50 border border-white/10 focus:border-cyber-cyan focus:outline-none transition-colors"
                                            placeholder="Your name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Email</label>
                                        <input
                                            type="email"
                                            className="w-full p-3 rounded-lg bg-background/50 border border-white/10 focus:border-cyber-cyan focus:outline-none transition-colors"
                                            placeholder="your@email.com"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium mb-2">Message</label>
                                        <textarea
                                            rows={4}
                                            className="w-full p-3 rounded-lg bg-background/50 border border-white/10 focus:border-cyber-cyan focus:outline-none transition-colors resize-none"
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full ethereal-button"
                                    >
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </PageTransitionLayout>
    );
} 