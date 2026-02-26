/**
 * Test module that provides a custom header provider service
 */
export default {
  __init__: [ 'customHeaderProviderService' ],
  customHeaderProviderService: [ 'type', CustomHeaderProviderService ]
};

function CustomHeaderProviderService() {

  this.getHeaderProvider = function() {
    return {
      getIcon: () => null,
      getTypeLabel: () => 'Custom Element'
    };
  };
}

// Register the service with the correct name for injection
CustomHeaderProviderService.$inject = [];
