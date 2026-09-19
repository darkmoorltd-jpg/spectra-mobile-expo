import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { supabase } from '../../services/supabase';
import { colors } from '../../constants/theme';
import { Button } from '../../components/ui';
import { tapFeedback, successFeedback, errorFeedback } from '../../utils/feedback';

const PAYSTACK_PUBLIC_KEY = "pk_live_3af5d245e74f86f0517d214b6872f4ac8236e057";

const PLANS = [
  { id: '100_scans', scans: 100, price: 25000, badge: 'POPULAR' },
  { id: '300_scans', scans: 300, price: 50000, badge: 'BEST VALUE' },
];

export default function CheckoutScreen() {
  const [selectedPlan, setSelectedPlan] = useState(PLANS[0]);
  const [showWebView, setShowWebView] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const webViewRef = useRef<WebView>(null);

  const initiatePayment = async () => {
    tapFeedback();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('Not logged in');

      const reference = `SPECTRA_${user.id.slice(0, 8)}_${Date.now()}`;

      // Build Paystack checkout HTML
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://js.paystack.co/v1/inline.js"></script>
          <style>
            body { background: #0A0E17; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; font-family: -apple-system, sans-serif; }
            .loader { text-align: center; }
            .spinner { border: 4px solid #1F2A44; border-top: 4px solid #FFD700; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
          </style>
        </head>
        <body>
          <div class="loader">
            <div class="spinner"></div>
            <p>Opening secure payment...</p>
          </div>
          <script>
            function pay() {
              const handler = PaystackPop.setup({
                key: '${PAYSTACK_PUBLIC_KEY}',
                email: '${user.email}',
                amount: ${selectedPlan.price * 100},
                currency: 'NGN',
                ref: '${reference}',
                label: 'Spectra AI - ${selectedPlan.scans} Scans',
                callback: function(response) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    status: 'success',
                    reference: response.reference
                  }));
                },
                onClose: function() {
                  window.ReactNativeWebView.postMessage(JSON.stringify({ status: 'cancelled' }));
                }
              });
              handler.openIframe();
            }
            setTimeout(pay, 500);
          </script>
        </body>
        </html>
      `;

      setCheckoutUrl(html);
      setShowWebView(true);
    } catch (e: any) {
      Alert.alert('Error', e.message);
      errorFeedback();
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.status === 'cancelled') {
        setShowWebView(false);
        return;
      }

      if (data.status === 'success') {
        setProcessing(true);
        setShowWebView(false);

        // Verify with backend
        const { data: { session } } = await supabase.auth.getSession();
        const res = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/payment/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ reference: data.reference }),
          }
        );

        if (res.ok) {
          const result = await res.json();
          successFeedback();
          Alert.alert(
            '✅ Payment Successful',
            `${result.scans_added} scans added to your account!

New balance: ${result.new_total} scans`,
            [{ text: 'Awesome!', onPress: () => router.back() }]
          );
        } else {
          throw new Error('Verification failed');
        }
      }
    } catch (e: any) {
      errorFeedback();
      Alert.alert('Error', e.message || 'Payment verification failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BUY SCANS</Text>
          <View style={{ width: 24 }} />
        </View>

        <Text style={styles.introText}>
          Choose a scan pack to continue identifying minerals.
        </Text>

        {/* PLAN CARDS */}
        {PLANS.map((plan) => {
          const isSelected = selectedPlan.id === plan.id;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                isSelected && { borderColor: colors.gold, backgroundColor: colors.elevated },
              ]}
              onPress={() => {
                tapFeedback();
                setSelectedPlan(plan);
              }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={isSelected ? ['#1A1D24', '#0D1B2A'] : ['#111827', '#111827']}
                style={styles.planGradient}
              >
                {plan.badge && (
                  <View style={[styles.planBadge, { backgroundColor: plan.badge === 'POPULAR' ? colors.gold : colors.green }]}>
                    <Text style={styles.planBadgeText}>{plan.badge}</Text>
                  </View>
                )}
                <View style={styles.planRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planScans}>{plan.scans} Scans</Text>
                    <Text style={styles.planRate}>
                      ₦{(plan.price / plan.scans).toLocaleString()} per scan
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.planPrice, { color: isSelected ? colors.gold : colors.text }]}>
                      ₦{plan.price.toLocaleString()}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkCircle}>
                        <Ionicons name="checkmark" size={16} color="#000" />
                      </View>
                    )}
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}

        {/* BENEFITS */}
        <View style={styles.benefitsBox}>
          <Text style={styles.benefitsTitle}>What you get:</Text>
          {[
            'Instant AI mineral identification',
            'Regional GEOROC validation',
            'PDF report with QR verification',
            'Market value in ₦ & USD',
          ].map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={18} color={colors.green} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* PAY BUTTON */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₦{selectedPlan.price.toLocaleString()}</Text>
        </View>
        <Button
          title={processing ? 'PROCESSING...' : 'PAY NOW'}
          icon="💳"
          onPress={initiatePayment}
          disabled={processing}
          loading={processing}
        />
      </View>

      {/* PAYSTACK WEBVIEW MODAL */}
      <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <View style={styles.webviewHeader}>
            <Text style={styles.webviewTitle}>Secure Payment</Text>
            <TouchableOpacity onPress={() => setShowWebView(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <WebView
            ref={webViewRef}
            source={{ html: checkoutUrl }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webviewLoading}>
                <ActivityIndicator size="large" color={colors.gold} />
                <Text style={styles.webviewLoadingText}>Opening Paystack...</Text>
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, paddingBottom: 140 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 24,
  },
  headerTitle: {
    color: colors.text, fontSize: 14, fontWeight: '800',
    letterSpacing: 2, textTransform: 'uppercase',
  },
  introText: { color: colors.dim, fontSize: 15, marginBottom: 24, lineHeight: 22 },
  planCard: {
    borderRadius: 20, borderWidth: 2, borderColor: colors.border,
    marginBottom: 16, overflow: 'hidden',
  },
  planGradient: { padding: 20, position: 'relative' },
  planBadge: {
    position: 'absolute', top: 12, right: 12,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
  },
  planBadgeText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  planRow: { flexDirection: 'row', alignItems: 'center' },
  planScans: { color: colors.text, fontSize: 22, fontWeight: '900' },
  planRate: { color: colors.dim, fontSize: 12, marginTop: 4 },
  planPrice: { fontSize: 22, fontWeight: '900' },
  checkCircle: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: colors.gold, alignItems: 'center',
    justifyContent: 'center', marginTop: 8,
  },
  benefitsBox: {
    backgroundColor: colors.surface, borderRadius: 16,
    padding: 20, marginTop: 8, borderWidth: 1, borderColor: colors.border,
  },
  benefitsTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 14 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  benefitText: { color: colors.dim, fontSize: 14, flex: 1 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, padding: 20,
    paddingBottom: 32, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  totalLabel: { color: colors.dim, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  totalAmount: { color: colors.gold, fontSize: 24, fontWeight: '900', marginTop: 2 },
  webviewHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  webviewTitle: { color: colors.text, fontSize: 16, fontWeight: '700' },
  webviewLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg,
  },
  webviewLoadingText: { color: colors.dim, marginTop: 12 },
});
