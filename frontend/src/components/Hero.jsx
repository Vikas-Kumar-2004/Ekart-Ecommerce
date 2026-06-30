import React from 'react'
import { Button } from './ui/button'

const Hero = () => {
  return (
     <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Latest Electronics at Best Prices</h1>
              <p className="text-xl mb-6 text-blue-100">
                Discover cutting-edge technology with unbeatable deals on smartphones, laptops, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Shop Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
                >
                  View Deals
                </Button>
              </div>
            </div>
            <div className="relative">
              <img
                src="/ekart-hero1.png"
                alt="Electronics Hero"
                width={500}
                height={400}
                className="rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>
  )
}

export default Hero
