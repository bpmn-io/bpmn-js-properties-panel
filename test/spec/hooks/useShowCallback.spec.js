import { act } from 'preact/test-utils';

import { renderHook } from '@testing-library/preact-hooks';

import { useShowCallback } from 'src/hooks';

import { pathEquals } from '@philippfromme/moddle-helpers';


describe('hooks/useShowEntryEvent', function() {

  it('should return callback', function() {

    // given
    let show;

    // when
    renderHook(() => {
      show = useShowCallback();
    });

    // then
    expect(show).to.exist;
  });


  it('should return memoized callback', function() {

    // given
    const businessObject = { id: 'foo' },
          path = [ 'bar' ];

    let show;

    const { rerender } = renderHook(({ businessObject, path }) => {
      show = useShowCallback(businessObject, path);
    }, {
      initialProps: {
        businessObject,
        path
      }
    });

    const oldShow = show;

    // when
    rerender();

    // then
    expect(show).to.equal(oldShow);
  });


  it('should not return memoized callback', function() {

    // given
    const businessObject = { id: 'foo' },
          path = [ 'bar' ];

    let show;

    const { rerender } = renderHook(({ businessObject, path }) => {
      show = useShowCallback(businessObject, path);
    }, {
      initialProps: {
        businessObject,
        path
      }
    });

    const oldShow = show;

    // when
    act(() => rerender({
      businessObject: { id: 'bar' },
      path
    }));

    // then
    expect(show).not.to.equal(oldShow);
  });


  describe('callback', function() {

    it('should return true (path=string[])', function() {

      // given
      const businessObject = {
              get: () => 'foo'
            },
            path = [ 'bar' ];

      let show;

      renderHook(() => {
        show = useShowCallback(businessObject, path);
      });

      // when
      const result = show({
        id: 'foo',
        path: [ 'bar' ]
      });

      // then
      expect(result).to.be.true;
    });


    it('should return true (path=Function)', function() {

      // given
      const businessObject = {
              get: () => 'foo'
            },
            path = ({ path }) => pathEquals(path, [ 'bar' ]);

      let show;

      renderHook(() => {
        show = useShowCallback(businessObject, path);
      });

      // when
      const result = show({
        id: 'foo',
        path: [ 'bar' ]
      });

      // then
      expect(result).to.be.true;
    });


    it('should return false (id)', function() {

      // given
      const businessObject = {
              get: () => 'foo'
            },
            path = [ 'bar' ];

      let show;

      renderHook(() => {
        show = useShowCallback(businessObject, path);
      });

      // when
      const result = show({
        id: 'bar',
        path: [ 'bar' ]
      });

      // then
      expect(result).to.be.false;
    });


    it('should return false (path=string[])', function() {

      // given
      const businessObject = {
              get: () => 'foo'
            },
            path = [ 'bar' ];

      let show;

      renderHook(() => {
        show = useShowCallback(businessObject, path);
      });

      // when
      const result = show({
        id: 'foo',
        path: [ 'baz' ]
      });

      // then
      expect(result).to.be.false;
    });


    it('should return false (path=Function)', function() {

      // given
      const businessObject = {
              get: () => 'foo'
            },
            path = ({ path }) => pathEquals(path, [ 'baz' ]);

      let show;

      renderHook(() => {
        show = useShowCallback(businessObject, path);
      });

      // when
      const result = show({
        id: 'foo',
        path: [ 'bar' ]
      });

      // then
      expect(result).to.be.false;
    });

  });

});