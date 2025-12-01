// =====================================================
// FOREIGN ASSETS FEATURE - BARREL EXPORTS
// =====================================================

export { default as ScheduleFA } from './components/schedule-fa';
export { default as ForeignBankAccountForm } from './components/foreign-bank-account-form';
export { default as ForeignEquityForm } from './components/foreign-equity-form';
export { default as ForeignPropertyForm } from './components/foreign-property-form';
export { default as ForeignAssetsSummary } from './components/foreign-assets-summary';
export { default as AssetDocumentUpload } from './components/asset-document-upload';

export {
  useForeignAssets,
  useAddForeignAsset,
  useUpdateForeignAsset,
  useDeleteForeignAsset,
  useUploadDocument,
  foreignAssetsKeys,
} from './hooks/use-foreign-assets';

export { default as foreignAssetsService } from './services/foreign-assets.service';

export {
  foreignAssetSchema,
  bankAccountAssetSchema,
  equityHoldingAssetSchema,
  immovablePropertyAssetSchema,
} from './schema/foreign-assets.schema';

