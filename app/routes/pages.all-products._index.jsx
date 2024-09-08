import {useLoaderData, useSearchParams, Link} from '@remix-run/react';
import {useEffect, useState} from 'react';
import {defer} from '@shopify/remix-oxygen';
import {getPaginationVariables, Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {MenuBar} from '~/components/MenuBar';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = () => {
  return [{title: `Hydrogen | Products`}];
};

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return defer({...deferredData, ...criticalData});
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context, request}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const reverse = url?.searchParams?.get('reverse') === 'true' ? true : false;
  const sortKey =
    url?.searchParams?.get('sortKey') === 'PRICE' ? 'PRICE' : 'VENDOR';
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 8,
  });
  const [{products}] = await Promise.all([
    storefront.query(ALLPRODUCTS_QUERY, {
      variables: {
        ...paginationVariables,
        reverse,
        sortKey,
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);
  return {products};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

export default function Collection() {
  /** @type {LoaderReturnData} */
  const {products} = useLoaderData();
  /** @type {'manual' || 'price'} */
  const [filterProducts, setFilterProducts] = useState(`"PRICE"`);
  /** @type {Boolean} */
  const [reverseProducts, setReverseProducts] = useState(true);
  //   console.log(products, filterProducts, reverseProducts);

  function onFilterChange(filter) {
    setFilterProducts(filter);
  }

  useEffect(() => {}, [filterProducts]);

  return (
    <div className="collection">
      <MenuBar
        pageTitle={'Products'}
        filterProducts={filterProducts}
        onFilterChange={onFilterChange}
        reverseProducts={reverseProducts}
        setReverseProducts={setReverseProducts}
      ></MenuBar>
      <PaginatedResourceSection
        connection={products}
        resourcesClassName="products-grid"
      >
        {({node: product, index}) => (
          <ProductItem
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : undefined}
            sortKey={filterProducts}
            reverseProducts={reverseProducts}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}

/**
 * @param {{
 *   product: ProductItemFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
function ProductItem({product, loading, sortKey, reverseProducts}) {
  const variant = product.variants.nodes[0];
  const variantUrl = useVariantUrl(product.handle, variant.selectedOptions);
  return (
    <Link
      className="product-item"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      {product.featuredImage && (
        <Image
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          data={product.featuredImage}
          loading={loading}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}
      {`${sortKey} ${reverseProducts}`}
      <h4>{product.title}</h4>
      <small>
        <Money data={product.priceRange.minVariantPrice} />
      </small>
    </Link>
  );
}

const PRODUCT_ITEM_FRAGMENT = `#graphql
  fragment MoneyProductItem on MoneyV2 {
    amount
    currencyCode
  }
  fragment ProductItem on Product {
    id
    handle
    title
    featuredImage {
      id
      altText
      url
      width
      height
    }
    priceRange {
      minVariantPrice {
        ...MoneyProductItem
      }
      maxVariantPrice {
        ...MoneyProductItem
      }
    }
    variants(first: 1) {
      nodes {
        selectedOptions {
          name
          value
        }
      }
    }
  }
`;
// reverse: false, sortKey: PRICE
// NOTE: https://shopify.dev/docs/api/storefront/2024-01/objects/product
const ALLPRODUCTS_QUERY = `#graphql
  query allproducts(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $reverse: Boolean
    $sortKey: ProductSortKeys
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor, reverse: $reverse, sortKey: $sortKey) {
      nodes {
        ...ProductItem
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
  ${PRODUCT_ITEM_FRAGMENT}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('@remix-run/react').MetaFunction<T>} MetaFunction */
/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
