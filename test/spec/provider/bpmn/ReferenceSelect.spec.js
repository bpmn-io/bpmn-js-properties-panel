import {
  render
} from '@testing-library/preact/pure';

import TestContainer from 'mocha-test-container-support';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  insertCoreStyles,
  changeInput
} from 'test/TestHelper';

import ReferenceSelect from 'src/entries/ReferenceSelect';

insertCoreStyles();

const noop = () => {};


describe('<ReferenceSelect>', function() {

  let container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });


  it('should render', function() {

    // given
    const result = createReferenceSelect({ container });

    // then
    expect(domQuery('.bio-properties-panel-select', result.container)).to.exist;
  });


  it('should render options', function() {

    // given
    const getOptions = () => [
      {
        label: 'option A',
        value: 'A'
      },
      {
        label: 'option B',
        value: 'B'
      },
      {
        label: 'option C',
        value: 'C'
      }
    ];

    // when
    const result = createReferenceSelect({ container, getOptions });

    const select = domQuery('.bio-properties-panel-select', result.container);

    // then
    expect(domQueryAll('option', select)).to.have.length(3);

  });


  it('should update', function() {

    // given
    const getOptions = () => [
      {
        label: 'option A',
        value: 'A'
      },
      {
        label: 'option B',
        value: 'B'
      },
      {
        label: 'option C',
        value: 'C'
      }
    ];

    const updateSpy = sinon.spy();

    const result = createReferenceSelect({ container, setValue: updateSpy, getOptions });

    const select = domQuery('.bio-properties-panel-input', result.container);

    // when
    changeInput(select, 'B');

    // then
    expect(updateSpy).to.have.been.calledWith('B');
  });

});


// helpers ////////////////////

function createReferenceSelect(options = {}) {
  const {
    autoFocuEntry,
    element,
    id = 'select',
    description,
    label,
    getValue = noop,
    setValue = noop,
    getOptions = noop,
    container
  } = options;

  return render(
    <ReferenceSelect
      autoFocuEntry={ autoFocuEntry }
      element={ element }
      id={ id }
      label={ label }
      description={ description }
      getValue={ getValue }
      setValue={ setValue }
      getOptions={ getOptions } />,
    {
      container
    }
  );
}