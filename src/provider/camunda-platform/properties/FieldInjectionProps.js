import {
  getServiceTaskLikeBusinessObject
} from '../utils/ImplementationTypeUtils';


export function FieldInjectionProps(props) {
  const {
    element
  } = props;

  if (!getServiceTaskLikeBusinessObject(element)) {
    return [];
  }

  return [ 'dummy'
  ];
}
