
export type PropertiesProvider = {
  getGroups: (selectedElement: any) => (groups: GroupDefinition[]) => GroupDefinition[];
};
