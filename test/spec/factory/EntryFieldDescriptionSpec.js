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


    it('should preserve <a> and <br/>', function() {

      var html = EntryFieldDescription(
        '<div>' +
          '<a href="http://foo">' +
            '<p><br/></p>' +
          '</a>' +
          '<br>' +
          '<a href="http://bar">BAR</a>' +
        '</div>'
      );

      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          '&lt;div&gt;<a href="http://foo" target="_blank">&lt;p&gt;<br />' +
          '&lt;/p&gt;</a><br />' +
          '<a href="http://bar" target="_blank">BAR</a>&lt;/div&gt;' +
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
      var html = EntryFieldDescription('Hallo [FOO](http://foo) [BAR](https://bar?a=1&b=10)!');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo <a href="http://foo" target="_blank">FOO</a> ' +
          '<a href="https://bar?a=1&b=10" target="_blank">BAR</a>!' +
        '</div>'
      );
    });


    it('should ignore broken markdown link', function() {

      // when
      var html = EntryFieldDescription('Hallo [YO](http://foo');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo [YO](http://foo' +
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


    it('should preserve line breaks', function() {

      // when
      var html = EntryFieldDescription('Hello <br/> world');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hello <br /> world' +
        '</div>'
      );
    });


    it('should ignore whitespaces in br tag', function() {

      // when
      var html = EntryFieldDescription('Hello <br       /> world');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hello <br /> world' +
        '</div>'
      );
    });


    it('should preserve line breaks within <a> text', function() {

      // when
      var html = EntryFieldDescription('<a href="https://test.com"> HELLO <br/> WORLD </a>');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          '<a href="https://test.com" target="_blank"> HELLO <br /> WORLD </a>' +
        '</div>'
      );
    });


    it('should not ignore <a> if br used within URL field', function() {

      // when
      var html = EntryFieldDescription('<a href="https://test<br />website.com"> HELLO <br/> WORLD </a>');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          '<a href="https://test<br />website.com" target="_blank"> HELLO <br /> WORLD </a>' +
        '</div>'
      );
    });


    it('should handle special HTML chars in markdown link', function() {

      // when
      var html = EntryFieldDescription('Hallo [YOU](http://foo=<" []>)');

      // then
      expect(html).to.eql(
        '<div class="bpp-field-description">' +
          'Hallo <a href="http://foo=%3C%22%20%5B%5D%3E" target="_blank">YOU</a>' +
        '</div>'
      );
    });
  });

});
