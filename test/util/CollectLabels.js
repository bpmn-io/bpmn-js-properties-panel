import TestContainer from 'mocha-test-container-support';

export function collectLabels(provider) {
  const labelsMap = new Map();
  afterEach(async function() {

    const container = TestContainer.get(this);
    const groups = container.querySelectorAll('[data-group-id]');

    for (const group of groups) {
      const id = group.getAttribute('data-group-id');
      const title = group.querySelector('.bio-properties-panel-group-header-title').textContent;

      const payload = {
        id,
        title,
        provider,
        type: 'group'
      };

      labelsMap.set(id, payload);
    }

    const entries = container.querySelectorAll('[data-entry-id]:has(.bio-properties-panel-tooltip-wrapper)');

    for (const entry of entries) {
      const id = entry.getAttribute('data-entry-id');
      const title = entry.querySelector('.bio-properties-panel-label').textContent;

      const payload = {
        id,
        title,
        provider,
        type: 'entry'
      };

      labelsMap.set(id, payload);
    }
  });

  after(function() {
    for (const [ _, value ] of labelsMap) {
      const message = {
        type: 'label',
        value
      };

      console.log(JSON.stringify(message));
    }
  });
}
