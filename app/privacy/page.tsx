import PageTransitionLayout from "@/components/PageTransitionLayout";

export default function PrivacyPage() {
    return (
        <PageTransitionLayout>
            <div className="standard-page">
                <div className="standard-content">
                    <h1 className="text-4xl md:text-5xl font-heading font-bold mb-8">
                        Privacy <span className="gradient-brand">Policy</span>
                    </h1>

                    <div className="glass-panel card-spacing-tight text-foreground/80">
                        <p className="text-sm text-foreground/60 mb-4 font-body">Last updated: {new Date().toLocaleDateString()}</p>
                        <p className="font-body">
                            At Zombie.Digital, I take your privacy seriously. This Privacy Policy explains how I collect,
                            use, disclose, and safeguard your information when you visit and use this website.
                        </p>
                    </div>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">AI Usage and Data Transparency</h2>
                        <div className="glass-panel card-spacing-tight">
                            <p className="mb-3 font-body">
                                In the interest of full transparency, I want you to know about my use of AI tools in developing
                                and maintaining this website:
                            </p>
                            <ul className="space-y-2 list-disc list-inside ml-4 mb-3 font-body">
                                <li><strong>Development:</strong> AI assists with code generation, debugging, and optimization</li>
                                <li><strong>Content:</strong> Some content may be AI-generated or enhanced, but is always reviewed and approved by me</li>
                                <li><strong>Analytics:</strong> AI may help analyze website performance and user experience patterns</li>
                                <li><strong>No Personal Data Sharing:</strong> Your personal information is never shared with AI services without explicit consent</li>
                            </ul>
                            <p className="text-sm font-body">
                                Any data processed by AI tools is anonymized and aggregated. I maintain full control over
                                all data handling practices and ensure compliance with privacy standards.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Information I Collect</h2>
                        <div className="section-spacing-tight">
                            <div className="glass-panel card-spacing-tight">
                                <h3 className="font-heading font-semibold mb-2">Personal Information</h3>
                                <p className="text-sm font-body">
                                    When you contact me or interact with the site, I may collect information such as your name,
                                    email address, and any messages you send through contact forms.
                                </p>
                            </div>

                            <div className="glass-panel card-spacing-tight">
                                <h3 className="font-heading font-semibold mb-2">Usage Data</h3>
                                <p className="text-sm font-body">
                                    I may collect information about how you access and use the website, including your IP address,
                                    browser type, pages visited, time spent on pages, and other diagnostic data.
                                </p>
                            </div>

                            <div className="glass-panel card-spacing-tight">
                                <h3 className="font-heading font-semibold mb-2">Cookies and Tracking</h3>
                                <p className="text-sm font-body">
                                    This website may use cookies and similar tracking technologies to enhance your experience
                                    and analyze website traffic. You can control cookie settings through your browser.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">How I Use Your Information</h2>
                        <ul className="space-y-2 list-disc list-inside font-body">
                            <li>To provide and maintain the website</li>
                            <li>To respond to your inquiries and communications</li>
                            <li>To improve and personalize your experience</li>
                            <li>To analyze website usage and performance (may involve AI-assisted analytics)</li>
                            <li>To comply with legal obligations</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Information Sharing</h2>
                        <p className="font-body">
                            I do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
                            except as described in this policy or as required by law. I may share aggregated, non-personally
                            identifiable information for analytical purposes. When AI tools are used for analysis, data is
                            anonymized and aggregated to protect your privacy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">AI and Third-Party Services</h2>
                        <div className="section-spacing-tight">
                            <p className="font-body">
                                When AI tools or third-party services are used in connection with this website:
                            </p>
                            <ul className="space-y-2 list-disc list-inside ml-4 font-body">
                                <li>Personal data is never shared without explicit consent</li>
                                <li>Only anonymized, aggregated data may be processed for analytical purposes</li>
                                <li>All AI processing adheres to the same privacy standards as the rest of the website</li>
                                <li>You have the right to opt out of any AI-assisted analysis of your usage patterns</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Data Security</h2>
                        <p className="font-body">
                            I implement appropriate security measures to protect your personal information against unauthorized
                            access, alteration, disclosure, or destruction. However, no method of transmission over the internet
                            or electronic storage is 100% secure. This includes data that may be processed by AI tools,
                            which is subject to the same security standards.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Your Rights</h2>
                        <p className="font-body">
                            You have the right to access, update, or delete your personal information. You may also opt out of
                            certain communications or data collection practices, including AI-assisted analytics. To exercise these rights, please contact me
                            using the information provided below.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Changes to This Policy</h2>
                        <p className="font-body">
                            I may update this Privacy Policy from time to time. Any changes will be posted on this page with
                            an updated revision date. Your continued use of the website after any changes constitutes acceptance
                            of the new Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-heading font-semibold mb-4">Contact Me</h2>
                        <p className="font-body">
                            If you have any questions about this Privacy Policy, please contact me at{" "}
                            <a href="mailto:privacy@zombie.digital" className="text-cyber-cyan hover:text-cyber-pink transition-colors">
                                privacy@zombie.digital
                            </a>
                        </p>
                    </section>
                </div>
            </div>
        </PageTransitionLayout>
    );
} 