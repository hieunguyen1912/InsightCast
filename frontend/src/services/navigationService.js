/**
 * Navigation Service
 * Provides programmatic navigation outside of React components
 * Used by axios interceptors and other non-component code
 */

class NavigationService {
  constructor() {
    this.navigator = null;
  }

  /**
   * Set the navigate function from React Router
   * Should be called from a component within Router context
   * @param {Function} navigate - The navigate function from useNavigate()
   */
  setNavigator(navigate) {
    this.navigator = navigate;
  }

  /**
   * Navigate to a path
   * @param {string} path - Path to navigate to
   * @param {Object} options - Navigation options (replace, state, etc.)
   */
  navigate(path, options = {}) {
    if (this.navigator) {
      this.navigator(path, options);
    } else {
      // Fallback to window.location if navigator not set
      console.warn('NavigationService: Navigator not set, using window.location');
      window.location.href = path;
    }
  }

  /**
   * Navigate with replace option (no history entry)
   * @param {string} path - Path to navigate to
   */
  replace(path) {
    this.navigate(path, { replace: true });
  }

  /**
   * Go back in history
   */
  goBack() {
    if (this.navigator) {
      this.navigator(-1);
    } else {
      window.history.back();
    }
  }
}

// Export singleton instance
export const navigationService = new NavigationService();
export default navigationService;

