import Preview from '@/components/Preview';
import { upperFirstCase } from '@/helpers';
import useHandleToastNotEmbedded from '@/hooks/useToast';
import { apiCaller } from '@/redux/query';
import { DisplayType, TextAlign } from '@/types/enum';
import { ApiRequest } from '@/types/interface';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Button,
  Card,
  Cell,
  ColorInput,
  Dropdown,
  Layout,
  Loader,
  Page,
  RadioGroup,
  SegmentedToggle,
  Slider,
  Text,
} from '@wix/design-system';
import { TextAlignCenterLight, TextAlignLeftLight, TextAlignRightLight } from '@wix/wix-ui-icons-common';
import { useCallback, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { AppearanceFormData, appearanceSchema, defaultFontFamilies } from './config';

export default function Appearance() {
  const toast = useHandleToastNotEmbedded();

  const { data, isLoading } = apiCaller.useGetAppearanceQuery();
  const [updateAppearance, { isLoading: isUpdating }] = apiCaller.useUpdateAppearanceMutation();

  const isSaving = isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<AppearanceFormData>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      displayType: DisplayType.INLINE,
      backgroundColor: '#FFD466',
      textColor: '#4A4A4A',
      fontFamily: 'inherit',
      textAlign: TextAlign.LEFT,
      fontSize: 14,
      customCss: '',
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    if (data?.data) {
      reset({
        displayType: data.data.displayType,
        backgroundColor: data.data.backgroundColor,
        textColor: data.data.textColor,
        fontFamily: data.data.fontFamily,
        textAlign: data.data.textAlign,
        fontSize: data.data.fontSize,
        customCss: data.data.customCss || '',
      });
    }
  }, [data, reset]);

  const onSubmit = useCallback(
    async (formData: AppearanceFormData) => {
      try {
        if (data?.data) {
          const appearanceData: ApiRequest.UpdateAppearance = {
            backgroundColor: formData.backgroundColor,
            textColor: formData.textColor,
            displayType: formData.displayType,
            fontFamily: formData.fontFamily,
            fontSize: formData.fontSize,
            textAlign: formData.textAlign,
            customCss: formData.customCss,
          };
          await updateAppearance(appearanceData).unwrap();
          reset(formData, { keepValues: true });
          toast.show('Appearance settings updated successfully', false);
        }
      } catch (error) {
        console.error('Failed to save appearance:', error);
        toast.show('Failed to save appearance settings', true);
      }
    },
    [data, updateAppearance, reset, toast],
  );

  const handleCancel = useCallback(() => {
    if (data?.data) {
      reset({
        displayType: data.data.displayType,
        backgroundColor: data.data.backgroundColor,
        textColor: data.data.textColor,
        fontFamily: data.data.fontFamily,
        textAlign: data.data.textAlign,
        fontSize: data.data.fontSize,
        customCss: data.data.customCss || '',
      });
    }
    toast.show('Changes cancelled', false);
  }, [data, reset, toast]);

  const textAlignOptions = [
    { id: TextAlign.LEFT, value: 'Left', icon: <TextAlignLeftLight /> },
    { id: TextAlign.CENTER, value: 'Center', icon: <TextAlignCenterLight /> },
    { id: TextAlign.RIGHT, value: 'Right', icon: <TextAlignRightLight /> },
  ];

  return (
    <Page maxWidth={1200}>
      <Page.Header
        title="Appearance"
        actionsBar={
          <Box direction="horizontal" gap="medium">
            <Button priority="secondary" size="medium" onClick={handleCancel} disabled={!isDirty || isSaving}>
              Cancel
            </Button>
            <Button priority="primary" size="medium" onClick={handleSubmit(onSubmit)} disabled={!isDirty || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </Box>
        }
      />
      <Page.Content>
        {isLoading ? (
          <Box padding="large" align="center">
            <Loader size="small" />
          </Box>
        ) : (
          <Layout>
            <Cell span={8}>
              <Card>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <Box direction="vertical" gap="large" padding="large">
                    <Box direction="vertical" gap="medium">
                      <Text weight="bold" size="medium">
                        Display Settings
                      </Text>
                      <Box direction="vertical" gap="small">
                        <Text size="small">Display Type</Text>
                        <Controller
                          name="displayType"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup value={field.value} onChange={field.onChange} disabled={isSaving}>
                              {Object.values(DisplayType).map((displayType) => (
                                <RadioGroup.Radio key={displayType} value={displayType}>
                                  {upperFirstCase(displayType)}
                                </RadioGroup.Radio>
                              ))}
                            </RadioGroup>
                          )}
                        />
                        {errors.displayType && (
                          <Text size="tiny" skin="error">
                            {errors.displayType.message}
                          </Text>
                        )}
                      </Box>
                    </Box>

                    <Box direction="vertical" gap="medium">
                      <Text weight="bold" size="medium">
                        Colors
                      </Text>
                      <Layout>
                        <Cell span={6}>
                          <Box direction="vertical" gap="small">
                            <Text size="small">Background Color</Text>
                            <Controller
                              name="backgroundColor"
                              control={control}
                              render={({ field }) => (
                                <ColorInput
                                  value={field.value}
                                  onChange={(color) => {
                                    const hexValue =
                                      typeof color === 'string' ? color : (color as any)?.hex || field.value;
                                    field.onChange(hexValue);
                                  }}
                                  disabled={isSaving}
                                />
                              )}
                            />
                            {errors.backgroundColor && (
                              <Text size="tiny" skin="error">
                                {errors.backgroundColor.message}
                              </Text>
                            )}
                          </Box>
                        </Cell>
                        <Cell span={6}>
                          <Box direction="vertical" gap="small">
                            <Text size="small">Text Color</Text>
                            <Controller
                              name="textColor"
                              control={control}
                              render={({ field }) => (
                                <ColorInput
                                  value={field.value}
                                  onChange={(color) => {
                                    const hexValue =
                                      typeof color === 'string' ? color : (color as any)?.hex || field.value;
                                    field.onChange(hexValue);
                                  }}
                                  disabled={isSaving}
                                />
                              )}
                            />
                            {errors.textColor && (
                              <Text size="tiny" skin="error">
                                {errors.textColor.message}
                              </Text>
                            )}
                          </Box>
                        </Cell>
                      </Layout>
                    </Box>

                    <Box direction="vertical" gap="medium">
                      <Text weight="bold" size="medium">
                        Typography
                      </Text>
                      <Layout>
                        <Cell span={6}>
                          <Box direction="vertical" gap="small">
                            <Text size="small">Font Family</Text>
                            <Controller
                              name="fontFamily"
                              control={control}
                              render={({ field }) => (
                                <Dropdown
                                  options={defaultFontFamilies}
                                  selectedId={field.value}
                                  onSelect={(option) => field.onChange(option.id)}
                                  disabled={isSaving}
                                >
                                  <Button size="medium" priority="secondary">
                                    {defaultFontFamilies.find((opt) => opt.id === field.value)?.value ??
                                      'Select font family'}
                                  </Button>
                                </Dropdown>
                              )}
                            />
                            {errors.fontFamily && (
                              <Text size="tiny" skin="error">
                                {errors.fontFamily.message}
                              </Text>
                            )}
                          </Box>
                        </Cell>
                        <Cell span={6}>
                          <Box direction="vertical" gap="small">
                            <Text size="small">Font Size: {watchedValues.fontSize || 14}px</Text>
                            <Controller
                              name="fontSize"
                              control={control}
                              render={({ field }) => (
                                <Slider
                                  min={8}
                                  max={72}
                                  value={field.value}
                                  onChange={field.onChange}
                                  disabled={isSaving}
                                />
                              )}
                            />
                            {errors.fontSize && (
                              <Text size="tiny" skin="error">
                                {errors.fontSize.message}
                              </Text>
                            )}
                          </Box>
                        </Cell>
                      </Layout>
                      <Box direction="vertical" gap="small">
                        <Text size="small">Text Alignment</Text>
                        <Controller
                          name="textAlign"
                          control={control}
                          render={({ field }) => (
                            <SegmentedToggle
                              size="medium"
                              selected={field.value}
                              onClick={(event, value) => field.onChange(value)}
                              disabled={isSaving}
                            >
                              {textAlignOptions.map((option) => (
                                <SegmentedToggle.Button key={option.id} value={option.id}>
                                  <Box direction="horizontal" gap="small">
                                    {option.icon}
                                    {option.value}
                                  </Box>
                                </SegmentedToggle.Button>
                              ))}
                            </SegmentedToggle>
                          )}
                        />
                        {errors.textAlign && (
                          <Text size="tiny" skin="error">
                            {errors.textAlign.message}
                          </Text>
                        )}
                      </Box>
                    </Box>

                    <Box direction="vertical" gap="medium">
                      <Text weight="bold" size="medium">
                        Custom CSS
                      </Text>
                      <Box direction="vertical" gap="small">
                        <Text size="small">Custom CSS (optional)</Text>
                        <Controller
                          name="customCss"
                          control={control}
                          render={({ field }) => (
                            <textarea
                              value={field.value || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.onChange(e.target.value)}
                              placeholder=".custom-class { margin: 10px; }"
                              disabled={isSaving}
                              rows={6}
                              style={{
                                padding: '8px 12px',
                                border: '1px solid #E0E0E0',
                                borderRadius: '4px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                              }}
                            />
                          )}
                        />
                        {errors.customCss && (
                          <Text size="tiny" skin="error">
                            {errors.customCss.message}
                          </Text>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </form>
              </Card>
            </Cell>
            <Cell span={4}>
              <Card>
                <Box direction="vertical" gap="medium" padding="large">
                  <Text weight="bold" size="medium">
                    Preview
                  </Text>
                  <Preview formData={watchedValues} />
                </Box>
              </Card>
            </Cell>
          </Layout>
        )}
      </Page.Content>
    </Page>
  );
}
