import PageTransitionLayout from "@/components/PageTransitionLayout";

export default function TermsPage() {
    return (
        <PageTransitionLayout>
            <div className="standard-page">
                <div className="standard-content">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">
                        Terms of <span className="gradient-brand">Service</span>
                    </h1>

                    <div className="glass-panel card-spacing-tight text-foreground/80">
                        <p className="text-sm text-foreground/60 mb-4 font-body">Last updated: {new Date().toLocaleDateString()}</p>
                        <p className="font-body">
                            Welcome to Zombie.Digital. These Terms of Service ("Terms") govern your use of this website
                            and any related services provided by me. By accessing or using this website, you agree to be
                            bound by these Terms.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Acceptance of Terms</h2>
                        <p className="font-body">
                            By accessing and using this website, you accept and agree to be bound by the terms and provision
                            of this agreement. If you do not agree to abide by the above, please do not use this service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">AI-Assisted Development Disclosure</h2>
                        <div className="glass-panel card-spacing-tight">
                            <p className="mb-3 font-body">
                                I believe in transparency about my development process. This website and its applications
                                have been developed with the assistance of AI tools, including but not limited to:
                            </p>
                            <ul className="space-y-2 list-disc list-inside ml-4 mb-3 font-body">
                                <li>Code generation and optimization</li>
                                <li>Design and layout assistance</li>
                                <li>Content creation and refinement</li>
                                <li>Problem-solving and debugging support</li>
                            </ul>
                            <p className="text-sm font-body">
                                While AI tools assist in the development process, all final decisions, implementations,
                                and creative direction remain under my direct control and responsibility. The use of AI
                                enhances productivity and enables rapid prototyping while maintaining quality standards.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Use License</h2>
                        <div className="section-spacing-tight">
                            <p className="font-body">
                                Permission is granted to temporarily view the materials on this website for personal,
                                non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                            </p>
                            <ul className="space-y-2 list-disc list-inside ml-4 font-body">
                                <li>modify or copy the materials</li>
                                <li>use the materials for any commercial purpose or for any public display</li>
                                <li>attempt to reverse engineer any software contained on the website</li>
                                <li>remove any copyright or other proprietary notations from the materials</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">User Conduct</h2>
                        <div className="section-spacing-tight">
                            <p className="font-body">You agree not to use the website to:</p>
                            <ul className="space-y-2 list-disc list-inside ml-4 font-body">
                                <li>Violate any applicable laws or regulations</li>
                                <li>Transmit any harmful, offensive, or inappropriate content</li>
                                <li>Attempt to gain unauthorized access to any part of the website</li>
                                <li>Interfere with or disrupt the website's functionality</li>
                                <li>Collect or harvest any personally identifiable information</li>
                                <li>Use automated tools to scrape or extract data without permission</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Content and Intellectual Property</h2>
                        <p className="font-body">
                            All content on this website, including but not limited to text, graphics, logos, images, and software,
                            is my property or the property of content suppliers and is protected by copyright and other intellectual
                            property laws. You may not reproduce, distribute, or create derivative works without explicit permission.
                            This includes content created with AI assistance, which remains under my ownership and control.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">AI-Generated Content</h2>
                        <p className="font-body">
                            Some content on this website may be generated or enhanced with the assistance of artificial intelligence.
                            Such content is reviewed, edited, and approved by me before publication. I take responsibility for all
                            content published on this website, regardless of the tools used in its creation.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">External Links</h2>
                        <p className="font-body">
                            This website may contain links to external websites. I am not responsible for the content, privacy policies,
                            or practices of any third-party websites. You acknowledge and agree that I shall not be responsible for any
                            damages or losses caused by your use of any third-party websites.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Disclaimer</h2>
                        <div className="glass-panel card-spacing-tight">
                            <p className="text-sm font-body">
                                The materials on this website are provided on an 'as is' basis. I make no warranties, expressed or implied,
                                and hereby disclaim and negate all other warranties including without limitation, implied warranties or
                                conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property
                                or other violation of rights. This includes any AI-generated or AI-assisted content.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Limitations of Liability</h2>
                        <p className="font-body">
                            In no event shall I or my suppliers be liable for any damages (including, without limitation, damages for loss of
                            data or profit, or due to business interruption) arising out of the use or inability to use the materials on this
                            website, even if I or my authorized representative has been notified orally or in writing of the possibility of such damage.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Modifications</h2>
                        <p className="font-body">
                            I may revise these Terms of Service at any time without notice. By using this website, you are agreeing to be
                            bound by the then current version of these Terms of Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Governing Law</h2>
                        <p className="font-body">
                            These Terms and Conditions are governed by and construed in accordance with the laws of the jurisdiction in
                            which I reside, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Contact Information</h2>
                        <p className="font-body">
                            If you have any questions about these Terms of Service, please contact me at{" "}
                            <a href="mailto:legal@zombie.digital" className="text-cyber-cyan hover:text-cyber-pink transition-colors">
                                legal@zombie.digital
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </PageTransitionLayout>
    );
} 