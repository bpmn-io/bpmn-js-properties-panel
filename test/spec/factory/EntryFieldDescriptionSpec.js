var EntryFieldDescription = require('lib/factory/EntryFieldDescription');


describe('factory/EntryFieldDescription', function() {

  describe('escaping', function() {

    it('should escape HTML', function() {

      // when
      var html = EntryFieldDescription('<html />');

      // then
      expect(html).to.eql('<div class="bpp-field-description">&lt;html /&gt;</div>');
    });


    it('should preserve plain <a href>', function() {

      // when
      var html = EntryFieldDescription('Hallo <a href="http://foo">FOO</a> <a href="https://bar">BAR</a>!');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo <a href="http://foo" target="_blank">FOO</a> ' +
          '<a href="https://bar" target="_blank">BAR</a>!' +
        '</div>'
      );
    });


    it('should preserve query string in plain <a href>', function() {

      // when
      var html = EntryFieldDescription('Hallo <a href="http://foo?foo=bar&foo.bar[]=1">FOO</a>');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo <a href="http://foo?foo=bar&foo.bar[]=1" target="_blank">FOO</a>' +
        '</div>'
      );
    });


    it('should handle markdown special chars in <a href>', function() {

      // when
      var html = EntryFieldDescription('Hallo <a href="http://foo?()[]">[]FOO</a>');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo <a href="http://foo?()[]" target="_blank">[]FOO</a>' +
        '</div>'
      );
    });


    it('should ignore custom <a href>', function() {

      // when
      var html = EntryFieldDescription('Hallo <a class="foo" href="http://foo">FOO</a>!');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo &lt;a class=&quot;foo&quot; href=&quot;http://foo&quot;&gt;FOO&lt;/a&gt;!' +
        '</div>'
      );
    });


    it('should ignore broken <a href>', function() {

      // when
      var html = EntryFieldDescription('Hallo <a href="http://foo>FOO</a>!');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo &lt;a href=&quot;http://foo&gt;FOO&lt;/a&gt;!' +
        '</div>'
      );
    });


    it('should ignore non HTTP(S) protocol <a href>', function() {

      // when
      var html = EntryFieldDescription('Hallo <a href="javascript:foo()">FOO</a>!');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo &lt;a href=&quot;javascript:foo()&quot;&gt;FOO&lt;/a&gt;!' +
        '</div>'
      );
    });


    it('should transform markdown link', function() {

      // when
      var html = EntryFieldDescription('Hallo [FOO](http://foo) [BAR](https://bar)!');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo <a href="http://foo" target="_blank">FOO</a> ' +
          '<a href="https://bar" target="_blank">BAR</a>!' +
        '</div>'
      );
    });


    it('should transform HTML in markdown link', function() {

      // when
      var html = EntryFieldDescription('Hallo ["YO" <div/>](http://foo)');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo <a href="http://foo" target="_blank">&quot;YO&quot; &lt;div/&gt;</a>' +
        '</div>'
      );
    });


    it('should ignore special HTML chars in markdown link', function() {

      // when
      var html = EntryFieldDescription('Hallo [YOU](http://foo=">)');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo [YOU](http://foo=&quot;&gt;)' +
        '</div>'
      );
    });

  });

});