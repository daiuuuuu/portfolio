import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap, ScrollTrigger } from '@/animations/scrollReveal'
import HeroSection from '@/sections/HeroSection'
import ProjectIndexSection from '@/sections/ProjectIndexSection'
import ProfileSection from '@/sections/ProfileSection'
import ContactSection from '@/sections/ContactSection'

export default function Home() {
  const gapRef = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = gapRef.current!
    ScrollTrigger.create({
      trigger: '#home',
      start: 'bottom top',
      toggleActions: 'play none reverse none',
      onLeaveBack: () => gsap.set(el, { opacity: 0 }), // instant hide when lines align
      onEnter: () => gsap.set(el, { opacity: 1 }),     // restore when scrolling past hero
    })
  }, { scope: gapRef })

  return (
    <>
      <HeroSection />
      <div ref={gapRef} className="h-[calc(16rem+40px)] border-b border-outline" aria-hidden="true" />
      <ProfileSection />
      <ProjectIndexSection />
      <ContactSection />
    </>
  )
}
