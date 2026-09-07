import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { CreditCard, CheckCircle, Shield, X } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '../../config/theme';
import { useLanguage } from '../../context/LanguageContext';
import { ThriveInput } from '../common/ThriveInput';
import { ThriveButton } from '../common/ThriveButton';

interface OnlinePaymentModalProps {
  visible: boolean;
  amount: number;
  studentName: string;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export const OnlinePaymentModal: React.FC<OnlinePaymentModalProps> = ({
  visible,
  amount,
  studentName,
  onClose,
  onPaymentSuccess,
}) => {
  const { t } = useLanguage();

  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<{
    txId: string;
    date: string;
    amount: number;
  } | null>(null);

  if (!visible) return null;

  const handlePay = async () => {
    if (!cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      setErrorMessage(t('auth.emptyFields'));
      return;
    }
    setErrorMessage('');

    setLoading(true);
    // Simulate secure banking transaction latency
    setTimeout(() => {
      setLoading(false);
      const tx = {
        txId: `TX-${Math.floor(10000000 + Math.random() * 90000000)}`,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        amount,
      };
      setSuccessReceipt(tx);
      onPaymentSuccess();
    }, 1500);
  };

  const handleFinish = () => {
    setSuccessReceipt(null);
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setErrorMessage('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalSheet}>
              <View style={styles.sheetHandle} />

              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <View style={styles.iconCircle}>
                    <CreditCard size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.title}>{t('onlinePayment.modalTitle')}</Text>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {successReceipt ? (
                /* SUCCESS RECEIPT VIEW */
                <View style={styles.receiptContainer}>
                  <View style={styles.successIconCircle}>
                    <CheckCircle size={44} color={Colors.success} />
                  </View>
                  <Text style={styles.successTitle}>{t('onlinePayment.paymentSuccess')}</Text>

                  <View style={styles.receiptCard}>
                    <Text style={styles.receiptHeader}>{t('onlinePayment.receiptTitle')}</Text>

                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>{t('common.student')}:</Text>
                      <Text style={styles.receiptValue}>{studentName}</Text>
                    </View>

                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>{t('onlinePayment.transactionId')}</Text>
                      <Text style={styles.receiptCode}>{successReceipt.txId}</Text>
                    </View>

                    <View style={styles.receiptRow}>
                      <Text style={styles.receiptLabel}>{t('common.date')}:</Text>
                      <Text style={styles.receiptValue}>{successReceipt.date}</Text>
                    </View>

                    <View style={styles.receiptDivider} />

                    <View style={styles.receiptRow}>
                      <Text style={styles.totalLabel}>{t('student.paidAmount')}:</Text>
                      <Text style={styles.totalValue}>{successReceipt.amount} ₼</Text>
                    </View>
                  </View>

                  <ThriveButton
                    title={t('common.close')}
                    onPress={handleFinish}
                    variant="primary"
                    style={{ width: '100%', marginTop: Spacing.md }}
                  />
                </View>
              ) : (
                /* CARD ENTRY FORM VIEW */
                <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
                  {/* Amount Badge Banner */}
                  <View style={styles.amountBanner}>
                    <View>
                      <Text style={styles.amountLabel}>{t('student.remainingDebt')}</Text>
                      <Text style={styles.studentNameText}>{studentName}</Text>
                    </View>
                    <Text style={styles.amountValue}>{amount} ₼</Text>
                  </View>

                  {/* Card Inputs */}
                  <ThriveInput
                    label={t('onlinePayment.cardNumber')}
                    placeholder="4169 •••• •••• ••••"
                    keyboardType="number-pad"
                    value={cardNumber}
                    onChangeText={setCardNumber}
                    leftIcon={<CreditCard size={18} color={Colors.primary} />}
                  />

                  <ThriveInput
                    label={t('onlinePayment.cardHolder')}
                    placeholder="AD SOYAD"
                    autoCapitalize="characters"
                    value={cardHolder}
                    onChangeText={setCardHolder}
                  />

                  <View style={styles.dualRow}>
                    <View style={{ flex: 1 }}>
                      <ThriveInput
                        label={t('onlinePayment.expiry')}
                        placeholder="MM/YY"
                        keyboardType="number-pad"
                        value={expiry}
                        onChangeText={setExpiry}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThriveInput
                        label={t('onlinePayment.cvv')}
                        placeholder="•••"
                        secureTextEntry
                        keyboardType="number-pad"
                        value={cvv}
                        onChangeText={setCvv}
                      />
                    </View>
                  </View>

                  {!!errorMessage && (
                    <Text style={styles.errorText}>{errorMessage}</Text>
                  )}

                  <View style={styles.securityNote}>
                    <Shield size={16} color={Colors.success} />
                    <Text style={styles.securityText}>256-bit SSL Təhlükəsiz Bank Əməliyyatı</Text>
                  </View>

                  <ThriveButton
                    title={t('onlinePayment.payNow', { amount: String(amount) })}
                    onPress={handlePay}
                    loading={loading}
                    variant="primary"
                    size="lg"
                    style={{ marginTop: Spacing.md }}
                  />
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.cardElevated,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    maxHeight: '90%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.textMuted,
    alignSelf: 'center',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 162, 181, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    marginBottom: Spacing.sm,
  },
  amountBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F2744',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: 'rgba(76, 162, 181, 0.35)',
    marginBottom: Spacing.md,
  },
  amountLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  studentNameText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 2,
  },
  amountValue: {
    fontSize: 22,
    fontWeight: '900',
    color: Colors.primary,
  },
  dualRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.xs,
    justifyContent: 'center',
  },
  securityText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  receiptContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  successIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.success,
    marginBottom: Spacing.md,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: '#0F2744',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs + 2,
  },
  receiptHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptLabel: {
    fontSize: 13,
    color: Colors.textMuted,
  },
  receiptValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  receiptCode: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  receiptDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: Colors.success,
  },
});
