import {SortFilter} from '~/components/SortFilter';
import * as menuBarStyles from './../components/menuBar.module.css';

export function MenuBar({
  pageTitle,
  filterProducts,
  onFilterChange,
  reverseProducts,
  setReverseProducts,
}) {
  return (
    <div
      className={`${menuBarStyles.facetsContainer} facets-container facets-container-drawer`}
    >
      <h1>{pageTitle}</h1>
      <SortFilter
        filterProducts={filterProducts}
        onFilterChange={onFilterChange}
        reverseProducts={reverseProducts}
        setReverseProducts={setReverseProducts}
      ></SortFilter>
    </div>
  );
}
