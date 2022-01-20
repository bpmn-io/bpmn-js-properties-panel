import { sanitizeHTML } from 'src/provider/element-templates/util/sanitize';


describe('provider/element-template - sanitize', function() {

  it('should keep safe links', function() {

    // given
    const html =
      '<p>' +
        '<a href="#l">a</a>' +
        '<a href="http://b">b</a>' +
        '<a href="https://c">c</a>' +
        '<a href="./d">d</a>' +
        '<a href="/e">e</a>' +
        '<a href="mailto:f">f</a>' +
        '<a href="/g" target="_blank" rel="noopener">g</a>' +
      '</p>';

    // when
    const sanitized = sanitizeHTML(html);

    // then
    expect(sanitized).to.eql(
      '<div xmlns="http://www.w3.org/1999/xhtml"><p>' +
        '<a href="#l">a</a>' +
        '<a href="http://b">b</a>' +
        '<a href="https://c">c</a>' +
        '<a href="./d">d</a>' +
        '<a href="/e">e</a>' +
        '<a href="mailto:f">f</a>' +
        '<a rel="noopener" target="_blank" href="/g">g</a>' +
      '</p></div>'
    );
  });


  it('should remove disallowed tags', function() {

    // given
    const html = '<h1>Foo<script>alert(\'foo\');</script><video /><iframe></h1>';

    // when
    const sanitized = sanitizeHTML(html);

    // then
    expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><h1>Foo</h1></div>');
  });


  it('should remove disallowed attributes', function() {

    // given
    const html = '<h1 onclick="alert(\'foo\');">Foo</h1>';

    // when
    const sanitized = sanitizeHTML(html);

    // then
    expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><h1>Foo</h1></div>');
  });


  it('should add <rel="noopener"> to target="_blank" links', function() {

    // given
    const html = '<a href="/g" target="_blank"></a>';

    // when
    const sanitized = sanitizeHTML(html);

    // then
    expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><a target="_blank" href="/g" rel="noopener"></a></div>');
  });


  it('should remove bogus target from links', function() {

    // given
    const html = '<a href="/g" target="_parent"></a>';

    // when
    const sanitized = sanitizeHTML(html);

    // then
    expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><a href="/g"></a></div>');
  });


  it('should remove HTML clobbering attributes', function() {

    // given
    const html = '<h1 name="createElement" id=createElement>Foo</h1>';

    // when
    const sanitized = sanitizeHTML(html);

    // then
    expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><h1>Foo</h1></div>');
  });


  describe('should remove <javascript:> href attributes', function() {

    it('basic', function() {

      // given
      const html = '<a href="javascript:throw onerror=alert,\'some string\',123,\'haha\'">Foo</a>';

      // when
      const sanitized = sanitizeHTML(html);

      // then
      expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><a>Foo</a></div>');
    });


    it('with whitespace', function() {

      // given
      const html = '<a href=" j\navas\tcript:throw onerror=alert,\'some string\',123,\'haha\'">Foo</a>';

      // when
      const sanitized = sanitizeHTML(html);

      // then
      expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><a>Foo</a></div>');
    });

  });


  describe('should remove <data:> href attributes', function() {

    it('basic', function() {

      // given
      const html = '<a href="data:foo">Foo</a>';

      // when
      const sanitized = sanitizeHTML(html);

      // then
      expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><a>Foo</a></div>');
    });


    it('with whitespace', function() {

      // given
      const html = '<a href=" da\t\nta:foo">Foo</a>';

      // when
      const sanitized = sanitizeHTML(html);

      // then
      expect(sanitized).to.equal('<div xmlns="http://www.w3.org/1999/xhtml"><a>Foo</a></div>');
    });

  });

});