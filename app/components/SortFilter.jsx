import {useState} from 'react';
import {useSearchParams} from '@remix-run/react';
import * as sortFilterStyles from './sortFilter.module.css';

export function SortFilter({
  filterProducts,
  onFilterChange,
  reverseProducts,
  setReverseProducts,
}) {
  const [selectValue, setStelectValue] = useState('manual');
  const [searchParams, setSearchParams] = useSearchParams();

  function setParams(newFilters) {
    const updatedParams = {
      ...Object.fromEntries(searchParams),
      ...newFilters,
    };
    setSearchParams(updatedParams);
  }

  function handleChange(e) {
    const optionVal = e?.target?.value;
    if (optionVal === 'manual') {
      onFilterChange(optionVal);
      setStelectValue(optionVal);
      setReverseProducts(false);
      const newFilters = {sortKey: 'VENDOR', reverse: false};
      setParams(newFilters);
    } else if (
      optionVal === 'price-ascending' ||
      optionVal === 'price-descending'
    ) {
      setStelectValue(optionVal);
      onFilterChange('price');
      setReverseProducts(optionVal === 'price-descending' ? true : false);
      const newFilters = {
        sortKey: 'PRICE',
        reverse: optionVal === 'price-descending' ? true : false,
      };
      setParams(newFilters);
    }
  }

  return (
    <div className={`${sortFilterStyles.facets} facets small-hide`}>
      <form id="FacetSortDrawerForm" className="facets__form">
        <div className="facet-filters sorting caption small-hide">
          <div
            className={`${sortFilterStyles.facetFilters__field} facet-filters__field`}
          >
            <h2
              className={`${sortFilterStyles.facetFilters__label} facet-filters__label caption-large text-body`}
            >
              <label htmlFor="SortBy">Sort by:</label>
            </h2>
            <div className="select">
              <select
                name="sort_by"
                className={`${sortFilterStyles.facetFilters__sort} facet-filters__sort select__select caption-large`}
                id="SortBy"
                defaultValue={selectValue}
                aria-describedby="a11y-refresh-page-message"
                onChange={handleChange}
              >
                <option value="manual">Featured</option>
                <option value="price-ascending">Price, low to high</option>
                <option value="price-descending">Price, high to low</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
