class CashierSessionManager {
  private static readonly SESSION_KEY = 'cashier_session'
  private static readonly SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours

  static setSession(cashier: unknown): void {
    if (typeof window === 'undefined') return

    const sessionData = {
      cashier,
      loginTime: Date.now(),
      expiresAt: Date.now() + this.SESSION_DURATION
    }

    localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData))
  }

  static getSession(): { cashier: unknown; loginTime: number; expiresAt: number } | null {
    if (typeof window === 'undefined') return null

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY)
      if (!sessionData) return null

      const session = JSON.parse(sessionData)
      
      // Check if session has expired
      if (Date.now() > session.expiresAt) {
        this.clearSession()
        return null
      }

      return session
    } catch (error) {
      console.error('Error parsing session data:', error)
      this.clearSession()
      return null
    }
  }

  static extendSession(): void {
    const session = this.getSession()
    if (session) {
      session.expiresAt = Date.now() + this.SESSION_DURATION
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session))
    }
  }

  static clearSession(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.SESSION_KEY)
  }

  static isSessionValid(): boolean {
    return this.getSession() !== null
  }
}

export default CashierSessionManager
