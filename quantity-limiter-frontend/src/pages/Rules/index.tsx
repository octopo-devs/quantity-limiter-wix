import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { SHOW_MULTIPLES_FEATURE } from '@/config';
import { PATH } from '@/constants';
import { upperFirstCase } from '@/helpers';
import { useDebounce } from '@/hooks';
import useHandleToastNotEmbedded from '@/hooks/useToast';
import { apiCaller } from '@/redux/query';
import { RuleType, SortDirection } from '@/types/enum';
import { ApiRequest } from '@/types/interface/request.interface';
import {
  Box,
  Button,
  Card,
  Divider,
  Dropdown,
  IconButton,
  Loader,
  Page,
  Pagination,
  Search,
  SegmentedToggle,
  Table,
  TableColumn,
  TableToolbar,
  Text,
  ToggleSwitch,
  Tooltip,
} from '@wix/design-system';
import { ArrowDown, ArrowUp, Edit, EmptyTrash } from '@wix/wix-ui-icons-common';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RuleTypeIcon from './components/RuleTypeIcon';
import { convertRuleToTableRow, RuleTableRow } from './config';

enum FilterTab {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export default function Rules() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [filterTab, setFilterTab] = useState<FilterTab>(FilterTab.ALL);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(SortDirection.DESC);
  const debouncedSearchQuery = useDebounce<string>(searchQuery);
  const toast = useHandleToastNotEmbedded();
  const handleFilterTabChange = useCallback((event: React.SyntheticEvent, value: string) => {
    setFilterTab(value as FilterTab);
    setPage(1);
  }, []);

