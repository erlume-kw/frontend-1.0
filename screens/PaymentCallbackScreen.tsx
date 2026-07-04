import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { confirmPayment } from '../services/api';
import { useCart } from '../contexts/CartContext';
import SiteHeader from '../components/layout/SiteHeader';
import PageLayout from '../components/layout/PageLayout';
import SideMenu from '../components/layout/SideMenu';
import MaxWidthContainer from '../components/layout/MaxWidthContainer';
import { COLORS, FONTS } from '../constants/brand';

// Landing page for hosted payment methods (KNET etc.).
// MyFatoorah redirects here with ?paymentId=… — we hand that to the backend,
// which verifies the real status with MyFatoorah. This page only ever displays
// what the backend concluded; it never decides success/failure itself.
export default function PaymentCallbackScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { clear: clearCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  const [state, setState] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('');
  const [orderRef, setOrderRef] = useState<string | null>(null);

  const paymentId = (route.params as { paymentId?: string } | undefined)?.paymentId;

  useEffect(() => {
    if (!paymentId) {
      setState('failed');
      setMessage('Missing payment reference. If you were charged, please contact us.');
      return;
    }
    let cancelled = false;
    confirmPayment({ paymentId })
      .then(result => {
        if (cancelled) return;
        if (result.success) {
          clearCart();
          setOrderRef(result.orderId);
          setState('success');
        } else {
          setState('failed');
          setMessage(result.message || 'Your payment was not completed.');
        }
      })
      .catch(e => {
        if (cancelled) return;
        setState('failed');
        setMessage(e.message ?? 'We could not verify your payment. Please contact us.');
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentId]);

  return (
    <PageLayout
      menu={<SideMenu visible={menuOpen} onClose={() => setMenuOpen(false)} />}
      header={<SiteHeader onMenuPress={() => setMenuOpen(true)} />}
    >
      <MaxWidthContainer>
        <View style={s.wrap}>
          {state === 'verifying' && (
            <>
              <ActivityIndicator color={COLORS.secondary} size="large" />
              <Text style={s.title}>Verifying your payment…</Text>
              <Text style={s.body}>Please don't close this page.</Text>
            </>
          )}

          {state === 'success' && (
            <>
              <Text style={s.title}>Thank you — order confirmed!</Text>
              <Text style={s.body}>Your payment was received and your order is being processed.</Text>
              {orderRef && <Text style={s.ref}>Order reference: {orderRef}</Text>}
              <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Home' as never)}>
                <Text style={s.btnText}>CONTINUE SHOPPING</Text>
              </TouchableOpacity>
            </>
          )}

          {state === 'failed' && (
            <>
              <Text style={s.title}>Payment not completed</Text>
              <Text style={s.body}>{message}</Text>
              <Text style={s.body}>Your order is saved — you can try paying again from checkout.</Text>
              <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Checkout' as never)}>
                <Text style={s.btnText}>TRY AGAIN</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.btnGhost]} onPress={() => navigation.navigate('Home' as never)}>
                <Text style={[s.btnText, s.btnGhostText]}>BACK TO HOME</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </MaxWidthContainer>
    </PageLayout>
  );
}

const s = StyleSheet.create({
  wrap: { padding: 38, gap: 16, alignItems: 'stretch', maxWidth: 641, alignSelf: 'center', width: '100%', minHeight: 400, justifyContent: 'center' },
  title: { fontFamily: FONTS.clashSemibold, fontSize: 24, color: COLORS.black, textAlign: 'center' },
  body: { fontFamily: FONTS.dmRegular, fontSize: 15, color: COLORS.muted, textAlign: 'center' },
  ref: { fontFamily: FONTS.dmMedium, fontSize: 13, color: COLORS.black, textAlign: 'center', marginBottom: 12 },
  btn: { height: 60, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontFamily: FONTS.clashSemibold, fontSize: 15, color: COLORS.white, textTransform: 'uppercase', letterSpacing: 1.2 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: COLORS.border },
  btnGhostText: { color: COLORS.black },
});
