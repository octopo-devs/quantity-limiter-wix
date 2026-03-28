import { PATH } from '@/constants';
import { apiCaller } from '@/redux/query';
import { Box, Button, Card, Cell, Layout, Loader, Page, Text } from '@wix/design-system';
import { memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const { data: allRulesData, isLoading: isLoadingAll } = apiCaller.useGetRulesQuery({
    page: 1,
    perPage: 1,
  });

  const { data: activeRulesData, isLoading: isLoadingActive } = apiCaller.useGetRulesQuery({
    page: 1,
    perPage: 1,
    isActive: true,
  });

  const { data: inactiveRulesData, isLoading: isLoadingInactive } = apiCaller.useGetRulesQuery({
    page: 1,
    perPage: 1,
    isActive: false,
  });

  const isLoading = isLoadingAll || isLoadingActive || isLoadingInactive;

  const stats = useMemo(
    () => ({
      total: allRulesData?.meta?.pagination?.total ?? 0,
      active: activeRulesData?.meta?.pagination?.total ?? 0,
      inactive: inactiveRulesData?.meta?.pagination?.total ?? 0,
    }),
    [allRulesData, activeRulesData, inactiveRulesData],
  );

  return (
    <Page maxWidth={1568}>
      <Page.Header
        title="Dashboard"
        actionsBar={
          <Button priority="primary" size="medium" onClick={() => navigate(PATH.CREATE_RULE.pathname)}>
            Create new limit
          </Button>
        }
      />
      <Page.Content>
        {isLoading ? (
          <Box padding="large" align="center">
            <Loader size="medium" />
          </Box>
        ) : (
          <Layout>
            <Cell span={4}>
              <Card>
                <Card.Header title="Total Rules" />
                <Card.Content>
                  <Box padding="medium" align="center">
                    <Text size="medium" weight="bold">
                      {stats.total}
                    </Text>
                  </Box>
                </Card.Content>
              </Card>
            </Cell>
            <Cell span={4}>
              <Card>
                <Card.Header title="Active Rules" />
                <Card.Content>
                  <Box padding="medium" align="center">
                    <Text size="medium" weight="bold" style={{ color: '#4CAF50' }}>
                      {stats.active}
                    </Text>
                  </Box>
                </Card.Content>
              </Card>
            </Cell>
            <Cell span={4}>
              <Card>
                <Card.Header title="Inactive Rules" />
                <Card.Content>
                  <Box padding="medium" align="center">
                    <Text size="medium" weight="bold" style={{ color: '#9E9E9E' }}>
                      {stats.inactive}
                    </Text>
                  </Box>
                </Card.Content>
              </Card>
            </Cell>
          </Layout>
        )}
      </Page.Content>
    </Page>
  );
};

export default memo(HomePage);
