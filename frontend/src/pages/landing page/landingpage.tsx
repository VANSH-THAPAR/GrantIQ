'use client'

import { SplineScene } from "./splite";
import { Card } from "./card"
import { InteractiveSpotlight } from "./interactivespotlight"
import { Button } from "./button"

export default function LandingPage({ onStart }) {
  return (
    <Card className="fixed inset-0 w-screen h-screen bg-[#F7F6F2] overflow-hidden rounded-none border-none m-0 p-0">
      {/* Yellow Tint Background Blob */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#F4C84A]/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#F4C84A]/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <InteractiveSpotlight size={350} color="rgba(244, 200, 74, 0.15)" />
      
      {/* GrantIQ Logo Header */}
      <div className="absolute top-8 left-12 md:top-12 md:left-24 z-50">
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-[#111111]">
          Grant<span className="text-[#F4C84A]">IQ</span>
        </h2>
      </div>

      <div className="flex w-full h-full relative z-10">
        
        {/* Background Spline Scene */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          
          <div className="absolute right-[-10%] md:right-[-5%] top-10 w-full md:w-[65%] h-[90%] translate-x-[5%]">
            <SplineScene 
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" 
              className="w-full h-full opacity-100 mix-blend-multiply dark:mix-blend-normal"
            />
          </div>
        </div>

        {/* Foreground Content */}
        <div className="w-full md:w-[60%] p-8 pl-12 md:pl-24 relative z-30 flex flex-col justify-center pointer-events-auto mt-16 md:mt-24">
            <h1 className="text-5xl md:text-7xl font-bold text-[#111111] mb-6 tracking-tight leading-[1.1]">
              Unlock Government <br/> 
              <span className="text-[#F4C84A]">Opportunities</span>
            </h1>
            <p className="text-[#6B7280] max-w-lg text-lg md:text-[1.1rem] leading-relaxed">
              We are building an AI-powered platform that structures complex government schemes into personalized recommendations. Stop missing out on crucial grants and scale your business.
            </p>
            
            <div className="mt-10 flex gap-4">
               {/* Primary CTA */}
               <Button onClick={onStart} className="h-12 px-8 rounded-full text-[15px] font-semibold bg-[#F4C84A] text-[#111111] hover:bg-[#EAB308] border-none transition-transform shadow-sm">
                 Start Matching
               </Button>
            </div>
        </div>

      </div>
    </Card>
  )
}