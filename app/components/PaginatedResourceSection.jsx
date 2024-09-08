import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';
import {useEffect} from 'react';
import {useNavigate} from '@remix-run/react';
import {useInView} from 'react-intersection-observer';
/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */

export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
}) {
  const {ref, inView} = useInView({});
  return (
    // TODO: issue: The next and previous load more buttons are urlEncoding '==' to '%3D%3D' and its showing up as a mismatch in URLs
    <Pagination connection={connection}>
      {({
        nodes,
        PreviousLink,
        NextLink,
        hasNextPage,
        hasPreviousPage,
        previousPageUrl,
        nextPageUrl,
        state,
      }) => {
        const resoucesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );
        return (
          <div>
            <PreviousLink ref={ref}>Previous</PreviousLink>
            <ProductsLoadedOnScroll
              nodes={nodes}
              inView={inView}
              hasNextPage={hasNextPage}
              nextPageUrl={nextPageUrl}
              hasPreviousPage={hasPreviousPage}
              previousPageUrl={previousPageUrl}
              state={state}
              resourcesClassName={resourcesClassName}
              resoucesMarkup={resoucesMarkup}
            />
            <NextLink ref={ref}>Load more ↓</NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}

function ProductsLoadedOnScroll({
  inView,
  hasNextPage,
  nextPageUrl,
  hasPreviousPage,
  previousPageUrl,
  state,
  resourcesClassName,
  resoucesMarkup,
}) {
  const navigate = useNavigate();

  useEffect(() => {
    function callNavigate(whichPage) {
      navigate(whichPage, {
        replace: true,
        preventScrollReset: true,
        state,
      });
    }
    if (inView && hasNextPage) {
      callNavigate(nextPageUrl);
    } else if (inView && hasPreviousPage) {
      callNavigate(previousPageUrl);
    }
  }, [
    inView,
    navigate,
    state,
    nextPageUrl,
    hasNextPage,
    hasPreviousPage,
    previousPageUrl,
  ]);

  return (
    <>
      {resourcesClassName ? (
        <div className={resourcesClassName}>{resoucesMarkup}</div>
      ) : (
        resoucesMarkup
      )}
    </>
  );
}