  const queryArgs = useMemo<ApiRequest.GetRulesQuery>(() => {
    const normalizedName = debouncedSearchQuery.trim();
    const isActive = filterTab === 'all' ? undefined : filterTab === 'active';
    return {
      name: normalizedName.length > 0 ? normalizedName : undefined,
      isActive,
      page,
      perPage,
      sortDirection,
    };
  }, [filterTab, page, perPage, debouncedSearchQuery, sortDirection]);
  const { data, isLoading } = apiCaller.useGetRulesQuery(queryArgs);
  const [updateRule, { isLoading: isUpdating }] = apiCaller.useUpdateRuleMutation();
  const [deleteRule, { isLoading: isDeleting }] = apiCaller.useDeleteRuleMutation();

  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    ruleId: string | null;
    ruleName: string | null;
  }>({
    isOpen: false,
    ruleId: null,
    ruleName: null,
  });

  const rules = useMemo(() => {
    if (!data) return [];
    return data.data.map(convertRuleToTableRow);
  }, [data]);

  const handleEdit = useCallback(
    (ruleId: string) => {
      navigate(PATH.EDIT_RULE.pathname.replace(':id', ruleId));
    },
    [navigate],
  );

  const handleSortClick = useCallback(() => {
    setSortDirection((prev) => (prev === SortDirection.ASC ? SortDirection.DESC : SortDirection.ASC));
    setPage(1);
  }, []);

  const handleDeleteClick = useCallback((ruleId: string, ruleName: string) => {
    setDeleteModalState({
      isOpen: true,
      ruleId,
      ruleName,
    });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteModalState.ruleId) {
      try {
        await deleteRule(deleteModalState.ruleId).unwrap();
        toast.show('Rule deleted successfully', false);
        setDeleteModalState({
          isOpen: false,
          ruleId: null,
          ruleName: null,
        });
      } catch (error) {
        console.error('Failed to delete rule:', error);
        toast.show('Failed to delete rule', true);
      }
    }
  }, [deleteRule, deleteModalState.ruleId, toast]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteModalState({
      isOpen: false,
      ruleId: null,
      ruleName: null,
    });
  }, []);

  const handleSwitchStatus = useCallback(
    async (ruleId: string, isActive: boolean) => {
      try {
        await updateRule({ id: ruleId, isActive }).unwrap();
        toast.show('Rule status updated successfully');
      } catch (error) {
        console.error('Failed to update rule status:', error);
        toast.show('Failed to update rule status', true);
      }
    },
    [updateRule, toast],
  );

  const totalPages = data?.meta?.pagination?.totalPages || 1;
  const currentPage = data?.meta?.pagination?.currentPage || 1;
  const freeImpressions = 3;
  const maxFreeImpressions = 100;

  const getRuleTypeLabel = (ruleType: RuleType): React.ReactNode => {
    return <RuleTypeIcon type={ruleType} isShowText />;
  };

  const tableColumns = useMemo(() => {
    const columns: TableColumn<RuleTableRow>[] = [
      {
        title: 'Name',
        render: (row: RuleTableRow) => <Text>{row.name}</Text>,
        width: '35%',
      },
      {
        title: 'Status',
        render: (row: RuleTableRow) => (
          <ToggleSwitch
            checked={row.isActive}
            size="medium"
            skin="standard"
            onChange={(e) => handleSwitchStatus(row.id, e.target.checked)}
            disabled={isUpdating}
          />
        ),
        width: '5%',
      },
      {
        title: 'Type',
        render: (row: RuleTableRow) => getRuleTypeLabel(row.type),
        width: '15%',
      },
      {
        title: 'Min / Max',
        render: (row: RuleTableRow) => (
          <Text>
            {row.min} / {row.max}
          </Text>
        ),
        width: '10%',
      },
      ...(SHOW_MULTIPLES_FEATURE
        ? [
            {
              title: 'Multiple',
              render: (row: RuleTableRow) => <Text>{row.multiple ? 'Yes' : '-'}</Text>,
              width: '10%',
            },
          ]
        : []),
      {
        title: 'Created',
        render: (row: RuleTableRow) => <Text>{row.start}</Text>,
        width: '10%',
      },
      {
        title: 'Updated',
        render: (row: RuleTableRow) => <Text>{row.end}</Text>,
        width: '10%',
      },
      {
        title: 'Action',
        render: (row: RuleTableRow) => (
          <Box direction="horizontal" gap="tiny">
            <Tooltip content="Edit rule">
              <IconButton size="small" priority="secondary" onClick={() => handleEdit(row.id)}>
                <Edit />
              </IconButton>
            </Tooltip>
            <Tooltip content="Delete rule">
              <IconButton
                size="small"
                priority="secondary"
                skin="light"
                onClick={() => handleDeleteClick(row.id, row.name)}
              >
                <EmptyTrash color="red" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        width: '68px',
      },
    ];
    return columns;
  }, [handleEdit, handleDeleteClick, isUpdating, handleSwitchStatus]);

  return (
    <>
      <Page maxWidth={1568}>
        <Page.Header
          title="Limits management"
          actionsBar={
            <Box
              direction="horizontal"
              style={{ justifyContent: 'space-between', alignItems: 'center' }}
              marginBottom="large"
            >
              <Box />
              <Box direction="horizontal" gap="medium" style={{ alignItems: 'center' }}>
                <Button priority="secondary" size="small">
                  Upgrade
                </Button>
                <Text size="small" secondary>
                  <Text weight="bold" size="small">
                    {freeImpressions}
                  </Text>
                  /{maxFreeImpressions} free impressions
                </Text>
                <Button priority="primary" size="medium" onClick={() => navigate(PATH.CREATE_RULE.pathname)}>
                  Create new limit
                </Button>
              </Box>
            </Box>
          }
        />
        <Page.Content>
          <Card>
            <Box direction="vertical">
              <TableToolbar>
                <TableToolbar.ItemGroup position="start">
                  <TableToolbar.Item>
                    <SegmentedToggle size="small" selected={filterTab} onClick={handleFilterTabChange}>
                      {Object.values(FilterTab).map((tab) => (
                        <SegmentedToggle.Button key={tab} value={tab} style={{ width: '108px' }}>
                          {upperFirstCase(tab)}
                        </SegmentedToggle.Button>
                      ))}
                    </SegmentedToggle>
                  </TableToolbar.Item>
                </TableToolbar.ItemGroup>
                <TableToolbar.ItemGroup position="end">
                  <TableToolbar.Item>
                    <Search
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onClear={() => setSearchQuery('')}
                    />
                  </TableToolbar.Item>
                  <TableToolbar.Item>
                    <Tooltip
                      content={`Sort by created at: ${sortDirection === SortDirection.ASC ? 'Oldest' : 'Newest'}`}
                    >
                      <IconButton size="small" priority="secondary" onClick={handleSortClick}>
                        {sortDirection === SortDirection.ASC ? <ArrowUp /> : <ArrowDown />}
                      </IconButton>
                    </Tooltip>
                  </TableToolbar.Item>
                </TableToolbar.ItemGroup>
              </TableToolbar>

              {isLoading ? (
                <Box padding="large" align="center">
                  <Loader size="small" />
                </Box>
              ) : rules.length === 0 ? (
                <Box padding="large" align="center" direction="vertical" gap="small">
                  <Text size="medium" weight="bold">
                    No rules found
                  </Text>
                  {debouncedSearchQuery && (
                    <Text size="small" secondary>
                      Try adjusting your search or filter criteria.
                    </Text>
                  )}
                </Box>
              ) : (
                <>
                  <Table data={rules} columns={tableColumns} />
                  <Divider />
                  <Box
                    direction="horizontal"
                    style={{ justifyContent: 'space-between', alignItems: 'center' }}
                    padding="medium"
                    paddingTop="medium"
                  >
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onChange={({ page: newPage }: { page: number }) => setPage(newPage)}
                    />
                    <Box direction="horizontal" gap="small" style={{ alignItems: 'center' }}>
                      <Text size="small">Items per page:</Text>
                      <Dropdown
                        size="small"
                        options={[
                          { id: '10', value: '10' },
                          { id: '20', value: '20' },
                          { id: '50', value: '50' },
                        ]}
                        selectedId={perPage.toString()}
                        onSelect={(option) => setPerPage(Number(option.id))}
                      >
                        <Button size="small" priority="secondary">
                          {perPage}
                        </Button>
                      </Dropdown>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          </Card>
        </Page.Content>
      </Page>
      <ConfirmDeleteModal
        isOpen={deleteModalState.isOpen}
        title="Delete Rule"
        message="Are you sure you want to delete this rule"
        itemName={deleteModalState.ruleName || undefined}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </>
  );
}
