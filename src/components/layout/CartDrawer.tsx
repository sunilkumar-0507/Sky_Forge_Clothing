import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { CartDrawerBody } from '@/components/cart/CartContents';
import { Overlay } from '@/components/ui/Overlay';
import { useUI } from '@/store';

export function CartDrawer() {
  const open = useUI((s) => s.cartOpen);
  const setOpen = useUI((s) => s.setCartOpen);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname, setOpen]);

  return (
    <Overlay open={open} onClose={() => setOpen(false)} placement="right" label="Shopping bag">
      <CartDrawerBody onClose={() => setOpen(false)} />
    </Overlay>
  );
}
