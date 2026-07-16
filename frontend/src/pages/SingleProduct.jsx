import Breadcrums from '@/components/Breadcrums'
import ProductDesc from '@/components/ProductDesc'
import ProductImg from '@/components/ProductImg'
import ProductReviews from '@/components/ProductReviews'
import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {  useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'


const SingleProduct = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    const params = useParams()
    const navigate = useNavigate()
    const productId = params.id
    const {products} = useSelector(store=>store.product)
    const product = products.find((item)=> item.id === productId)
  return (
    <div className='pt-20 bg-white min-h-screen'>
      {/* Full width sticky header */}
      <div className='sticky top-[72px] z-40 bg-white border-b border-gray-200 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4'>
          <Button onClick={() => navigate(-1)}><ArrowLeft /></Button>
          <Breadcrums product={product}/>
        </div>
      </div>

      <div className='py-6 max-w-7xl mx-auto px-4 md:px-8'>
      <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start'>
         <ProductImg images={product.productImg}/>
         <ProductDesc product={product}/>
      </div>
      <ProductReviews productId={product.id} />
      </div>
    </div>
  )
}

export default SingleProduct
