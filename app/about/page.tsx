import PageTransitionLayout from '@/components/PageTransitionLayout'

export default function AboutPage() {
    return (
        <PageTransitionLayout>
            <div className="standard-page">
                <div className="standard-content">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">
                        About Me
                    </h1>

                    <div className="glass-panel card-spacing">
                        <p className="text-lg text-foreground/80 mb-6 font-body leading-relaxed">
                            Welcome to my digital playground! I'm a passionate developer who loves creating web applications
                            and experimenting with new technologies. This site serves as both my portfolio and a testing ground
                            for various web app prototypes and ideas.
                        </p>

                        <p className="text-lg text-foreground/80 mb-6 font-body leading-relaxed">
                            What started as a simple Twitch management tool has evolved into a comprehensive platform where
                            I explore different aspects of web development - from real-time features and social integrations
                            to modern UI/UX patterns and performance optimization.
                        </p>

                        <p className="text-lg text-foreground/80 mb-6 font-body leading-relaxed">
                            Every feature you see here represents hours of learning, experimentation, and refinement.
                            I believe in building things that are not just functional, but also beautiful and intuitive to use.
                        </p>

                        <p className="text-lg text-foreground/80 font-body leading-relaxed">
                            Whether you're here to explore the features, check out my work, or just curious about what's possible
                            with modern web technologies, I hope you find something interesting. Feel free to reach out if you'd
                            like to collaborate or just chat about development!
                        </p>
                    </div>

                    <div className="glass-panel card-spacing">
                        <h2 className="text-2xl font-heading font-semibold mb-4">Development Philosophy & AI Transparency</h2>

                        <p className="text-foreground/80 mb-6 font-body leading-relaxed">
                            I believe in transparent development practices, especially when it comes to AI assistance.
                            Here's how I approach building this platform:
                        </p>

                        <div className="section-spacing-tight">
                            <div>
                                <h3 className="font-heading font-semibold text-cyber-cyan mb-2">How I Use AI</h3>
                                <p className="text-foreground/80 font-body leading-relaxed">
                                    I use AI tools like Claude and GitHub Copilot as sophisticated coding assistants. They help me:
                                    write boilerplate code faster, debug complex issues, explore new approaches to problems,
                                    and learn about technologies I'm not familiar with. Think of it like having a very knowledgeable
                                    pair programming partner who never gets tired.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-cyber-cyan mb-2">My Role</h3>
                                <p className="text-foreground/80 font-body leading-relaxed">
                                    Every feature, design decision, and architectural choice comes from me. I write the prompts,
                                    review all code, make the creative decisions, and ensure everything meets my standards.
                                    AI helps me implement ideas faster, but the ideas themselves and the overall vision are entirely mine.
                                </p>

                                <p className="text-foreground/80 mt-4 font-body leading-relaxed">
                                    I also spend significant time refactoring, optimizing, and adding personal touches that reflect
                                    my coding style and preferences. The end result is code that I'm proud to call my own.
                                </p>

                                <p className="text-foreground/80 mt-4 font-body leading-relaxed">
                                    I believe this approach represents the future of development - humans and AI working together,
                                    each contributing their strengths to create something better than either could achieve alone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel card-spacing">
                        <h2 className="text-2xl font-heading font-semibold mb-4">What You'll Find Here</h2>

                        <div className="grid-responsive-2">
                            <div>
                                <h3 className="font-heading font-semibold text-cyber-cyan mb-3">🎮 Twitch Integration</h3>
                                <p className="text-foreground/80 font-body leading-relaxed">
                                    Real-time follower tracking, stream analytics, and social media management tools.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-cyber-cyan mb-3">🎨 Interactive Canvas</h3>
                                <p className="text-foreground/80 font-body leading-relaxed">
                                    Dynamic overlay system for streamers with customizable widgets and real-time updates.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-cyber-cyan mb-3">🔗 Social Links</h3>
                                <p className="text-foreground/80 font-body leading-relaxed">
                                    Centralized social media presence management with beautiful, shareable profiles.
                                </p>
                            </div>

                            <div>
                                <h3 className="font-heading font-semibold text-cyber-cyan mb-3">⚡ Modern Tech Stack</h3>
                                <p className="text-foreground/80 font-body leading-relaxed">
                                    Built with Next.js, TypeScript, Supabase, and other cutting-edge technologies.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel card-spacing">
                        <h2 className="text-2xl font-heading font-semibold mb-4">Current Focus</h2>
                        <p className="text-foreground/80 font-body leading-relaxed">
                            I'm constantly iterating and improving the platform. Current areas of focus include
                            performance optimization, mobile responsiveness, accessibility improvements, and exploring
                            new features that push the boundaries of what's possible in web applications.
                        </p>
                    </div>
                </div>
            </div>
        </PageTransitionLayout>
    );
} 