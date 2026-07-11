import Breadcrums from '@/components/Breadcrums'
import ProductDesc from '@/components/ProductDesc'
import ProductImg from '@/components/ProductImg'
import ProductReviews from '@/components/ProductReviews'
import React from 'react'
import { useSelector } from 'react-redux'
import {  useParams } from 'react-router-dom'



const SingleProduct = () => {
    const params = useParams()
    const productId = params.id
    const {products} = useSelector(store=>store.product)
    const product = products.find((item)=> item.id === productId)
  return (
    <div className='pt-20 py-10 max-w-7xl mx-auto px-4 md:px-8'>
      <Breadcrums product={product}/>
      <div className='mt-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-start'>
         <ProductImg images={product.productImg}/>
         <ProductDesc product={product}/>
      </div>
      <ProductReviews productId={product.id} />
    </div>
  )
}

export default SingleProduct
