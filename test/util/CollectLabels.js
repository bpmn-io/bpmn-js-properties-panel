import TestContainer from 'mocha-test-container-support';

export function collectLabels(name) {
  const groupsMap = new Map();
  afterEach(async function() {

    const container = TestContainer.get(this);
    const groups = container.querySelectorAll('[data-group-id]');

    for (const group of groups) {
      const id = group.getAttribute('data-group-id');
      const title = group.querySelector('.bio-properties-panel-group-header-title').textContent;

      const payload = {
        id,
        title
      };

      groupsMap.set(id, payload);
    }
  });

  after(function() {
    for (const [ _, value ] of groupsMap) {
      const message = {
        type: 'label',
        value
      };

      console.log(JSON.stringify(message));
    }
  });
}
