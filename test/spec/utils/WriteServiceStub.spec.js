import { expect } from 'chai';

import {
  getWriteService,
  isWriteService,
  withWriteServiceStubs
} from 'src/utils/WriteServiceStub';


describe('utils/WriteServiceStub', function() {

  const injector = createInjector({ translate: 'translate', commandStack: 'real-command-stack' });


  describe('#isWriteService', function() {

    it('should identify write services', function() {

      // then
      [ 'commandStack', 'bpmnFactory', 'modeling', 'debounceInput' ].forEach(type => {
        expect(isWriteService(type), type).to.be.true;
      });

      [ 'translate', 'canvas', 'elementRegistry' ].forEach(type => {
        expect(isWriteService(type), type).to.be.false;
      });
    });

  });


  describe('#getWriteService', function() {

    it('should return service if available', function() {

      // when
      const service = getWriteService(injector, 'commandStack');

      // then
      expect(service).to.equal('real-command-stack');
    });


    it('should return shared stub if not available', function() {

      // when
      const stub = getWriteService(injector, 'modeling');

      // then
      expect(stub === getWriteService(injector, 'bpmnFactory')).to.be.true;
      expect(stub === getWriteService(createInjector({}), 'commandStack')).to.be.true;
    });


    it('should allow access to stub members', function() {

      // given
      const stub = getWriteService(createInjector({}), 'modeling');

      // then
      expect(stub.updateProperties).to.exist;
      expect(stub.then).not.to.exist;
    });


    it('should throw on stub invocation', function() {

      // given
      const stub = getWriteService(createInjector({}), 'modeling');

      // then
      expect(() => stub()).to.throw('read-only');
      expect(() => stub.updateProperties({})).to.throw('read-only');
      expect(() => stub.create('bpmn:Task')).to.throw('read-only');
      expect(() => new stub()).to.throw('read-only');
    });


    it('should return no-op for <debounceInput>', function() {

      // given
      const debounce = getWriteService(createInjector({}), 'debounceInput');

      const fn = () => {};

      // then
      expect(debounce(fn)).to.equal(fn);
    });

  });


  describe('#withWriteServiceStubs', function() {

    it('should stub missing write services', function() {

      // when
      const wrapped = withWriteServiceStubs(createInjector({}));

      // then
      expect(() => wrapped.get('commandStack')()).to.throw('read-only');
    });


    it('should prefer available services', function() {

      // when
      const wrapped = withWriteServiceStubs(injector);

      // then
      expect(wrapped.get('commandStack')).to.equal('real-command-stack');
      expect(wrapped.get('translate')).to.equal('translate');
    });


    it('should pass through other lookups', function() {

      // given
      const wrapped = withWriteServiceStubs(injector);

      // then
      expect(() => wrapped.get('foo')).to.throw('No provider for foo');
      expect(wrapped.get('foo', false)).to.be.null;
    });

  });

});


// helpers //////////

function createInjector(services) {
  return {
    get(type, strict) {
      if (type in services) {
        return services[type];
      }

      if (strict === false) {
        return null;
      }

      throw new Error('No provider for ' + type);
    }
  };
}
