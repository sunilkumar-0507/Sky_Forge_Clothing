import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from '@/components/layout/CartDrawer';
import { CustomCursor } from '@/components/layout/CustomCursor';
import { MobileMenu } from '@/components/layout/MobileMenu';
import { Navbar } from '@/components/layout/Navbar';
import { PageLoader } from '@/components/layout/PageLoader';
import { SearchOverlay } from '@/components/layout/SearchOverlay';
import { SharedImageOverlay } from '@/components/layout/SharedImageOverlay';
import { Toasts } from '@/components/layout/Toasts';
import { QuickView } from '@/components/product/QuickView';
import { ScrollTrigger } from '@/lib/gsap';
import About from '@/pages/About';
import Account from '@/pages/Account';
import Auth from '@/pages/Auth';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Contact from '@/pages/Contact';
import Home from '@/pages/Home';
import NotFound from '@/pages/NotFound';
import ProductDetail from '@/pages/ProductDetail';
import Shop from '@/pages/Shop';
import Wishlist from '@/pages/Wishlist';
import { resetScroll, useLenis } from '@/providers/SmoothScroll';

export default function App() {
  const location = useLocation();
  const lenis = useLenis();
  // /login and /register share one page so their tab switch animates in place.
  const routeKey = location.pathname === '/register' ? '/login' : location.pathname;

  // Watchdog: if an exit animation ever stalls (an interrupted Framer animation can leave
  // AnimatePresence waiting forever), remount the presence boundary so the new page shows.
  const [epoch, setEpoch] = useState(0);
  const exiting = useRef(false);
  const firstKey = useRef(routeKey);
  useEffect(() => {
    if (routeKey === firstKey.current) return;
    firstKey.current = routeKey;
    exiting.current = true;
    const t = setTimeout(() => {
      if (!exiting.current) return;
      exiting.current = false;
      resetScroll(lenis);
      setEpoch((e) => e + 1);
    }, 1600);
    return () => clearTimeout(t);
  }, [routeKey, lenis]);

  return (
    <>
      <PageLoader />
      <Navbar />
      <AnimatePresence
        key={epoch}
        mode="wait"
        initial={false}
        onExitComplete={() => {
          exiting.current = false;
          resetScroll(lenis);
          ScrollTrigger.refresh();
        }}
      >
        <Routes location={location} key={routeKey}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
      <CartDrawer />
      <SearchOverlay />
      <MobileMenu />
      <QuickView />
      <Toasts />
      <SharedImageOverlay />
      <CustomCursor />
    </>
  );
}
