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
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return undefined;

    const revealSelector = [
      '.section-head', '.product-slide-card', '.collection-media',
      '.collection-content', '.poster-slide-card', '.about-media-col',
      '.about-content', '.footer-top > div', '.footer-bottom',
      '.collection-banner', '.about-grid'
    ].join(',');

    const observed = new WeakSet();
    if (!('IntersectionObserver' in window)) return undefined;

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

    const prepareReveals = (root = document) => {
      root.querySelectorAll?.(revealSelector).forEach((element, index) => {
        if (observed.has(element)) return;
        observed.add(element);
        element.classList.add('motion-reveal');
        element.style.setProperty('--motion-delay', `${Math.min(index % 5, 4) * 85}ms`);
        revealObserver.observe(element);
      });
    };

    prepareReveals();
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (node.matches?.(revealSelector)) prepareReveals(node.parentElement || document);
          else prepareReveals(node);
        }
      }));
    });
    const main = document.querySelector('main');
    if (main) mutationObserver.observe(main, { childList: true, subtree: true });

    let ticking = false;
    const updateScrollProgress = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollable = document.documentElement.scrollHeight - window.innerHeight;
          const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
          document.documentElement.style.setProperty('--scroll-progress', `${progress * 100}%`);
          ticking = false;
        });
        ticking = true;
      }
    };
    updateScrollProgress();
    window.addEventListener('scroll', updateScrollProgress, { passive: true });

    return () => {
      revealObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener('scroll', updateScrollProgress);
      document.documentElement.style.removeProperty('--scroll-progress');
    };
  }, []);

  return (
    <>
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
