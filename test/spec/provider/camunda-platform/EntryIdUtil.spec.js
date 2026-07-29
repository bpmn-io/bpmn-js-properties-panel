import { expect } from 'chai';

import { BpmnModdle } from 'bpmn-moddle';

import CamundaModdle from 'camunda-bpmn-moddle/resources/camunda';

import { getCamundaPlatformEntryId } from '../../../../src/provider/camunda-platform/utils/EntryIdUtil';


describe('provider/camunda-platform - EntryIdUtil', function() {

  const moddle = new BpmnModdle({
    camunda: CamundaModdle
  });

  function createElement(type, properties) {
    return moddle.create(type, properties);
  }


  describe('#getCamundaPlatformEntryId', function() {

    it('should resolve historyTimeToLive on a process', function() {

      // given
      const process = createElement('bpmn:Process', {
        id: 'Process_1',
        'camunda:historyTimeToLive': 'P5D'
      });

      // when
      const entryId = getCamundaPlatformEntryId(process, [ 'historyTimeToLive' ]);

      // then
      expect(entryId).to.eql('historyTimeToLive');
    });


    it('should resolve historyTimeToLive via a participant processRef', function() {

      // given
      const process = createElement('bpmn:Process', {
        id: 'Process_1',
        'camunda:historyTimeToLive': 'P5D'
      });

      const participant = createElement('bpmn:Participant', {
        id: 'Participant_1',
        processRef: process
      });

      // when
      const entryId = getCamundaPlatformEntryId(participant, [ 'processRef', 'historyTimeToLive' ]);

      // then
      expect(entryId).to.eql('historyTimeToLive');
    });


    it('should not resolve an unknown property', function() {

      // given
      const process = createElement('bpmn:Process', { id: 'Process_1' });

      // when
      const entryId = getCamundaPlatformEntryId(process, [ 'name' ]);

      // then
      expect(entryId).to.be.null;
    });


    it('should not resolve an empty path', function() {

      // given
      const process = createElement('bpmn:Process', { id: 'Process_1' });

      // when
      const entryId = getCamundaPlatformEntryId(process, []);

      // then
      expect(entryId).to.be.null;
    });


    it('should not resolve without an element', function() {

      // when
      const entryId = getCamundaPlatformEntryId(null, [ 'historyTimeToLive' ]);

      // then
      expect(entryId).to.be.null;
    });

  });

});
