import { apiCaller } from '@/redux/query';
import { IWixCollection } from '@/types/interface/wix.interface';
import { Box, Button, Checkbox, Input, Loader, Modal, Pagination, Text } from '@wix/design-system';
import { useCallback, useEffect, useState } from 'react';
import { useDebounce } from '@/hooks';

const PER_PAGE = 10;

export interface SelectedCollection {
  collectionId: string;
  name: string;
}

interface SelectCollectionModalProps {
  isOpen: boolean;
  selectedCollections?: SelectedCollection[];
  onClose: () => void;
  onSelect: (collections: SelectedCollection[]) => void;
}

export default function SelectCollectionModal({
  isOpen,
  selectedCollections = [],
  onClose,
  onSelect,
}: SelectCollectionModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [collections, setCollections] = useState<IWixCollection[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedItems, setSelectedItems] = useState<SelectedCollection[]>(selectedCollections);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [getWixCollections] = apiCaller.useLazyGetWixCollectionsQuery();

  const fetchCollections = useCallback(
    async (fetchPage: number, name?: string) => {
      if (!isOpen) return;
      setIsLoading(true);
      try {
        const result = await getWixCollections({
          page: fetchPage,
          perPage: PER_PAGE,
          name: name?.trim() || undefined,
        }).unwrap();
        if (result?.collections) {
          setCollections(result.collections);
          setTotalPages(Math.ceil((result.totalResults || 0) / PER_PAGE));
        }
      } finally {
        setIsLoading(false);
      }
    },
    [isOpen, getWixCollections],
  );

  useEffect(() => {
    if (isOpen) {
      setSelectedItems(selectedCollections);
      setSearchQuery('');
      setPage(1);
    }
  }, [isOpen, selectedCollections]);

  useEffect(() => {
    if (isOpen) {
      setPage(1);
      fetchCollections(1, debouncedSearchQuery);
    }
  }, [isOpen, debouncedSearchQuery, fetchCollections]);

  useEffect(() => {
    if (isOpen && page > 0) {
      fetchCollections(page, debouncedSearchQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const isItemSelected = useCallback(
    (collectionId: string): boolean => {
      return selectedItems.some((item) => item.collectionId === collectionId);
    },
    [selectedItems],
  );

  const handleCollectionSelect = useCallback(
    (collection: IWixCollection) => {
      const collectionId = collection.id;
      if (isItemSelected(collectionId)) {
        setSelectedItems((prev) => prev.filter((item) => item.collectionId !== collectionId));
      } else {
        setSelectedItems((prev) => [...prev, { collectionId, name: collection.name }]);
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
      <Box direction="vertical" width="500px" style={{ backgroundColor: 'white', height: '100%' }}>
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
              Select Collections
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
              placeholder="Search collections..."
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
          ) : collections.length === 0 ? (
            <Box align="center" padding="large">
              <Text>No collections found</Text>
            </Box>
          ) : (
            collections.map((collection) => {
              const selected = isItemSelected(collection.id);
              return (
                <div
                  key={collection.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    backgroundColor: selected ? '#EAF7FF' : 'transparent',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s',
                  }}
                  onClick={() => handleCollectionSelect(collection)}
                  onMouseEnter={(e) => {
                    if (!selected) e.currentTarget.style.backgroundColor = '#F5F5F5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = selected ? '#EAF7FF' : 'transparent';
                  }}
                >
                  <Checkbox checked={selected} onChange={() => handleCollectionSelect(collection)} />
                  <Box style={{ flex: 1 }}>
                    <Text weight="bold" size="small">
                      {collection.name}
                    </Text>
                  </Box>
                </div>
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
      </Box>
    </Modal>
  );
}
