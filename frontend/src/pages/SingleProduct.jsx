import Breadcrums from '@/components/Breadcrums'
import ProductDesc from '@/components/ProductDesc'
import ProductImg from '@/components/ProductImg'
import ProductReviews from '@/components/ProductReviews'
import React from 'react'
import { useSelector } from 'react-redux'
import {  useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'


const SingleProduct = () => {
    const params = useParams()
    const navigate = useNavigate()
    const productId = params.id
    const {products} = useSelector(store=>store.product)
    const product = products.find((item)=> item.id === productId)
  return (
    <div className='pt-20 py-10 max-w-7xl mx-auto px-4 md:px-8'>
      <div className='flex items-center gap-4 mb-6'>
        <Button onClick={() => navigate(-1)}><ArrowLeft /></Button>
        <Breadcrums product={product}/>
      </div>
      <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start'>
         <ProductImg images={product.productImg}/>
         <ProductDesc product={product}/>
      </div>
      <ProductReviews productId={product.id} />
    </div>
  )
}

export default SingleProduct
