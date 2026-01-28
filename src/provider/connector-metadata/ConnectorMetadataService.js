/**
 * Service for fetching and managing connector metadata from external APIs.
 * This service provides a mock implementation for demonstration purposes.
 */
export default class ConnectorMetadataService {

  constructor(eventBus) {
    this._eventBus = eventBus;
    this._metadata = {};
    this._loading = {};
  }

  /**
   * Fetch metadata for a given connector element.
   * In production, this would call a real REST API.
   *
   * @param {Object} element - The BPMN element
   * @param {Object} template - The element template
   * @returns {Promise<Object>} The fetched metadata
   */
  async fetchMetadata(element, template) {
    const templateId = template.id;

    // Prevent concurrent requests
    if (this._loading[templateId]) {
      console.warn(`Already loading metadata for template: ${templateId}`);
      return this._metadata[templateId];
    }

    // Simulate API call delay
    this._loading[templateId] = true;
    this._eventBus.fire('connectorMetadata.loading', { element, template });

    try {

      // Mock API call - in production, this would be a real HTTP request
      const metadata = await this._mockFetchFromApi(templateId, element);

      this._metadata[templateId] = metadata;
      this._loading[templateId] = false;

      this._eventBus.fire('connectorMetadata.fetched', {
        element,
        template,
        metadata
      });

      return metadata;
    } catch (error) {
      this._loading[templateId] = false;
      this._eventBus.fire('connectorMetadata.error', {
        element,
        template,
        error
      });
      throw error;
    }
  }

  /**
   * Get cached metadata for a template.
   *
   * @param {string} templateId - The template ID
   * @returns {Object|null} The cached metadata or null
   */
  getMetadata(templateId) {
    return this._metadata[templateId] || null;
  }

  /**
   * Check if metadata is currently being loaded.
   *
   * @param {string} templateId - The template ID
   * @returns {boolean} True if loading
   */
  isLoading(templateId) {
    return this._loading[templateId] || false;
  }

  /**
   * Clear cached metadata for a template.
   *
   * @param {string} templateId - The template ID
   */
  clearMetadata(templateId) {
    delete this._metadata[templateId];
  }

  /**
   * Mock API fetch - simulates calling a REST endpoint.
   * This would be replaced with actual HTTP calls in production.
   *
   * @param {string} templateId - The template ID
   * @param {Object} element - The BPMN element (could contain credentials, etc.)
   * @returns {Promise<Object>} Mock metadata
   */
  async _mockFetchFromApi(templateId, element) {
    return new Promise((resolve) => {

      // Simulate network delay
      setTimeout(() => {

        // Return mock data based on template type
        if (templateId.includes('slack')) {
          resolve({
            channels: [
              { id: 'C123ABC', name: '#general' },
              { id: 'C456DEF', name: '#engineering' },
              { id: 'C789GHI', name: '#product' },
              { id: 'C012JKL', name: '#marketing' },
              { id: 'C345MNO', name: '#sales' }
            ],
            users: [
              { id: 'U123', name: '@john.doe' },
              { id: 'U456', name: '@jane.smith' },
              { id: 'U789', name: '@bot' }
            ]
          });
        } else {

          // Generic metadata for other connectors
          resolve({
            options: [
              { id: 'option1', name: 'Option 1' },
              { id: 'option2', name: 'Option 2' },
              { id: 'option3', name: 'Option 3' }
            ]
          });
        }
      }, 800); // Simulate 800ms API response time
    });
  }
}

ConnectorMetadataService.$inject = [ 'eventBus' ];
