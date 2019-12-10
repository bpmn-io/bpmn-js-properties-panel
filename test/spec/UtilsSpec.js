'use strict';

var Utils = require('lib/Utils');

var translate = require('diagram-js/lib/i18n/translate/translate').default;


describe('Utils', function() {

  describe('#validateId', function() {

    function validate(id, expectedResult) {

      return function() {
        var result = Utils.validateId(id, translate);

        expect(result).to.eql(expectedResult);
      };
    }


    it('may contain "_"', validate('bar_'));
    it('may start with "_"', validate('_bar'));
    it('may NOT contain prefix', validate('foo:bar', 'Id must not contain prefix.'));
    it('may NOT ns start with "_"', validate('foo:_bar', 'Id must not contain prefix.'));

    it('may contain "-"', validate('bar-'));
    it('may NOT ns contain "-"', validate('foo:ba-r', 'Id must not contain prefix.'));
    it('may NOT start with "-"', validate('-bar', 'Id must be a valid QName.'));

    it('may contain "."', validate('ba.r'));
    it('may NOT ns contain "."', validate('foo:ba.r', 'Id must not contain prefix.'));
    it('may NOT start with "."', validate('.bar', 'Id must be a valid QName.'));

    it('may NOT contain spaces', validate('ba r', 'Id must not contain spaces.'));

    it('may contain numbers', validate('ba99'));
    it('may NOT start with numbers', validate('9ba', 'Id must be a valid QName.'));
    it('may NOT start prefix with numbers', validate('9ba:foo', 'Id must be a valid QName.'));

    it('may NOT contain ${} placeholders', validate('${foo}ba99', 'Id must be a valid QName.'));
  });


  describe('#escapeHTML', function() {

    it('should escape HTML', function() {
      var htmlStr = '<video src=1 onerror=alert(\'hueh\')>',
          htmlStr2 = '" onfocus=alert(1) "';

      expect(Utils.escapeHTML(htmlStr)).to.eql('&lt;video src=1 onerror=alert(&#39;hueh&#39;)&gt;');
      expect(Utils.escapeHTML(htmlStr2)).to.eql('&quot; onfocus=alert(1) &quot;');
    });

  });
});
