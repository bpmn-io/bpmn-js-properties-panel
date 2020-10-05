var EntryFactory = require('lib/factory/EntryFactory'),
    ToggleSwitchEntry = EntryFactory.toggleSwitch;


describe('factory/ToggleSwitchEntry', function() {

  describe('rendering', function() {

    it('should render', function() {

      // when
      var html = ToggleSwitchEntry(translate, {
        id: 'foo',
        label: 'label',
        labelOff: 'off',
        labelOn: 'on',
        descriptionOff: 'this is off',
        descriptionOn: 'this is on',
        modelProperty: 'toggle'
      }).html;

      var foo = document.createElement('div');

      foo.appendChild(html);

      // then
      expect(foo.innerHTML).to.eql(
        '<label for="foo">label</label>' +
        '<div class="bpp-field-wrapper">' +
          '<label class="bpp-toggle-switch__switcher">' +
            '<input id="foo" type="checkbox" name="toggle">' +
            '<span class="bpp-toggle-switch__slider"></span>' +
          '</label>'+
          '<p class="bpp-toggle-switch__label" data-show="isOn">on</p>' +
          '<p class="bpp-toggle-switch__label" data-show="isOff">off</p>' +
        '</div>' +
        '<div class="bpp-field-description description description--expanded" data-show="isOn">' +
          '<span class="description__text">this is on</span>' +
        '</div>' +
        '<div class="bpp-field-description description description--expanded" data-show="isOff">' +
          '<span class="description__text">this is off</span>' +
        '</div>'
      );
    });

  });

});

// helpers //////////

function translate(string) {
  return string;
}