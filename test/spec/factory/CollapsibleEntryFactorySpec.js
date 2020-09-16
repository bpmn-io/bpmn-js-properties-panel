var domify = require('min-dom').domify;

var EntryFactory = require('lib/factory/EntryFactory'),
    CollapsibleEntry = EntryFactory.collapsible;


describe('factory/CollapsibleEntry', function() {

  describe('rendering', function() {

    it('should render', function() {

      // when
      var html = CollapsibleEntry({ title: 'title', description: 'description' }).html;

      // then
      expect(html).to.eql('<div class="bpp-field-wrapper" data-action="toggle">' +
        '<input name="hidden" type="hidden"><span class="bpp-collapsible__icon"></span>' +
        '<label class="bpp-collapsible__title" data-value="title">title</label>' +
        '<label class="bpp-collapsible__description" data-value="description">description</label>' +
        '</div>');
    });


    it('should render remove button if callback is provided', function() {

      // when
      var entry = CollapsibleEntry({ onRemove: function() {} }),
          entryNode = createEntryNode(entry);

      // then
      expect(entryNode.querySelector('.bpp-collapsible__remove')).to.exist;
    });


    it('should render correct classes', function() {

      // when
      var entryCollapsed = CollapsibleEntry({ open: false });
      var entryOpen = CollapsibleEntry({ open: true });

      // then
      expect(entryCollapsed.cssClasses).to.eql([ 'bpp-collapsible', 'bpp-collapsible--collapsed' ]);
      expect(entryOpen.cssClasses).to.eql([ 'bpp-collapsible' ]);
    });


    it('should allow to provide own classes', function() {

      // when
      var entry = CollapsibleEntry({ cssClasses: [ 'bpp-collapsible--customized' ] });

      // then
      expect(entry.cssClasses).to.eql([
        'bpp-collapsible--customized', 'bpp-collapsible', 'bpp-collapsible--collapsed'
      ]);
    });
  });


  describe('collapsing', function() {

    it('should collapse', function() {

      // given
      var entry = CollapsibleEntry({ open: true }),
          entryNode = createEntryNode(entry);

      // when
      entry.toggle(null, entryNode);

      // then
      expect(entry.isOpen()).to.be.false;
      expect(entryNode).to.have.property('className', 'bpp-collapsible bpp-collapsible--collapsed');
    });


    it('should open', function() {

      // given
      var entry = CollapsibleEntry({ open: false }),
          entryNode = createEntryNode(entry);

      // when
      entry.toggle(null, entryNode);

      // then
      expect(entry.isOpen()).to.be.true;
      expect(entryNode).to.have.property('className', 'bpp-collapsible');
    });
  });



  describe('escaping', function() {

    it('should escape HTML', function() {

      // when
      var html = CollapsibleEntry({ title: '<html />', description: '<html />' }).html;

      // then
      expect(html).to.not.have.string('<html />');
    });
  });
});



function createEntryNode(entry) {
  return domify(
    '<div class="bpp-collapsible bpp-collapsible--collapsed">' + entry.html + '</div>'
  );
}
