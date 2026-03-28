export interface IProductUpdate {
  shop: string;
  productId: string;
}

export interface IProductRemove {
  shop: string;
  id: number;
}

export interface ICollectionRemove {
  shop: string;
  id: number;
}

export interface ICollectionUpdate {
  shop: string;
  collectionId: string;
}

export interface VariantsData {
  node: {
    id: string;
    legacyResourceId: number;
    sku: string;
    title: string;
    displayName: string;
    metafields?: {
      edges: IMetafieldVariant[];
    };
  };
}

export interface IMetafieldVariant {
  node: {
    id: string;
    key: string;
    value: string;
    type: string;
    definition: {
      name: string;
    };
  };
}
