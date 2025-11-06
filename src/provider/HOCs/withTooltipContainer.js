import { useMemo } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from '../../hooks';

{ /* Required to break up imports, see https://github.com/babel/babel/issues/15156 */ }

export function withTooltipContainer(Component) {
  return props => {
    const tooltipContainer = useMemo(() => {
      const config = useService('config');

      return config && config.propertiesPanel && config.propertiesPanel.feelTooltipContainer;
    }, [ ]);

    return <Component { ...props }
      tooltipContainer={ tooltipContainer }
    ></Component>;
  };
}