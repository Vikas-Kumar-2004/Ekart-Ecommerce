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
}) => {
  const [categories, setCategories] = React.useState(["All"]);
  const [brands, setBrands] = React.useState(["All"]);

  React.useEffect(() => {
    // Fetch unique categories and brands from backend
    const fetchFilters = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_URL}/api/v1/product/categories`).then(r => r.json()),
          fetch(`${import.meta.env.VITE_URL}/api/v1/product/brands`).then(r => r.json())
        ]);
        if (catRes.success) setCategories(["All", ...catRes.categories]);
        if (brandRes.success) setBrands(["All", ...brandRes.brands]);
      } catch (err) {
        console.error("Failed to fetch filters", err);
      }
    };
    fetchFilters();
  }, []);

  const handleCategoryClick = (cat) => {
    setCategory(cat);
  };

  const handleBrandChange = (e) => {
    setBrand(e.target.value);
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
  };

  return (
    <div className='bg-gray-100 mt-10 p-4 rounded-md h-max hidden md:block w-64'>
      {/* Search */}
      <input
        type="text"
        placeholder='Search...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='bg-white p-2 rounded-md border-gray-400 border-2 w-full'
      />

      {/* Category */}
      <h1 className='mt-5 font-semibold text-xl'>Category</h1>
      <div className='flex flex-col gap-2 mt-3'>
        {categories.map((item, index) => (
          <div key={index} className='flex items-center gap-2'>
            <input
              type="radio"
              checked={category === item}
              onChange={() => handleCategoryClick(item)}
            />
            <label className='cursor-pointer uppercase'>{item}</label>
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
  );
};

export default FilterSidebar;

