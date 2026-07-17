import React from 'react';

const FilterSidebar = ({
  search,
  setSearch,
  category,
  setCategory,
  brand,
  setBrand,
  priceRange,
  setPriceRange,
  categories,
  brands,
  isOpen,
  onClose
}) => {

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setSearch("");
    if (onClose) onClose();
  };

  const handleBrandChange = (e) => {
    setBrand(e.target.value);
    setSearch("");
    if (onClose) onClose();
  };

  const handleMinChange = (e) => {
    const value = Number(e.target.value);
    if (value <= priceRange[1]) setPriceRange([value, priceRange[1]]);
  };

  const handleMaxChange = (e) => {
    const value = Number(e.target.value);
    if (value >= priceRange[0]) setPriceRange([priceRange[0], value]);
  };

  const resetFilters = () => {
    setSearch("");
    setCategory("All");
    setBrand("All");
    setPriceRange([0, 999999]);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`bg-gray-100 p-4 md:rounded-md h-screen md:h-max w-[280px] md:w-64
          fixed top-0 left-0 z-50 md:static md:block md:translate-x-0 md:mt-10
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto pb-24 md:pb-4`}
      >
        {/* Mobile Header */}
        <div className='flex justify-between items-center md:hidden mb-6 mt-4'>
          <span className="font-bold text-xl md:text-2xl text-pink-600">Filters</span>
          <button onClick={onClose} className="p-2 text-gray-600 hover:text-gray-900 bg-gray-200 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      {/* Category */}
      <h1 className='mt-5 font-semibold text-xl'>Category</h1>
      <div className='flex flex-col gap-2 mt-3'>
        {categories.map((item, index) => (
          <div key={`cat-${index}`} className='flex items-center gap-2'>
            <input
              id={`cat-${index}`}
              type="radio"
              checked={category === item}
              onChange={() => handleCategoryClick(item)}
              className="cursor-pointer"
            />
            <label htmlFor={`cat-${index}`} className='cursor-pointer uppercase flex-1'>{item}</label>
          </div>
        ))}
      </div>

      {/* Brand */}
      <h1 className='mt-5 font-semibold text-xl mb-3'>Brand</h1>
      <select
        className='bg-white w-full p-2 border-gray-200 border-2 rounded-md'
        value={brand}
        onChange={handleBrandChange}
      >
        {brands.map((item, index) => (
          <option key={index} value={item}>{item.toUpperCase()}</option>
        ))}
      </select>

      {/* Price Range */}
      <h1 className='mt-5 font-semibold text-xl mb-3'>Price Range</h1>
      <div className='flex flex-col gap-2'>
        <label htmlFor="">
          Price Range: ₹{priceRange[0]} - ₹{priceRange[1]}
        </label>
        <div className='flex gap-2 items-center'>
          <input
            type="number"
            min="0"
            max="5000"
            value={priceRange[0]}
            onChange={handleMinChange}
            className='w-20 p-1 border border-gray-300 rounded'
          />
          <span>-</span>
          <input
            type="number"
            min="0"
            max="5000"
            value={priceRange[1]}
            onChange={handleMaxChange}
            className='w-20 p-1 border border-gray-300 rounded'
          />
        </div>
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={priceRange[0]}
          onChange={handleMinChange}
          className='w-full'
        />
        <input
          type="range"
          min="0"
          max="5000"
          step="100"
          value={priceRange[1]}
          onChange={handleMaxChange}
          className='w-full'
        />
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className='bg-pink-600 text-white rounded-md px-3 py-1 mt-5 cursor-pointer w-full'
      >
        Reset Filters
      </button>
      </div>
    </>
  );
};

export default FilterSidebar;

