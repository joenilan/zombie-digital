import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export interface UmamiPageView {
  url: string
  title?: string
  referrer?: string
}

export interface UmamiEvent {
  name: string
  data?: Record<string, any>
}

class UmamiAnalytics {
  private supabase = createClientComponentClient()
  private websiteId: string | null = null
  private sessionId: string | null = null

  async initialize(websiteId?: string) {
    if (websiteId) {
      this.websiteId = websiteId
    } else {
      // Get the default website ID
      const { data } = await this.supabase
        .from('umami_website')
        .select('website_id')
        .eq('domain', 'localhost:3000')
        .single()
      
      this.websiteId = data?.website_id || null
    }

    // Create or get session
    if (this.websiteId) {
      await this.getOrCreateSession()
    }
  }

  private async getOrCreateSession() {
    if (!this.websiteId) return

    // Try to get existing session from localStorage
    const existingSessionId = localStorage.getItem('umami_session_id')
    
    if (existingSessionId) {
      // Check if session is still valid (less than 30 minutes old)
      const { data } = await this.supabase
        .from('umami_session')
        .select('session_id')
        .eq('session_id', existingSessionId)
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
        .single()

      if (data) {
        this.sessionId = existingSessionId
        return
      }
    }

    // Create new session - websiteId is guaranteed to be non-null here
    const sessionData = {
      website_id: this.websiteId as string,
      hostname: window.location.hostname,
      browser: this.getBrowser(),
      os: this.getOS(),
      device: this.getDevice(),
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language,
      country: null,
    }

    const { data, error } = await this.supabase
      .from('umami_session')
      .insert(sessionData)
      .select('session_id')
      .single()

    if (!error && data) {
      this.sessionId = data.session_id
      if (this.sessionId) {
        localStorage.setItem('umami_session_id', this.sessionId)
      }
    }
  }

  async trackPageView({ url, title, referrer }: UmamiPageView) {
    if (!this.websiteId || !this.sessionId) {
      await this.initialize()
    }

    if (!this.websiteId || !this.sessionId) return

    const urlObj = new URL(url, window.location.origin)
    const referrerObj = referrer ? new URL(referrer, window.location.origin) : null

    const eventData = {
      website_id: this.websiteId,
      session_id: this.sessionId,
      url_path: urlObj.pathname,
      url_query: urlObj.search,
      referrer_path: referrerObj?.pathname || null,
      referrer_query: referrerObj?.search || null,
      referrer_domain: referrerObj?.hostname || null,
      page_title: title || document.title,
      event_type: 1, // Page view
    }

    await this.supabase
      .from('umami_website_event')
      .insert(eventData)
  }

  async trackEvent({ name, data }: UmamiEvent) {
    if (!this.websiteId || !this.sessionId) {
      await this.initialize()
    }

    if (!this.websiteId || !this.sessionId) return

    // Insert the event
    const { data: eventResult, error } = await this.supabase
      .from('umami_website_event')
      .insert({
        website_id: this.websiteId,
        session_id: this.sessionId,
        url_path: window.location.pathname,
        url_query: window.location.search,
        page_title: document.title,
        event_type: 2, // Custom event
        event_name: name,
      })
      .select('event_id')
      .single()

    // Insert event data if provided
    if (!error && eventResult && data) {
      const eventDataEntries = Object.entries(data).map(([key, value]) => ({
        event_id: eventResult.event_id,
        website_id: this.websiteId as string,
        event_key: key,
        string_value: typeof value === 'string' ? value : null,
        number_value: typeof value === 'number' ? value : null,
        date_value: value instanceof Date ? value.toISOString() : null,
        data_type: typeof value === 'string' ? 1 : typeof value === 'number' ? 2 : 3,
      }))

      await this.supabase
        .from('umami_event_data')
        .insert(eventDataEntries)
    }
  }

  // Analytics query methods
  async getPageViews(websiteId?: string, startDate?: Date, endDate?: Date) {
    const targetWebsiteId = websiteId || this.websiteId
    if (!targetWebsiteId) return null

    let query = this.supabase
      .from('umami_website_event')
      .select('*')
      .eq('website_id', targetWebsiteId)
      .eq('event_type', 1)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    return error ? null : data
  }

  async getUniqueVisitors(websiteId?: string, startDate?: Date, endDate?: Date) {
    const targetWebsiteId = websiteId || this.websiteId
    if (!targetWebsiteId) return 0

    let query = this.supabase
      .from('umami_session')
      .select('session_id')
      .eq('website_id', targetWebsiteId)

    if (startDate) {
      query = query.gte('created_at', startDate.toISOString())
    }
    if (endDate) {
      query = query.lte('created_at', endDate.toISOString())
    }

    const { data, error } = await query
    return error ? 0 : data?.length || 0
  }

  async getTopPages(websiteId?: string, startDate?: Date, endDate?: Date, limit = 10) {
    const targetWebsiteId = websiteId || this.websiteId
    if (!targetWebsiteId) return []

    // Get page views for the specified period
    const pageViews = await this.getPageViews(targetWebsiteId, startDate, endDate)
    if (!pageViews) return []

    // Count views per page
    const pageCounts = pageViews.reduce((acc: Record<string, number>, view: any) => {
      const path = view.url_path
      acc[path] = (acc[path] || 0) + 1
      return acc
    }, {})

    return Object.entries(pageCounts)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
  }

  // Utility methods
  private getBrowser(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Chrome')) return 'Chrome'
    if (userAgent.includes('Firefox')) return 'Firefox'
    if (userAgent.includes('Safari')) return 'Safari'
    if (userAgent.includes('Edge')) return 'Edge'
    return 'Unknown'
  }

  private getOS(): string {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Windows')) return 'Windows'
    if (userAgent.includes('Mac')) return 'macOS'
    if (userAgent.includes('Linux')) return 'Linux'
    if (userAgent.includes('Android')) return 'Android'
    if (userAgent.includes('iOS')) return 'iOS'
    return 'Unknown'
  }

  private getDevice(): string {
    const userAgent = navigator.userAgent
    if (/Mobi|Android/i.test(userAgent)) return 'Mobile'
    if (/Tablet|iPad/i.test(userAgent)) return 'Tablet'
    return 'Desktop'
  }
}

// Export singleton instance
export const umami = new UmamiAnalytics()

// React hook for easy usage
export function useUmami() {
  return umami
} 