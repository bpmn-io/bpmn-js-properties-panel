var EntryFieldDescription = require('lib/factory/EntryFieldDescription');

var domAttr = require('min-dom').attr,
    domQuery = require('min-dom').query;


describe('factory/EntryFieldDescription', function() {

  describe('show', function() {

    it('should use provided callback name', function() {

      // when
      var html = EntryFieldDescription(translate, 'desc', { show: 'show' });

      // then
      expect(domAttr(html, 'data-show')).to.equal('show');
    });


    it('should not set "data-show" attribute if callback name is not present', function() {

      // when
      var html1 = EntryFieldDescription(translate, 'desc');
      var html2 = EntryFieldDescription(translate, 'desc', { show: undefined });

      // then
      expect(domAttr(html1, 'data-show')).not.to.exist;
      expect(domAttr(html2, 'data-show')).not.to.exist;
    });
  });


  describe('escaping', function() {

    it('should escape HTML', function() {

      // when
      var html = EntryFieldDescription(translate, '<html />');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal('&lt;html /&gt;');
    });


    it('should preserve plain <a href>', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo <a href="http://foo">FOO</a> <a href="https://bar">BAR</a>!');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo <a href="http://foo" target="_blank">FOO</a> <a href="https://bar" target="_blank">BAR</a>!'
      );
    });


    it('should preserve query string in plain <a href>', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo <a href="http://foo?foo=bar&foo.bar[]=1">FOO</a>');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo <a href="http://foo?foo=bar&amp;foo.bar[]=1" target="_blank">FOO</a>'
      );
    });


    it('should preserve <a> and <br/>', function() {

      // when
      var html = EntryFieldDescription(translate,
        '<div>' +
          '<a href="http://foo">' +
            '<p>' +
              '<br />' +
            '</p>' +
          '</a>' +
          '<br />' +
          '<a href="http://bar">BAR</a>' +
        '</div>'
      );

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        '&lt;div&gt;' +
          '<a href="http://foo" target="_blank">' +
            '&lt;p&gt;' +
              '<br>' +
            '&lt;/p&gt;' +
          '</a>' +
          '<br>' +
          '<a href="http://bar" target="_blank">BAR</a>' +
        '&lt;/div&gt;'
      );
    });


    it('should handle markdown special chars in <a href>', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo <a href="http://foo?()[]">[]FOO</a>');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo <a href="http://foo?()[]" target="_blank">[]FOO</a>'
      );
    });


    it('should ignore custom <a href>', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo <a class="foo" href="http://foo">FOO</a>!');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo &lt;a class="foo" href="http://foo"&gt;FOO&lt;/a&gt;!'
      );
    });


    it('should ignore broken <a href>', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo <a href="http://foo>FOO</a>!');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo &lt;a href="http://foo&gt;FOO&lt;/a&gt;!'
      );
    });


    it('should ignore non HTTP(S) protocol <a href>', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo <a href="javascript:foo()">FOO</a>!');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo &lt;a href="javascript:foo()"&gt;FOO&lt;/a&gt;!'
      );
    });


    it('should transform markdown link', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo [FOO](http://foo) [BAR](https://bar?a=1&b=10)!');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo <a href="http://foo" target="_blank">FOO</a> <a href="https://bar?a=1&amp;b=10" target="_blank">BAR</a>!'
      );
    });


    it('should ignore broken markdown link', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo [FOO](http://foo');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo [FOO](http://foo'
      );
    });


    it('should transform HTML in markdown link', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo ["FOO" <div/>](http://foo)');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo <a href="http://foo" target="_blank">"FOO" &lt;div/&gt;</a>'
      );
    });


    it('should preserve line breaks', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hello <br/> world');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hello <br> world'
      );
    });


    it('should ignore whitespaces in br tag', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hello <br       /> world');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hello <br> world'
      );
    });


    it('should preserve line breaks within <a> text', function() {

      // when
      var html = EntryFieldDescription(translate, '<a href="https://test.com"> HELLO <br/> WORLD </a>');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        '<a href="https://test.com" target="_blank"> HELLO <br> WORLD </a>'
      );
    });


    it('should not ignore <a> if br used within URL field', function() {

      // when
      var html = EntryFieldDescription(translate, '<a href="https://test<br />website.com"> HELLO <br/> WORLD </a>');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        '<a href="https://test<br />website.com" target="_blank"> HELLO <br> WORLD </a>'
      );
    });


    it('should handle special HTML chars in markdown link', function() {

      // when
      var html = EntryFieldDescription(translate, 'Hallo [YOU](http://foo=<" []>)');

      // then
      expect(domQuery('.description__text', html).innerHTML).to.equal(
        'Hallo <a href="http://foo=%3C%22%20%5B%5D%3E" target="_blank">YOU</a>'
      );
    });
  });

});

// helpers //////////

function translate(string) {
  return string;
}
