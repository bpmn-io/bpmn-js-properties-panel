'use strict';

var Utils = require('../../lib/Utils');


describe('Utils', function() {
  
  describe('#validateId', function() {
    
    function validate(id, expectedResult) {
      
      return function() {
        var result = Utils.validateId(id);
        
        expect(result).to.eql(expectedResult);
      };
    }
    
    it('may contain prefix', validate('foo:bar'));
    
    it('may contain "_"', validate('bar_'));
    it('may start with "_"', validate('_bar'));
    it('may ns start with "_"', validate('foo:_bar'));

    it('may contain "-"', validate('bar-'));
    it('may ns contain "-"', validate('foo:ba-r'));
    it('may NOT start with "-"', validate('-bar', 'Id must be a valid QName.'));
    
    it('may contain "."', validate('ba.r'));
    it('may ns contain "."', validate('foo:ba.r'));
    it('may NOT start with "."', validate('.bar', 'Id must be a valid QName.'));
    
    it('may NOT contain spaces', validate('ba r', 'Id must not contain spaces.'));
    
    it('may contain numbers', validate('ba99'));
    it('may NOT start with numbers', validate('9ba', 'Id must be a valid QName.'));
    it('may NOT start prefix with numbers', validate('9ba:foo', 'Id must be a valid QName.'));
  });
  
});