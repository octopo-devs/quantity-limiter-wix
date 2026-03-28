import { apiCaller } from '@/redux/query';
import { IWixProduct, IWixProductVariant } from '@/types/interface/wix.interface';
import { Box, Button, Checkbox, Input, Loader, Modal, Pagination, Text } from '@wix/design-system';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks';

const PER_PAGE = 5;

export interface SelectedProduct {
  productId: string;
  variantId?: string;
  image?: string;
  name: string;
  variantTitle?: string;
}

interface SelectWixProductModalProps {
  isOpen: boolean;
  isMultiple?: boolean;
  selectedProducts?: SelectedProduct[];
  onClose: () => void;
  onSelect: (products: SelectedProduct[]) => void;
}

function getProductImage(product: IWixProduct): string | undefined {
  return product.media?.mainMedia?.image?.url || product.media?.items?.[0]?.image?.url;
}

function getVariantTitle(variant: IWixProductVariant): string {
  const choices = variant.choices || {};
  const parts: string[] = [];
  if (choices.Size) parts.push(`Size: ${choices.Size}`);
  if (choices.Color) parts.push(`Color: ${choices.Color}`);
  return parts.length > 0 ? parts.join(', ') : 'Default';
}

export default function SelectWixProductModal({
  isOpen,
  isMultiple = true,
  selectedProducts = [],
  onClose,
  onSelect,
}: SelectWixProductModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<IWixProduct[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<SelectedProduct[]>(selectedProducts);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [getWixProducts] = apiCaller.useLazyGetWixProductsQuery();

  const fetchProducts = useCallback(
    async (fetchPage: number, title?: string) => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const result = await getWixProducts({
          page: fetchPage,
          perPage: PER_PAGE,
          title: title?.trim() || undefined,
        }).unwrap();
        if (result?.products) {
          setProducts(result.products);
          setTotalPages(Math.ceil((result.totalResults || 0) / PER_PAGE));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isOpen, getWixProducts],
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(selectedProducts);
      setSearchQuery('');
      setPage(1);
    }
  }, [isOpen, selectedProducts]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchProducts(1, debouncedSearchQuery);
    }
  }, [isOpen, debouncedSearchQuery, fetchProducts]);

  useEffect(() => {
    if (isOpen && page > 0) {
      fetchProducts(page, debouncedSearchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const isItemSelected = useCallback(
    (productId: string, variantId?: string): boolean => {
      if (variantId) {
        return selectedItems.some((item) => item.productId === productId && item.variantId === variantId);
      }
      return selectedItems.some((item) => item.productId === productId && !item.variantId);
    },
    [selectedItems],
  );

  const getSelectedVariantsForProduct = useCallback(
    (productId: string): SelectedProduct[] => {
      return selectedItems.filter((item) => item.productId === productId && item.variantId);
    },
    [selectedItems],
  );

  const isAllVariantsSelected = useCallback(
    (product: IWixProduct): boolean => {
      if (!product.variants || product.variants.length === 0) {
        return isItemSelected(product.id);
      }
      const selectedVariants = getSelectedVariantsForProduct(product.id);
      return selectedVariants.length === product.variants.length && product.variants.length > 0;
    },
    [getSelectedVariantsForProduct, isItemSelected],
  );

  const handleProductSelect = useCallback(
    (product: IWixProduct) => {
      const allVariantsSelected = isAllVariantsSelected(product);

      if (allVariantsSelected) {
        setSelectedItems((prev) => prev.filter((item) => item.productId !== product.id));
      } else {
        const productImage = getProductImage(product);
        const newItems: SelectedProduct[] = [];

        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((variant) => {
            if (!isItemSelected(product.id, variant.id)) {
              newItems.push({
                productId: product.id,
                variantId: variant.id,
                image: productImage,
                name: product.name,
                variantTitle: getVariantTitle(variant),
              });
            }
          });
        } else {
          newItems.push({
            productId: product.id,
            image: productImage,
            name: product.name,
          });
        }

        setSelectedItems((prev) => [...prev, ...newItems]);
      }
    },
    [isAllVariantsSelected, isItemSelected],
  );

  const handleVariantSelect = useCallback(
    (product: IWixProduct, variant: IWixProductVariant) => {
      const isVariantSelected = isItemSelected(product.id, variant.id);
      const productImage = getProductImage(product);

      if (isVariantSelected) {
        setSelectedItems((prev) =>
          prev.filter((item) => !(item.productId === product.id && item.variantId === variant.id)),
        );
      } else {
        const newItem: SelectedProduct = {
          productId: product.id,
          variantId: variant.id,
          image: productImage,
          name: product.name,
          variantTitle: getVariantTitle(variant),
        };
        setSelectedItems((prev) => [...prev, newItem]);
      }
    },
    [isItemSelected],
  );

  const handleConfirm = useCallback(() => {
    onSelect(selectedItems);
    onClose();
  }, [selectedItems, onSelect, onClose]);

  const selectedCount = selectedItems.length;

  return (
    <Modal isOpen={isOpen} onRequestClose={onClose} height="50vh">
      <Box direction="vertical" width="650px" style={{ backgroundColor: 'white', height: '100%' }}>
        <Box
          direction="horizontal"
          align="center"
          padding="medium"
          style={{
            borderBottom: '1px solid #E0E0E0',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <Box direction="horizontal" align="center" gap="small">
            <Text weight="bold" size="medium">
              Select Products
            </Text>
            {selectedCount > 0 && (
              <Text size="small" skin="standard" style={{ color: '#3899EC' }}>
                ({selectedCount} selected)
              </Text>
            )}
          </Box>
        </Box>

        <Box padding="medium" style={{ flexShrink: 0, borderBottom: '1px solid #E0E0E0' }}>
          <div style={{ width: '100%' }}>
            <Input
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              placeholder="Search products by title or ID..."
            />
          </div>
        </Box>

        <Box
          direction="vertical"
          gap="tiny"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px',
          }}
        >
          {isLoading ? (
            <Box align="center" padding="large">
              <Loader size="small" />
            </Box>
          ) : products.length === 0 ? (
            <Box align="center" padding="large">
              <Text>No products found</Text>
            </Box>
          ) : (
            products.map((product) => {
              const allSelected = isAllVariantsSelected(product);
              const productImage = getProductImage(product);
              return (
                <Box key={product.id} direction="vertical">
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 12px',
                      backgroundColor: allSelected ? '#EAF7FF' : 'transparent',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onClick={() => handleProductSelect(product)}
                    onMouseEnter={(e) => {
                      if (!allSelected) e.currentTarget.style.backgroundColor = '#F5F5F5';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = allSelected ? '#EAF7FF' : 'transparent';
                    }}
                  >
                    <Checkbox checked={allSelected} onChange={() => handleProductSelect(product)} />
                    <Box
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {productImage ? (
                        <img
                          src={productImage}
                          alt={product.name}
                          style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                        />
                      ) : (
                        <Text size="tiny" skin="disabled">
                          N/A
                        </Text>
                      )}
                    </Box>
                    <Box direction="vertical" style={{ flex: 1, gap: '2px' }}>
                      <Text weight="bold" size="small">
                        {product.name}
                      </Text>
                      {product.variants && product.variants.length > 0 && (
                        <Text size="tiny" skin="disabled">
                          {product.variants.length} variant{product.variants.length !== 1 ? 's' : ''}
                        </Text>
                      )}
                    </Box>
                  </div>

                  {product.variants && product.variants.length > 0 && (
                    <Box direction="vertical" style={{ paddingLeft: '48px' }}>
                      {product.variants.map((variant) => {
                        const isVariantSelected = isItemSelected(product.id, variant.id);
                        return (
                          <div
                            key={variant.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '8px 12px',
                              backgroundColor: isVariantSelected ? '#EAF7FF' : 'transparent',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s',
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVariantSelect(product, variant);
                            }}
                            onMouseEnter={(e) => {
                              if (!isVariantSelected) e.currentTarget.style.backgroundColor = '#F5F5F5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = isVariantSelected ? '#EAF7FF' : 'transparent';
                            }}
                          >
                            <Checkbox
                              checked={isVariantSelected}
                              onChange={() => handleVariantSelect(product, variant)}
                            />
                            <Text size="small">{getVariantTitle(variant)}</Text>
                          </div>
                        );
                      })}
                    </Box>
                  )}
                </Box>
              );
            })
          )}
        </Box>

        {totalPages > 1 && (
          <Box align="center" padding="small" style={{ borderTop: '1px solid #E0E0E0', flexShrink: 0 }}>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onChange={({ page: newPage }: { page: number }) => setPage(newPage)}
            />
          </Box>
        )}

        {isMultiple && (
          <Box
            direction="horizontal"
            gap="medium"
            padding="medium"
            style={{
              justifyContent: 'flex-end',
              borderTop: '1px solid #E0E0E0',
              flexShrink: 0,
            }}
          >
            <Button priority="secondary" onClick={onClose}>
              Close
            </Button>
            <Button priority="primary" onClick={handleConfirm} disabled={selectedItems.length === 0}>
              Add ({selectedCount})
            </Button>
          </Box>
        )}
      </Box>
    </Modal>
  );
}
