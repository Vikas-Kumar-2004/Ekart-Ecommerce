import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setProducts } from '@/redux/productSlice';
import axios from 'axios';
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

  // Fetch products when page or filters change
  useEffect(() => {
    getAllProducts(currentPage);
  }, [currentPage, search, category, brand, sortOrder, priceRange]);

  // Remove local array slicing, use Redux products directly (already filtered/paginated)
  const currentProducts = products;

  return (
    <div className="pt-20 pb-10">
      <div className="max-w-7xl mx-auto flex gap-7">
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
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>

        {/* Main product section */}
        <div className="flex flex-col flex-1 px-4 md:px-0 mt-10 md:mt-0">
          <div className="flex justify-between md:justify-end mb-4">
            <Button 
              variant="outline" 
              className="md:hidden flex items-center gap-2"
              onClick={() => setIsSidebarOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
              Filters
            </Button>

            <Select onValueChange={(value) => setSortOrder(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Sort by price" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lowToHigh">Price: Low to High</SelectItem>
                <SelectItem value="highToLow">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7">
            {loading ? (
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

