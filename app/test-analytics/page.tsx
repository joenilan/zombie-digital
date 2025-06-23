'use client'

import { useEffect, useState } from 'react'
import { umami } from '@/lib/umami'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CopyButton } from '@/components/ui/action-button'
import { Activity } from '@/lib/icons'

export default function TestAnalyticsPage() {
    const [sessionId, setSessionId] = useState<string | null>(null)
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function initializeTracking() {
            try {
                await umami.initialize()
                await umami.trackPageView({
                    url: window.location.href,
                    title: 'Analytics Test Page',
                    referrer: document.referrer || undefined
                })

                // Get session ID from localStorage
                const storedSessionId = localStorage.getItem('umami_session_id')
                setSessionId(storedSessionId)
            } catch (error) {
                console.error('Error initializing tracking:', error)
            }
        }

        initializeTracking()
    }, [])

    const trackCustomEvent = async () => {
        setLoading(true)
        try {
            await umami.trackEvent({
                name: 'test_button_click',
                data: {
                    button_type: 'test',
                    timestamp: new Date().toISOString(),
                    page: 'analytics_test'
                }
            })

            // Fetch recent events to show they're working
            const recentEvents = await umami.getPageViews()
            setEvents(recentEvents || [])
        } catch (error) {
            console.error('Error tracking event:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto space-y-6">
                <Card variant="glass">
                    <CardHeader>
                        <CardTitle>Analytics Test Page</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Session ID:</p>
                            <p className="font-mono text-sm bg-glass/20 p-2 rounded">
                                {sessionId || 'Not initialized'}
                            </p>
                        </div>

                        <CopyButton
                            onClick={trackCustomEvent}
                            disabled={loading}
                            tooltip={loading ? 'Tracking event...' : 'Track a test event'}
                            className="w-full"
                            icon={<Activity className="w-4 h-4" />}
                        >
                            {loading ? 'Tracking Event...' : 'Track Test Event'}
                        </CopyButton>

                        {events.length > 0 && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Recent Events:</p>
                                <div className="space-y-2">
                                    {events.slice(0, 5).map((event, index) => (
                                        <div key={index} className="bg-glass/20 p-2 rounded text-xs">
                                            <p><strong>URL:</strong> {event.url_path}</p>
                                            <p><strong>Time:</strong> {new Date(event.created_at).toLocaleString()}</p>
                                            {event.event_name && <p><strong>Event:</strong> {event.event_name}</p>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 