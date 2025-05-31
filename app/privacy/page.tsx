import PageTransitionLayout from "@/components/PageTransitionLayout";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
    return (
        <PageTransitionLayout>
            <div className="min-h-screen">
                <div className="container mx-auto px-6 py-24">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold mb-8">
                            Privacy <span className="gradient-brand">Policy</span>
                        </h1>

                        <div className="space-y-8 text-foreground/80">
                            <div className="p-6 rounded-xl bg-glass/30 backdrop-blur-xl border border-white/5">
                                <p className="text-sm text-foreground/60 mb-4">Last updated: {new Date().toLocaleDateString()}</p>
                                <p>
                                    At Zombie.Digital, we take your privacy seriously. This Privacy Policy explains how we collect,
                                    use, disclose, and safeguard your information when you use our platform.
                                </p>
                            </div>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-lg bg-glass/20 backdrop-blur-xl border border-white/5">
                                        <h3 className="font-semibold mb-2">Account Information</h3>
                                        <p className="text-sm">
                                            When you connect your Twitch account, we collect your username, display name,
                                            and basic profile information as provided by Twitch's API.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-glass/20 backdrop-blur-xl border border-white/5">
                                        <h3 className="font-semibold mb-2">Usage Data</h3>
                                        <p className="text-sm">
                                            We collect information about how you use our platform, including features accessed,
                                            time spent, and interaction patterns to improve our services.
                                        </p>
                                    </div>

                                    <div className="p-4 rounded-lg bg-glass/20 backdrop-blur-xl border border-white/5">
                                        <h3 className="font-semibold mb-2">Stream Analytics</h3>
                                        <p className="text-sm">
                                            With your permission, we analyze your stream data to provide insights and
                                            recommendations for improving your content.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>Provide and maintain our services</li>
                                    <li>Improve and personalize your experience</li>
                                    <li>Generate analytics and insights for your stream</li>
                                    <li>Communicate with you about updates and features</li>
                                    <li>Ensure platform security and prevent abuse</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
                                <p>
                                    We implement industry-standard security measures to protect your data, including
                                    encryption in transit and at rest, regular security audits, and access controls.
                                    However, no method of transmission over the internet is 100% secure.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
                                <p>
                                    You have the right to access, update, or delete your personal information.
                                    You can also opt out of certain data collection practices through your account settings.
                                </p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
                                <p>
                                    If you have any questions about this Privacy Policy, please contact us at{" "}
                                    <a href="mailto:privacy@zombie.digital" className="text-cyber-cyan hover:text-cyber-pink transition-colors">
                                        privacy@zombie.digital
                                    </a>
                                </p>
                            </section>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </PageTransitionLayout>
    );
} 