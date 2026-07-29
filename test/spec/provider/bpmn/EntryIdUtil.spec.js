import { expect } from 'chai';

import { BpmnModdle } from 'bpmn-moddle';

import { getBpmnEntryId } from '../../../../src/provider/bpmn/utils/EntryIdUtil';


describe('provider/bpmn - EntryIdUtil', function() {

  const moddle = new BpmnModdle();

  function createElement(type, properties) {
    return moddle.create(type, properties);
  }


  describe('#getBpmnEntryId', function() {

    it('should resolve element documentation', function() {

      // given
      const task = createElement('bpmn:ServiceTask', { id: 'Task_1' });

      // when
      const entryId = getBpmnEntryId(task, [ 'documentation' ]);

      // then
      expect(entryId).to.eql('documentation');
    });


    it('should not resolve an unknown property', function() {

      // given
      const task = createElement('bpmn:ServiceTask', { id: 'Task_1' });

      // when
      const entryId = getBpmnEntryId(task, [ 'name' ]);

      // then
      expect(entryId).to.be.null;
    });


    it('should not resolve an empty path', function() {

      // given
      const task = createElement('bpmn:ServiceTask', { id: 'Task_1' });

      // when
      const entryId = getBpmnEntryId(task, []);

      // then
      expect(entryId).to.be.null;
    });


    it('should not resolve without an element', function() {

      // when
      const entryId = getBpmnEntryId(null, [ 'documentation' ]);

      // then
      expect(entryId).to.be.null;
    });

  });

});
