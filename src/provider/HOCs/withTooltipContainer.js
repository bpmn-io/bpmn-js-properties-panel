import { useMemo } from '@bpmn-io/properties-panel/preact/hooks';
import { useService } from '../../hooks';

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