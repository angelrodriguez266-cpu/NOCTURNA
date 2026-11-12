import React, { useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import DropCarousel from '../components/DropCarousel';
import CollectionBanner from '../components/CollectionBanner';
import PostersCarousel from '../components/PostersCarousel';
import About from '../components/About';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import LightboxModal from '../components/LightboxModal';
import ToastNotice from '../components/ToastNotice';

export default function Home() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('motion-enabled');

    const revealSelector = [
      '.section-head', '.product-slide-card', '.collection-media',
      '.collection-content', '.poster-slide-card', '.about-media-col',
      '.about-content', '.footer-top > div', '.footer-bottom',
      '.collection-banner', '.about-grid'
    ].join(',');
    const observed = new WeakSet();
    const progressBar = document.querySelector('.scroll-progress-indicator');
    const revealObserver = 'IntersectionObserver' in window
      ? new IntersectionObserver((entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' })
      : null;

    const prepareReveals = (rootNode = document) => {
      rootNode.querySelectorAll?.(revealSelector).forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.classList.add('motion-reveal');
        element.style.setProperty('--motion-delay', `${Math.min(index % 4, 3) * 45}ms`);
        if (revealObserver) revealObserver.observe(element);
        else element.classList.add('is-visible');
      });
    };
    prepareReveals();

    const mutationObserver = 'MutationObserver' in window ? new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) prepareReveals(node.matches?.(revealSelector) ? node.parentElement || document : node);
      }));
    }) : null;
    const main = document.querySelector('main');
    if (main && mutationObserver) mutationObserver.observe(main, { childList: true, subtree: true });

    let ticking = false;
    const updateScrollProgress = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
        root.style.setProperty('--scroll-progress', `${progress * 100}%`);
        if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
        ticking = false;
      });
    };
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });
    window.addEventListener('resize', updateScrollProgress);

    return () => {
      revealObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
      root.classList.remove('motion-enabled');
      root.style.removeProperty('--scroll-progress');
    };
  }, []);

  return (
    <>
      <div className="scroll-progress-indicator" aria-hidden="true" />
      <Header />
      <main>
        <Hero />
        <div className="culture-marquee" aria-label="NØCTURNA: cultura después del anochecer">
          <div className="culture-marquee-track" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, index) => (
              <span className="culture-marquee-group" key={index}>
                <span>NO SEGUIMOS TENDENCIAS</span><i>✳</i>
                <span>CONSTRUIMOS CULTURA</span><i>✳</i>
                <span>CULTURE AFTER DARK</span><i>✳</i>
              </span>
            ))}
          </div>
        </div>
        <DropCarousel />
        <CollectionBanner />
        <PostersCarousel />
        <About />
      </main>
      <Footer />
      <CartDrawer />
      <LightboxModal />
      <ToastNotice />
    </>
  );
}
