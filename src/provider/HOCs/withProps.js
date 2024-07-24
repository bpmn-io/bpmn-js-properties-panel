export function withProps(Component, otherProps) {
  return props => {
    return <Component { ...props } { ...otherProps } />;
  };
}