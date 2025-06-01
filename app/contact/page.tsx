import PageTransitionLayout from "@/components/PageTransitionLayout";

export default function ContactPage() {
    return (
        <PageTransitionLayout>
            <div className="standard-page">
                <div className="standard-content">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">
                        Contact
                    </h1>

                    <div className="glass-panel card-spacing">
                        <h2 className="text-2xl font-heading font-semibold mb-4">Get in Touch</h2>
                        <p className="text-lg text-foreground/80 mb-6 font-body leading-relaxed">
                            Have questions, suggestions, or just want to chat about development? I'd love to hear from you!
                        </p>

                        <div className="grid-responsive-3">
                            <div>
                                <h3 className="font-heading font-semibold mb-2">Support</h3>
                                <p className="text-foreground/80 text-sm font-body">
                                    Technical issues or feature requests
                                </p>
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold mb-2">Business Inquiries</h3>
                                <p className="text-foreground/80 text-sm font-body">
                                    Collaboration opportunities
                                </p>
                            </div>
                            <div>
                                <h3 className="font-heading font-semibold mb-2">Response Time</h3>
                                <p className="text-foreground/80 text-sm font-body">
                                    Usually within 24-48 hours
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel card-spacing">
                        <h2 className="text-2xl font-heading font-semibold mb-6">Send us a Message</h2>
                        <form className="section-spacing-tight">
                            <div>
                                <label className="block text-sm font-ui font-medium mb-2">Name</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-cyber-pink/50 transition-all duration-200 font-body"
                                    placeholder="Your name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-ui font-medium mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-cyber-pink/50 transition-all duration-200 font-body"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-ui font-medium mb-2">Message</label>
                                <textarea
                                    rows={6}
                                    className="w-full px-4 py-3 rounded-lg bg-background/50 border border-white/10 text-foreground placeholder-foreground/50 focus:outline-none focus:ring-2 focus:ring-cyber-pink/50 transition-all duration-200 resize-none font-body"
                                    placeholder="Tell me about your project, question, or just say hello..."
                                />
                            </div>
                            <button
                                type="submit"
                                className="ethereal-button w-full py-4 text-lg font-ui"
                            >
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PageTransitionLayout>
    );
} 