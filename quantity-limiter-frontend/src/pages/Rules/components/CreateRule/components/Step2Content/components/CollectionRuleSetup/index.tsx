import SelectCollectionModal, { SelectedCollection } from '@/components/SelectCollectionModal';
import { setSelectedCollections } from '@/redux/slice/createRule.slice';
import { useAppDispatch, useAppSelector } from '@/redux/store';
import { ApiRequest } from '@/types/interface/request.interface';
import { Box, Button, FormField, IconButton, Text } from '@wix/design-system';
import { Delete } from '@wix/wix-ui-icons-common';
import { useCallback, useMemo, useState } from 'react';

interface CollectionRuleSetupProps {
  ruleCollection?: Partial<ApiRequest.CreateRule['ruleCollection']>;
  onFieldChange: (field: string, value: any) => void;
}

export default function CollectionRuleSetup({ ruleCollection, onFieldChange }: CollectionRuleSetupProps) {
  const dispatch = useAppDispatch();
  const rawSelectedCollections = useAppSelector((state) => state.createRule.selectedCollections);
  const selectedCollections = useMemo(() => rawSelectedCollections || [], [rawSelectedCollections]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCollectionSelect = useCallback(
    (collections: SelectedCollection[]) => {
      dispatch(setSelectedCollections(collections));
      onFieldChange(
        'collectionIds',
        collections.map((c) => c.collectionId),
      );
    },
    [dispatch, onFieldChange],
  );

  const handleRemove = useCallback(
    (collectionId: string) => {
      const updated = selectedCollections.filter((c) => c.collectionId !== collectionId);
      dispatch(setSelectedCollections(updated));
      onFieldChange(
        'collectionIds',
        updated.map((c) => c.collectionId),
      );
    },
    [dispatch, onFieldChange, selectedCollections],
  );

  return (
    <Box direction="vertical" gap="medium">
      <Text weight="bold" size="medium">
        Collection Selection
      </Text>
      <FormField label="Collections" required>
        <Box direction="vertical" gap="small">
          {selectedCollections.length > 0 && (
            <Box
              direction="vertical"
              gap="tiny"
              style={{
                marginBottom: '8px',
                border: '1px solid #E0E0E0',
                borderRadius: '8px',
                overflow: 'hidden',
              }}
            >
              {selectedCollections.map((collection, index) => (
                <Box
                  key={collection.collectionId}
                  direction="horizontal"
                  align="center"
                  gap="small"
                  style={{
                    padding: '10px 12px',
                    borderBottom: index < selectedCollections.length - 1 ? '1px solid #F0F0F0' : 'none',
                  }}
                >
                  <Box style={{ flex: 1 }}>
                    <Text size="small" weight="bold">
                      {collection.name}
                    </Text>
                  </Box>
                  <IconButton
                    size="tiny"
                    priority="secondary"
                    skin="light"
                    onClick={() => handleRemove(collection.collectionId)}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
          <Button size="medium" priority="secondary" onClick={() => setIsModalOpen(true)}>
            Browse
          </Button>
        </Box>
      </FormField>

      <SelectCollectionModal
        isOpen={isModalOpen}
        selectedCollections={selectedCollections}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleCollectionSelect}
      />
    </Box>
  );
}
