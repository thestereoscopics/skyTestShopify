import {ShopPayButton} from '@shopify/hydrogen';

export function AddVariantQuantity1({variantId, storeDomain, className}) {
  return (
    <ShopPayButton
      variantIds={[variantId]}
      storeDomain={storeDomain}
      className={className}
    />
  );
}
export function AddVariantQuantityMultiple({
  variantId,
  quantity,
  storeDomain,
  className,
}) {
  return (
    <ShopPayButton
      variantIdsAndQuantities={[{id: variantId, quantity}]}
      storeDomain={storeDomain}
      className={className}
    />
  );
}
