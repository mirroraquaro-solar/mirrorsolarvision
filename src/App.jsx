import React from 'react'
import Layout from './components/layout/Layout'
import Hero from './components/sections/Hero'
import AboutGroup from './components/sections/AboutGroup'
import WhyChooseUs from './components/sections/WhyChooseUs'
import DrainClips from './components/sections/DrainClips'
import SubsidyGuide from './components/sections/SubsidyGuide'
import Gallery from './components/sections/Gallery'
import Reviews from './components/sections/Reviews'
import QuoteForm from './components/sections/QuoteForm'

function App() {
  return (
    <Layout>
      <Hero />
      <AboutGroup />
      <WhyChooseUs />
      <DrainClips />
      <SubsidyGuide />
      <Gallery />
      <Reviews />
      <QuoteForm />
    </Layout>
  )
}

export default App
