'use strict';

var BpmnModdle = require('bpmn-moddle').default;
var CamundaBpmnModdle = require('camunda-bpmn-moddle/resources/camunda');

var InputOutputHelper = require('lib/helper/InputOutputHelper');


describe('inputOutput', function() {

  var moddle = new BpmnModdle({
    camunda: CamundaBpmnModdle
  });


  it('should NOT be supported on bpmn:Gateway', function() {

    // given
    var element = moddle.create('bpmn:Gateway');

    // then
    expect(InputOutputHelper.isInputOutputSupported(element, false)).to.be.false;
  });


  it('should be supported inside camunda:Connector', function() {

    // given
    var element = moddle.create('bpmn:ServiceTask');

    // then
    expect(InputOutputHelper.isInputOutputSupported(element, true)).to.be.true;
  });


  describe('#getParameterType', function() {

    describe('should reveal <variable> type', function() {

      it('on empty value', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = null;

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('variable');
      });


      it('on valid variable expression', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('variable');
      });


      it('NOT on invalid variable expression', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo.bar()}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });

    });


    describe('should reveal <constant-value> type', function() {

      it('on constant value', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = 500;

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('constant-value');
      });


      it('NOT on expression', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo.bar()}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });

    });


    describe('should reveal <expression> type', function() {

      it('on expression - space', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo bar}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });


      it('on expression - number', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${500}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });


      it('on expression - operators', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo + bar}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });


      it('on expression - functions', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo()}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });


      it('on expression - complex', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${my + complex + expression.foo() + 500}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });


      it('on expression - multiple clauses', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo} + 500 + ${bar + 5}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });


      it('on expression - multiple clauses (nested)', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${${foo}}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('expression');
      });


      it('NOT on variable expression', function() {

        // given
        var element = moddle.create('camunda:InputParameter');
        element.value = '${foo}';

        // when
        var parameterType = InputOutputHelper.getParameterType(element);

        // then
        expect(parameterType.value).to.equal('variable');
      });

    });


    it('should reveal <script> type', function() {

      // given
      var element = moddle.create('camunda:InputParameter'),
          script = moddle.create('camunda:Script');

      element.definition = script;

      // when
      var parameterType = InputOutputHelper.getParameterType(element);

      // then
      expect(parameterType.value).to.equal('script');
    });


    it('should reveal <list> type', function() {

      // given
      var element = moddle.create('camunda:InputParameter'),
          list = moddle.create('camunda:List');

      element.definition = list;

      // when
      var parameterType = InputOutputHelper.getParameterType(element);

      // then
      expect(parameterType.value).to.equal('list');
    });


    it('should reveal <script> type', function() {

      // given
      var element = moddle.create('camunda:InputParameter'),
          map = moddle.create('camunda:Map');

      element.definition = map;

      // when
      var parameterType = InputOutputHelper.getParameterType(element);

      // then
      expect(parameterType.value).to.equal('map');
    });

  });

});
