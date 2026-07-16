import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setProducts } from '@/redux/productSlice';
import axios from 'axios';
import { Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const Product = () => {
  const { products } = useSelector(store => store.product);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [brand, setBrand] = useState("All");
  const [sortOrder, setSortOrder] = useState("");
  const [priceRange, setPriceRange] = useState([0, 999999]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10; // number of products per page

  const dispatch = useDispatch();

  const [totalPages, setTotalPages] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState(["All"]);
  const [brands, setBrands] = useState(["All"]);

  useEffect(() => {
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

  const getAllProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: productsPerPage.toString(),
        search: search.trim(),
        category: category,
        brand: brand,
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        sortOrder: sortOrder,
      });

      const res = await axios.get(`${import.meta.env.VITE_URL}/api/v1/product/getallproducts?${params.toString()}`);
      if (res.data.success) {
        setAllProducts(res.data.products);
        dispatch(setProducts(res.data.products));
        if (res.data.pagination) {
          setTotalPages(res.data.pagination.totalPages);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtering + sorting (Fetch from backend on filter change)
  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, brand, sortOrder, priceRange]);

  const isMounted = React.useRef(false);

  // Enable scroll restoration on mount
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'auto';
    }
  }, []);

  // Fetch products when page or filters change
  useEffect(() => {
    getAllProducts(currentPage);
    if (isMounted.current) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      isMounted.current = true;
    }
  }, [currentPage, search, category, brand, sortOrder, priceRange]);

  // Remove local array slicing, use Redux products directly (already filtered/paginated)
  const currentProducts = products;

  return (
    <div className="pt-20 pb-10">
      <div className="max-w-7xl mx-auto flex md:gap-7">
        {/* Sidebar */}
        <div>
          <FilterSidebar
            search={search}
            setSearch={setSearch}
            brand={brand}
            setBrand={setBrand}
            category={category}
            setCategory={setCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            categories={categories}
            brands={brands}
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main product section */}
        <div className="flex flex-col flex-1 px-4 md:px-0 mt-10 md:mt-0 min-w-0">
          
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
            
            {/* Search Box */}
            <div className="relative w-full sm:flex-1 md:max-w-md">
              <input
                type="text"
                placeholder='Search products...'
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (e.target.value.trim() !== '') {
                    setCategory("All");
                    setBrand("All");
                  }
                }}
                className='bg-white p-2 pl-10 rounded-md border-gray-300 border w-full focus:outline-none focus:ring-2 focus:ring-pink-500'
              />
              <Search className='absolute left-3 top-2.5 text-gray-500' size={18} />
            </div>

            <div className="flex justify-end w-full sm:w-auto gap-4">
              <Select onValueChange={(value) => setSortOrder(value)}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Sort by price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                  <SelectItem value="highToLow">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Quick Categories for Mobile */}
          <div className="flex md:hidden overflow-x-auto gap-2 mb-6 scrollbar-hide py-1">
            {categories.slice(0, 4).map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => { setCategory(cat); setSearch(""); }}
                className={`flex-shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${category === cat ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
              >
                {cat}
              </button>
            ))}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex-shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border border-gray-300 bg-white text-pink-600 hover:bg-gray-50 transition-colors flex items-center gap-1"
            >
              More <span className="text-lg leading-none">+</span>
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7">
            {(loading && currentProducts.length === 0) ? (
              <p>Loading...</p>
            ) : currentProducts.length > 0 ? (
              currentProducts.map((product, index) => (
                <ProductCard key={index} product={product} loading={loading} />
              ))
            ) : (
              <p>No products found</p>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-center items-center gap-3 mt-8">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2  rounded-lg "
            >
              Prev
            </Button>
            <span className="font-medium">
              Page {currentPage} of {totalPages || 1}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2  rounded-lg "
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;

