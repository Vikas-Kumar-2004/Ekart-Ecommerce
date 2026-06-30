import React, { useState } from 'react'
import Zoom from 'react-medium-image-zoom'
import 'react-medium-image-zoom/dist/styles.css'

const ProductImg = ({ images }) => {
    const [mainImg, setMainImg] = useState(images[0].url)
    return (
        <div className='flex flex-col-reverse lg:flex-row gap-5 w-full'>
            <div className='gap-3 flex flex-row lg:flex-col overflow-x-auto pb-2 lg:pb-0'>
                {
                    images.map((img) => {
                        return <img key={img.id} onClick={()=>setMainImg(img.url)} src={img.url} alt="" className='cursor-pointer w-16 h-16 md:w-20 md:h-20 object-cover border shadow-sm shrink-0' />
                    })
                }

            </div>
            <Zoom>
            <img src={mainImg} alt="" className='w-full lg:w-[500px] border shadow-lg object-contain bg-white rounded-lg'/>
            </Zoom>
        </div>
    )
}

export default ProductImg
